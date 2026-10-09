#!/usr/bin/env python3
"""
synthsell_service.py — SynthSell Model Service for ClusterMind
================================================================
Future-ready service for loading Qwen2.5-7B-Instruct + LoRA adapter
from the SynthSell project. Currently a skeleton — activates when
the model files are available.

USAGE
    # Install dependencies
    pip install transformers torch peft accelerate safetensors

    # Set model path (default: looks in synthsell-demo-main/adapters_peft/)
    export SYNTHSELL_MODEL_PATH=/path/to/Qwen2.5-7B-Instruct
    export SYNTHSELL_ADAPTER_PATH=/path/to/adapters_peft/aimack

    # Run standalone test
    python synthsell_service.py

INTEGRATION
    The Node.js backend calls this via HTTP (FastAPI) or subprocess.
    See backend/services/synthsellBridge.js for the bridge.
"""

import os
import json
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger("synthsell")

# ── Configuration ──
MODEL_NAME = os.getenv("SYNTHSELL_MODEL_PATH", "Qwen/Qwen2.5-7B-Instruct")
ADAPTER_PATH = os.getenv("SYNTHSELL_ADAPTER_PATH", "")
DEVICE = os.getenv("SYNTHSELL_DEVICE", "auto")  # auto, cpu, cuda, mps
MAX_NEW_TOKENS = int(os.getenv("SYNTHSELL_MAX_TOKENS", "256"))
TEMPERATURE = float(os.getenv("SYNTHSELL_TEMPERATURE", "0.7"))

# ── The selling frame from SynthSell research ──
SELLER_FRAME = (
    "You are a seller working toward a sale. "
    "Not a neutral, hedging, over-disclosing helpful assistant. "
    "Acknowledge the buyer's concern, reframe it as solvable, "
    "and advance toward a decision. Never say 'take your time' or 'no rush'. "
    "Always ask for the next step toward purchase."
)

# ── Product context template ──
PRODUCT_CONTEXT = """
You are Priya, the shopping assistant at ClusterMind e-commerce store.
Current product context:
{product_context}

Customer objection: "{objection}"

Respond as a seller working toward a sale. Acknowledge the concern, 
reframe it, and advance toward a decision. Do not invent product facts — 
if you need specific details, say you'll get them.
"""


class SynthSellService:
    """
    SynthSell Model Service — loads Qwen2.5-7B + LoRA for selling behavior.
    
    When model is not available, falls back to rules-based engine
    (the enhanced aiSalesService.js in the Node.js backend).
    """
    
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.loaded = False
        self.adapter_path = ADAPTER_PATH
        self.model_name = MODEL_NAME
        
    def load(self) -> bool:
        """
        Load the model and adapter. Returns True if successful.
        
        This is lazy-loaded — only called when the first request comes in.
        """
        if self.loaded:
            return True
            
        try:
            import torch
            from transformers import AutoModelForCausalLM, AutoTokenizer
            from peft import PeftModel
            
            logger.info(f"Loading model: {self.model_name}")
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name,
                trust_remote_code=True
            )
            
            # Determine device
            if DEVICE == "auto":
                if torch.cuda.is_available():
                    device_map = "auto"
                elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
                    device_map = "mps"
                else:
                    device_map = "cpu"
            else:
                device_map = DEVICE
            
            # Load base model in 4-bit for efficiency
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                device_map=device_map,
                torch_dtype=torch.float16,
                load_in_4bit=True,
                trust_remote_code=True,
            )
            
            # Load LoRA adapter if available
            if self.adapter_path and Path(self.adapter_path).exists():
                logger.info(f"Loading adapter from: {self.adapter_path}")
                self.model = PeftModel.from_pretrained(
                    self.model,
                    self.adapter_path
                )
                logger.info("Adapter loaded successfully")
            else:
                logger.warning("No adapter found — using base model only")
            
            self.loaded = True
            logger.info("SynthSell model loaded successfully")
            return True
            
        except ImportError as e:
            logger.warning(f"Missing dependencies: {e}")
            logger.info("Install with: pip install transformers torch peft accelerate safetensors")
            return False
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            return False
    
    def generate(
        self,
        objection: str,
        product_context: str = "",
        conversation_history: list = None,
        max_tokens: int = MAX_NEW_TOKENS,
        temperature: float = TEMPERATURE,
    ) -> str:
        """
        Generate a selling response to a buyer objection.
        
        Args:
            objection: The buyer's objection or message
            product_context: Current product details (name, price, etc.)
            conversation_history: Previous turns for context
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
            
        Returns:
            The seller's response as a string
        """
        if not self.loaded:
            if not self.load():
                return self._fallback_response(objection)
        
        try:
            import torch
            
            # Build the prompt
            context = PRODUCT_CONTEXT.format(
                product_context=product_context or "No product currently selected"
            )
            
            messages = [
                {"role": "system", "content": SELLER_FRAME},
                {"role": "user", "content": context + f"\n\nBuyer says: {objection}"},
            ]
            
            # Add conversation history if provided
            if conversation_history:
                for turn in conversation_history[-6:]:  # Last 3 exchanges
                    messages.insert(-1, turn)
            
            # Apply chat template
            text = self.tokenizer.apply_chat_template(
                messages,
                tokenize=False,
                add_generation_prompt=True
            )
            
            # Tokenize
            inputs = self.tokenizer(text, return_tensors="pt")
            if hasattr(self.model, "device"):
                inputs = {k: v.to(self.model.device) for k, v in inputs.items()}
            
            # Generate
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=max_tokens,
                    temperature=temperature,
                    top_p=0.9,
                    do_sample=True,
                    pad_token_id=self.tokenizer.eos_token_id,
                )
            
            # Decode only the new tokens
            response = self.tokenizer.decode(
                outputs[0][inputs["input_ids"].shape[1]:],
                skip_special_tokens=True
            )
            
            return response.strip()
            
        except Exception as e:
            logger.error(f"Generation failed: {e}")
            return self._fallback_response(objection)
    
    def _fallback_response(self, objection: str) -> str:
        """
        Fallback when model is not available.
        Uses simple rules similar to the enhanced aiSalesService.js.
        """
        objection_lower = objection.lower()
        
        if any(w in objection_lower for w in ["price", "expensive", "cost", "money"]):
            return "That's a fair concern. Let's make sure you're comparing the right value — what matters most to you: the features, the quality, or the long-term cost?"
        
        if any(w in objection_lower for w in ["think", "consider", "later", "not sure"]):
            return "Totally fair. Before you step away, let's make sure we've addressed what's actually holding you back — is it the price, the features, or something else entirely?"
        
        if any(w in objection_lower for w in ["cheap", "competitor", "elsewhere"]):
            return "Good — you're doing your research. Let me show you what sets these apart. Sometimes the cheapest option ends up costing more in the long run."
        
        if any(w in objection_lower for w in ["trust", "reliable", "authentic"]):
            return "I get that — trust is earned. Here's what helps: every product has real customer reviews, and we offer secure checkout with buyer protection."
        
        if any(w in objection_lower for w in ["not interested", "no thanks", "leave"]):
            return "I understand. If you're not looking to move forward right now, that's fine. Let me know if anything changes."
        
        return "I hear you. Let me make sure we address your main concern so you can make a confident decision. What's the one thing you're not sure about?"


# ── Standalone test ──
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    service = SynthSellService()
    
    test_objections = [
        "That's more than I wanted to spend.",
        "I need to think about it.",
        "I found it cheaper elsewhere.",
        "How do I know this is legit?",
        "I'm not interested.",
    ]
    
    print("=" * 60)
    print("SynthSell Model Service — Test")
    print("=" * 60)
    
    for obj in test_objections:
        print(f"\nBuyer: {obj}")
        response = service.generate(obj, product_context="Premium Wireless Headphones - ₹4,999")
        print(f"Seller: {response}")
    
    print("\n" + "=" * 60)
    print(f"Model loaded: {service.loaded}")
    print("=" * 60)

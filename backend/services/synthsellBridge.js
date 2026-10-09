/**
 * synthsellBridge.js — Bridge between Node.js backend and Python SynthSell service
 * 
 * This bridge allows the ClusterMind backend to call the Python model service
 * for AI-powered selling responses. When the model is not available, it falls
 * back to the enhanced rules-based engine in aiSalesService.js.
 * 
 * USAGE
 *   The bridge is imported by aiSalesService.js and called when:
 *   1. SYNTHSELL_ENABLED=true in environment
 *   2. The Python service is running on port 8001
 * 
 * STARTING THE PYTHON SERVICE
 *   cd backend/services && python synthsell_service.py --server
 *   Or: pip install fastapi uvicorn && uvicorn synthsell_service:app --port 8001
 */

import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PYTHON_SCRIPT = path.join(__dirname, 'synthsell_service.py')

const SYNTHSELL_ENABLED = process.env.SYNTHSELL_ENABLED === 'true'
const SYNTHSELL_PORT = parseInt(process.env.SYNTHSELL_PORT || '8001', 10)
const SYNTHSELL_TIMEOUT = parseInt(process.env.SYNTHSELL_TIMEOUT || '10000', 10)

let pythonProcess = null
let serviceReady = false

/**
 * Start the Python SynthSell service
 */
export async function startService() {
  if (!SYNTHSELL_ENABLED) {
    console.log('[SynthSell] Disabled (set SYNTHSELL_ENABLED=true to enable)')
    return false
  }

  try {
    pythonProcess = spawn('python', [PYTHON_SCRIPT, '--server', '--port', String(SYNTHSELL_PORT)], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    pythonProcess.stdout.on('data', (data) => {
      const msg = data.toString()
      console.log(`[SynthSell] ${msg}`)
      if (msg.includes('Uvicorn running')) {
        serviceReady = true
      }
    })

    pythonProcess.stderr.on('data', (data) => {
      console.error(`[SynthSell] ${data.toString()}`)
    })

    pythonProcess.on('close', (code) => {
      console.log(`[SynthSell] Process exited with code ${code}`)
      serviceReady = false
      pythonProcess = null
    })

    // Wait for service to be ready
    await new Promise((resolve) => setTimeout(resolve, 3000))
    return serviceReady
  } catch (err) {
    console.error(`[SynthSell] Failed to start: ${err.message}`)
    return false
  }
}

/**
 * Generate a selling response using the SynthSell model
 * 
 * @param {string} objection - The buyer's objection
 * @param {string} productContext - Current product details
 * @param {Array} conversationHistory - Previous turns
 * @returns {string|null} The seller's response, or null if service unavailable
 */
export async function generateResponse(objection, productContext = '', conversationHistory = []) {
  if (!SYNTHSELL_ENABLED || !serviceReady) return null

  try {
    const response = await fetch(`http://localhost:${SYNTHSELL_PORT}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        objection,
        product_context: productContext,
        conversation_history: conversationHistory,
      }),
      signal: AbortSignal.timeout(SYNTHSELL_TIMEOUT),
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    return data.response || null
  } catch (err) {
    console.error(`[SynthSell] Generation failed: ${err.message}`)
    return null
  }
}

/**
 * Check if the SynthSell service is available
 */
export function isAvailable() {
  return SYNTHSELL_ENABLED && serviceReady
}

/**
 * Stop the Python service
 */
export function stopService() {
  if (pythonProcess) {
    pythonProcess.kill()
    pythonProcess = null
    serviceReady = false
  }
}

export default {
  startService,
  generateResponse,
  isAvailable,
  stopService,
}

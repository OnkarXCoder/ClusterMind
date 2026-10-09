import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../../services/cart';
import { getCurrentUser } from '../../services/auth';
import { createAiSalesSession, sendAiSalesMessage } from '../../api';
import './AISalesperson.css';

/* ── Icons ── */
const CLOSE_ICON = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const MINIMIZE_ICON = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const SEND_ICON = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>;
const MIC_ICON = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>;
const CART_ICON = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>;
const HEART_ICON = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>;
const SHARE_ICON = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>;
const STAR_ICON = <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
const IMAGE_ICON = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>;
const DARK_ICON = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>;
const LIGHT_ICON = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>;
const CHECK_ICON = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="20 6 9 17 4 12" /></svg>;
const DOUBLE_CHECK = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="18 6 9 17 4 12" /><polyline points="22 6 13 17" /></svg>;

const AI_AVATAR = '👩‍💼';
const AI_NAME = 'Priya';
const AI_ROLE = 'Shopping Assistant';

const WELCOME_SUGGESTIONS = [
  { icon: '🔍', label: 'Find products', message: 'Help me find the right product' },
  { icon: '💡', label: 'Recommendations', message: 'Show me your top recommendations' },
  { icon: '🔄', label: 'Compare items', message: 'I want to compare products' },
  { icon: '🎁', label: 'Gift finder', message: 'Help me find a gift' },
];

const QUICK_SUGGESTIONS = [
  { icon: '🔥', label: 'Trending now', message: 'Show me trending products' },
  { icon: '💰', label: 'Best deals', message: 'What are the best deals today?' },
  { icon: '🆕', label: 'New arrivals', message: 'Show me new arrivals' },
  { icon: '📦', label: 'My orders', message: 'Where is my order?' },
];

function formatPrice(price) {
  return typeof price === 'number' ? `₹${price.toLocaleString('en-IN')}` : price || '₹0';
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// Capability check must not assume window exists (SSR / tests)
function getSpeechRecognition() {
  if (typeof window === 'undefined') return null;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  return SR ? new SR() : null;
}

export default function AISalesperson({ currentProductId, currentProductName, currentCategory, currentPrice }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [wishlisted, setWishlisted] = useState(new Set());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, scrollToBottom]);

  const initSession = useCallback(async () => {
    try {
      const user = getCurrentUser();
      const res = await createAiSalesSession({ customerId: user?.id });
      setSessionId(res.sessionId || res.data?.sessionId || 'session_' + Date.now());
    } catch {
      setSessionId('session_' + Date.now());
    }
  }, []);

  useEffect(() => {
    if (isOpen && !isMinimized && messages.length === 0) initSession();
    if (isOpen && !isMinimized) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen, isMinimized, messages.length, initSession]);

  useEffect(() => {
    if (isOpen && !isMinimized) setUnreadCount(0);
  }, [isOpen, isMinimized, messages.length]);

  async function handleSendMessage(text) {
    const msg = text || inputText.trim();
    if (!msg || isTyping) return;

    const userMsg = { id: 'user_' + Date.now(), role: 'user', content: msg, timestamp: Date.now(), status: 'sent' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate read receipt after delay
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, status: 'read' } : m));
    }, 1200);

    try {
      const res = await sendAiSalesMessage({
        sessionId,
        message: msg,
        currentProduct: currentProductId ? { id: currentProductId, name: currentProductName, category: currentCategory, price: currentPrice } : undefined,
      });

      const data = res.data || res;
      const aiMsg = {
        id: 'ai_' + Date.now(),
        role: 'ai',
        content: data.message || data.reply || data.content || "I'm here to help! Could you tell me more about what you're looking for?",
        products: data.products || null,
        comparison: data.comparison || null,
        action: data.action || null,
        quickReplies: data.quickReplies || data.quick_replies || null,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, aiMsg]);
      if (!isOpen || isMinimized) setUnreadCount(prev => prev + 1);
      if (aiMsg.action) handleAction(aiMsg.action);
    } catch {
      setMessages(prev => [...prev, {
        id: 'ai_err_' + Date.now(), role: 'ai',
        content: "Sorry, I had a little hiccup there! Could you try that again? I'm right here to help.",
        products: null, comparison: null, action: null,
        quickReplies: ['Try again', 'Help me find products'],
        timestamp: Date.now(),
      }]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleAction(action) {
    if (!action) return;
    const type = action.type || action;
    if (type === 'add_to_cart' && action.product) addToCart(action.product, action.quantity || 1);
    else if (type === 'view_product' && action.productId) navigate(`/products/${action.productId}`);
    else if (type === 'checkout') navigate('/checkout');
    else if (type === 'view_cart') navigate('/cart');
  }

  function handleAddToCart(product) {
    addToCart(product, 1);
    setMessages(prev => [...prev, {
      id: 'cart_' + Date.now(), role: 'ai',
      content: `Amazing pick! I've added **${product.name || product.title}** to your cart. Want me to find something else to go with it?`,
      products: null, comparison: null, action: null,
      quickReplies: ['Continue shopping', 'Go to checkout', 'Find matching items'],
      timestamp: Date.now(),
    }]);
  }

  function handleToggleWishlist(product) {
    const id = product.id || product._id;
    setWishlisted(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  function handleShareProduct(product) {
    const name = product.name || product.title;
    const price = formatPrice(product.price);
    if (navigator.share) {
      navigator.share({ title: name, text: `Check out ${name} for ${price} on ClusterMind!`, url: window.location.href });
    } else {
      navigator.clipboard?.writeText(`${name} - ${price} | ClusterMind`);
      setMessages(prev => [...prev, {
        id: 'share_' + Date.now(), role: 'ai',
        content: `I've copied the product link for **${name}** to your clipboard! Share it with friends.`,
        products: null, comparison: null, action: null, quickReplies: null, timestamp: Date.now(),
      }]);
    }
  }

  function handleViewProduct(product) { navigate(`/products/${product.id || product._id}`); }

  function stopListening() {
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) {
      try { recognition.stop(); } catch { /* already stopped */ }
    }
    setIsListening(false);
    setInterimText('');
  }

  function toggleVoice() {
    if (isListening) { stopListening(); return; }

    setVoiceError('');
    const recognition = getSpeechRecognition();
    if (!recognition) {
      setVoiceError('Voice input needs Chrome, Edge or Safari.');
      return;
    }

    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;   // live feedback while speaking
    recognition.lang = 'en-IN';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          const finalText = transcript.trim();
          stopListening();
          setInputText(finalText);
          if (finalText) handleSendMessage(finalText);
          return;
        }
        interim += transcript;
      }
      setInterimText(interim);
    };

    recognition.onerror = (event) => {
      setInterimText('');
      setIsListening(false);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setVoiceError('Microphone access was blocked. Allow it in your browser settings.');
      } else if (event.error === 'no-speech') {
        setVoiceError("I didn't catch that. Try again.");
      } else if (event.error !== 'aborted') {
        setVoiceError('Voice input hit an error. Please try again.');
      }
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
      setInterimText('');
    };

    // start() throws InvalidStateError if already running, so guard it
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setVoiceError("Voice input is already starting. Try again in a moment.");
    }
  }

  // Don't leave the mic open when the panel closes or the component unmounts
  useEffect(() => () => {
    const recognition = recognitionRef.current;
    if (recognition) { try { recognition.abort(); } catch { /* noop */ } }
  }, []);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  }

  function togglePanel() {
    if (isOpen) { setIsOpen(false); setIsMinimized(false); }
    else { setIsOpen(true); setIsMinimized(false); setUnreadCount(0); }
  }

  /* ── Render Product Card ── */
  function renderProductCard(product) {
    const name = product.name || product.title || 'Product';
    const price = product.price || 0;
    const oldPrice = product.oldPrice || product.originalPrice;
    const rating = product.rating || product.averageRating || 0;
    const image = product.image || product.thumbnail || product.images?.[0];
    const discount = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : null;
    const pid = product.id || product._id;
    const isWished = wishlisted.has(pid);

    return (
      <div className="ai-product-card" key={pid}>
        {image ? (
          <img className="ai-product-img" src={image} alt={name} />
        ) : (
          <div className="ai-product-img-placeholder">{IMAGE_ICON}</div>
        )}
        <div className="ai-product-info">
          <p className="ai-product-name">{name}</p>
          <div className="ai-product-meta">
            <span className="ai-product-price">{formatPrice(price)}</span>
            {oldPrice && <span className="ai-product-old-price">{formatPrice(oldPrice)}</span>}
            {discount && <span className="ai-product-discount">-{discount}%</span>}
          </div>
          {rating > 0 && <div className="ai-product-rating">{STAR_ICON} {rating.toFixed(1)}</div>}
          {product.category && <span className="ai-product-tag">{product.category}</span>}
          <div className="ai-product-actions">
            <button className="dm-btn dm-btn-primary dm-btn-sm" onClick={() => handleAddToCart(product)}>
              {CART_ICON} Add
            </button>
            <button className="dm-btn dm-btn-outline dm-btn-sm" onClick={() => handleViewProduct(product)}>
              View
            </button>
            <button
              className="dm-btn dm-btn-outline dm-btn-sm"
              style={{ color: isWished ? '#E11D48' : undefined, borderColor: isWished ? '#FECACA' : undefined }}
              onClick={() => handleToggleWishlist(product)}
              title={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {HEART_ICON}
            </button>
            <button className="dm-btn dm-btn-outline dm-btn-sm" onClick={() => handleShareProduct(product)} title="Share">
              {SHARE_ICON}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Render Product Grid ── */
  function renderProductGrid(products) {
    if (!products || products.length < 2) return null;
    const shown = products.slice(0, 4);
    return (
      <div className="ai-product-grid">
        {shown.map(p => {
          const name = p.name || p.title || 'Product';
          const price = p.price || 0;
          const image = p.image || p.thumbnail || p.images?.[0];
          return (
            <div className="ai-product-grid-card" key={p.id || p._id} onClick={() => handleViewProduct(p)}>
              {image ? (
                <img className="ai-product-grid-img" src={image} alt={name} />
              ) : (
                <div className="ai-product-grid-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>{IMAGE_ICON}</div>
              )}
              <p className="ai-product-grid-name">{name}</p>
              <span className="ai-product-grid-price">{formatPrice(price)}</span>
            </div>
          );
        })}
      </div>
    );
  }

  /* ── Render Comparison ── */
  function renderComparisonTable(comparison) {
    if (!comparison || (!comparison.products && !comparison.rows)) return null;
    const products = comparison.products || [];
    const rows = comparison.rows || [];
    const headers = comparison.headers || ['Feature', ...products.map(p => p.name || p.title)];
    return (
      <div className="ai-comparison">
        <table>
          <thead><tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.length > 0 ? rows.map((row, i) => (
              <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
            )) : products.map((p, i) => (
              <tr key={i}><td>{p.name || p.title}</td><td>{formatPrice(p.price)}</td><td>{p.rating ? `${p.rating.toFixed(1)} ⭐` : 'N/A'}</td><td>{p.category || 'N/A'}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  /* ── Render Message ── */
  function renderMessage(msg) {
    const isAI = msg.role === 'ai';
    return (
      <div className={`ai-msg ${isAI ? 'ai-msg-ai' : 'ai-msg-user'}`} key={msg.id}>
        <div className="ai-msg-avatar">
          {isAI ? AI_AVATAR : <span style={{ fontSize: '14px' }}>👤</span>}
        </div>
        <div className="ai-msg-content">
          <div className="ai-msg-bubble">{msg.content}</div>
          {msg.products && msg.products.length > 0 && (
            <>
              {msg.products.length >= 2 ? renderProductGrid(msg.products) : null}
              <div>{msg.products.map(renderProductCard)}</div>
            </>
          )}
          {msg.comparison && renderComparisonTable(msg.comparison)}
          {isAI && msg.quickReplies && msg.quickReplies.length > 0 && (
            <div className="ai-quick-replies">
              {msg.quickReplies.map((qr, i) => (
                <button key={i} className="ai-quick-reply" onClick={() => handleSendMessage(qr)}>{qr}</button>
              ))}
            </div>
          )}
          <div className="ai-msg-status">
            {msg.status === 'read' ? DOUBLE_CHECK : msg.status === 'sent' ? CHECK_ICON : null}
            {formatTime(msg.timestamp)}
          </div>
        </div>
      </div>
    );
  }

  /* ── Closed FAB ── */
  if (!isOpen) {
    return (
      <div className="ai-salesperson">
        <button className="ai-fab" onClick={togglePanel} aria-label="Chat with Priya">
          <div className="ai-fab-pulse" />
          <div className="ai-fab-pulse" />
          <span className="ai-fab-sparkle" />
          <span className="ai-fab-sparkle" />
          <span className="ai-fab-sparkle" />
          <span className="ai-fab-sparkle" />
          <div className="ai-fab-ring" />
          <div className="ai-fab-inner">
            <span className="ai-fab-avatar">{AI_AVATAR}</span>
          </div>
          {unreadCount > 0 && <span className="ai-fab-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </button>
        <div className="ai-fab-tooltip">Hi! Need help shopping? 💬</div>
      </div>
    );
  }

  const showWelcome = messages.length === 0;

  return (
    <div className="ai-salesperson">
      <div className={`ai-panel ${darkMode ? 'dark-mode' : ''}`}>
        {/* Header */}
        <div className="ai-panel-header">
          <div className="ai-avatar-wrapper">
            <div className="ai-avatar">{AI_AVATAR}</div>
            <div className="ai-avatar-ring" />
            <div className="ai-avatar-status" />
          </div>
          <div className="ai-header-info">
            <h4 className="ai-header-name">
              {AI_NAME} <span className="ai-header-verified">✓</span>
            </h4>
            <div className="ai-header-role">{AI_ROLE}</div>
            <div className="ai-header-status">
              <span className="ai-status-dot" />
              Online — typically replies instantly
            </div>
          </div>
          <div className="ai-header-actions">
            <button className="ai-header-btn" onClick={() => setDarkMode(!darkMode)} title={darkMode ? 'Light mode' : 'Dark mode'}>
              {darkMode ? LIGHT_ICON : DARK_ICON}
            </button>
            <button className="ai-header-btn" onClick={toggleVoice} title={isListening ? 'Stop listening' : 'Voice input'}>
              <span style={{ color: isListening ? '#FCA5A5' : 'inherit' }}>{MIC_ICON}</span>
            </button>
            <button className="ai-header-btn" onClick={() => setIsMinimized(true)} title="Minimize">{MINIMIZE_ICON}</button>
            <button className="ai-header-btn" onClick={togglePanel} title="Close">{CLOSE_ICON}</button>
          </div>
        </div>

        {/* Welcome Screen */}
        {showWelcome && (
          <div className="ai-welcome">
            <div className="ai-welcome-avatar">{AI_AVATAR}</div>
            <h3>Hey there! I&apos;m {AI_NAME} 👋</h3>
            <p>Your personal shopping assistant. I can help you find the perfect product, compare options, or snag the best deals.</p>
          </div>
        )}

        {/* Messages */}
        <div className="ai-messages">
          {messages.map(renderMessage)}
          {isTyping && (
            <div className="ai-typing">
              <div className="ai-typing-avatar">{AI_AVATAR}</div>
              <div className="ai-typing-bubble">
                <span className="ai-typing-dot" />
                <span className="ai-typing-dot" />
                <span className="ai-typing-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="ai-input-area">
          {messages.length <= 1 && (
            <div className="ai-suggestions">
              {QUICK_SUGGESTIONS.map((s, i) => (
                <button key={i} className="ai-suggestion" onClick={() => handleSendMessage(s.message)}>
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          )}
          {messages.length === 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
              {WELCOME_SUGGESTIONS.map((s, i) => (
                <button key={i} className="ai-suggestion" onClick={() => handleSendMessage(s.message)}>
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          )}
          {isListening && interimText && (
            <div className="ai-voice-interim">Listening… {interimText}</div>
          )}
          {voiceError && (
            <div className="ai-voice-error" role="alert">{voiceError}</div>
          )}
          <div className="ai-input-row">
            <input
              ref={inputRef}
              className="ai-input"
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? 'Listening…' : `Ask ${AI_NAME} anything...`}
              disabled={isTyping}
            />
            <button className={`ai-voice-btn ${isListening ? 'listening' : ''}`} onClick={toggleVoice} title={isListening ? 'Stop' : 'Voice input'}>
              {MIC_ICON}
            </button>
            <button className="ai-send-btn" onClick={() => handleSendMessage()} disabled={!inputText.trim() || isTyping}>
              {SEND_ICON}
            </button>
          </div>
          <div className="ai-powered">Powered by ClusterMind AI</div>
        </div>
      </div>
    </div>
  );
}

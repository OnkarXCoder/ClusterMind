const BASE = '/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('clustermind_token')
  if (token?.startsWith('fake-jwt-')) {
    throw new Error('Backend authentication is unavailable for the current local session.')
  }
  const { headers, ...requestOptions } = options
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    ...requestOptions,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('clustermind_token')
      localStorage.removeItem('clustermind_user')
    }
    throw new Error(data.message || 'Something went wrong. Please try again.')
  }
  return data
}

export function registerUser(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function loginUser(identifier, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  })
}

export function sendPasswordResetOtp(email) {
  return request('/auth/forgot-password/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export function verifyPasswordResetOtp(email, otp) {
  return request('/auth/forgot-password/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  })
}

export function resetPassword(resetToken, password) {
  return request('/auth/forgot-password/reset', {
    method: 'POST',
    body: JSON.stringify({ resetToken, password }),
  })
}

async function mlRequest(path, options) {
  try {
    return await request(path, options)
  } catch {
    return null
  }
}

export function ensureDataset(force = false) {
  return mlRequest(`/ml/dataset/ensure?force=${force}`, { method: 'POST' })
}

export function syncCustomerDataset() {
  return mlRequest('/ml/dataset/sync-customers', { method: 'POST' })
}

export function getDataset() {
  return mlRequest('/ml/dataset')
}

export function deleteDataset() {
  return mlRequest('/ml/dataset', { method: 'DELETE' })
}

export async function uploadDataset(file) {
  const text = await file.text()
  return mlRequest('/ml/dataset/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'text/csv' },
    body: text,
  })
}

export function trainModel(algorithm, clusters = 5) {
  return mlRequest('/ml/train', {
    method: 'POST',
    body: JSON.stringify({ algorithm, clusters }),
  })
}

export function getModels() {
  return mlRequest('/ml/models')
}

export function getSegments(options = {}) {
  const qs = new URLSearchParams(
    Object.entries(options).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ).toString()
  return mlRequest(`/ml/segments${qs ? `?${qs}` : ''}`)
}

export function getBehaviour() {
  return mlRequest('/ml/behaviour')
}

export function generateRecommendations() {
  return mlRequest('/ml/recommendations/generate', { method: 'POST' })
}

export function getRecommendations(type = 'product') {
  return mlRequest(`/ml/recommendations?type=${type}`)
}

function adminRequest(path, options) {
  try {
    return request(path, options)
  } catch {
    return null
  }
}

export function getAdminOverview() {
  return adminRequest('/admin/overview')
}

export function getAdminCustomers(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return adminRequest(`/admin/customers${qs ? `?${qs}` : ''}`)
}

export function getAdminCustomer(customerId) {
  return adminRequest(`/admin/customers/${customerId}`)
}

export function updateAdminCustomerStatus(customerId, status) {
  return adminRequest(`/admin/customers/${customerId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function getAdminProducts() {
  return adminRequest('/admin/products')
}

export function createAdminProduct(payload) {
  return adminRequest('/admin/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateAdminProduct(id, payload) {
  return adminRequest(`/admin/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteAdminProduct(id) {
  return adminRequest(`/admin/products/${id}`, {
    method: 'DELETE',
  })
}

export function getAdminOrders() {
  return adminRequest('/admin/orders')
}

export function updateAdminOrderStatus(orderId, status) {
  return adminRequest(`/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function getAdminRefunds() {
  return adminRequest('/admin/refunds')
}

export function updateAdminRefundStatus(id, status) {
  return adminRequest(`/admin/refunds/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function getAdminFeedback() {
  return adminRequest('/admin/feedback')
}

export function updateAdminFeedbackStatus(id, status) {
  return adminRequest(`/admin/feedback/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function getAdminNotifications() {
  return adminRequest('/admin/notifications')
}

export function createAdminNotification(payload) {
  return adminRequest('/admin/notifications', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getAdminCampaigns() {
  return adminRequest('/admin/campaigns')
}

export function createAdminCampaign(payload) {
  return adminRequest('/admin/campaigns', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getAdminTeamUsers() {
  return adminRequest('/admin/team-users')
}

export function createAdminTeamUser(payload) {
  return adminRequest('/admin/team-users', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateAdminTeamUserStatus(userId, status) {
  return adminRequest(`/admin/team-users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function updateAdminTeamUser(userId, payload) {
  return adminRequest(`/admin/team-users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteAdminTeamUser(userId) {
  return adminRequest(`/admin/team-users/${userId}`, {
    method: 'DELETE',
  })
}

export function getAdminActivityLogs() {
  return adminRequest('/admin/activity-logs')
}

export function getAdminMlModels() {
  return adminRequest('/admin/ml-models')
}

export function getAdminBehaviour() {
  return adminRequest('/admin/analytics/behaviour')
}

export function getAdminSegmentation() {
  return adminRequest('/admin/analytics/segmentation')
}

export function getAdminRecommendations() {
  return adminRequest('/admin/analytics/recommendations')
}

export function getAdminReports() {
  return adminRequest('/admin/reports')
}

let marketingApiKey = null

export function setMarketingApiKey(key) {
  marketingApiKey = key
}

export function getMarketingApiKey() {
  return marketingApiKey
}

async function marketingRequest(path, options = {}) {
  const key = marketingApiKey || localStorage.getItem('marketing_api_key')
  if (!key) throw new Error('Marketing API key not set. Call setMarketingApiKey() or login as marketing user.')
  const headers = {
    'Content-Type': 'application/json',
    'X-API-Key': key,
    ...options.headers,
  }
  try {
    const res = await fetch(`${BASE}/marketing${path}`, {
      headers,
      ...options,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.message || 'Marketing API error')
    }
    return data
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      return null
    }
    throw err
  }
}

export function getMarketingOverview() {
  return marketingRequest('/overview')
}

export function getMarketingCampaigns(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return marketingRequest(`/campaigns${qs ? `?${qs}` : ''}`)
}

export function getMarketingCampaign(id) {
  return marketingRequest(`/campaigns/${id}`)
}

export function createMarketingCampaign(payload) {
  return marketingRequest('/campaigns', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateMarketingCampaign(id, payload) {
  return marketingRequest(`/campaigns/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteMarketingCampaign(id) {
  return marketingRequest(`/campaigns/${id}`, {
    method: 'DELETE',
  })
}

export function getMarketingCoupons(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return marketingRequest(`/coupons${qs ? `?${qs}` : ''}`)
}

export function createMarketingCoupon(payload) {
  return marketingRequest('/coupons', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getMarketingOffers(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return marketingRequest(`/offers${qs ? `?${qs}` : ''}`)
}

export function createMarketingOffer(payload) {
  return marketingRequest('/offers', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function deleteMarketingCoupon(id) {
  return marketingRequest(`/coupons/${id}`, {
    method: 'DELETE',
  })
}

export function getMarketingLoyalty(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return marketingRequest(`/loyalty${qs ? `?${qs}` : ''}`)
}

export function createMarketingLoyalty(payload) {
  return marketingRequest('/loyalty', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function deleteMarketingLoyalty(id) {
  return marketingRequest(`/loyalty/${id}`, {
    method: 'DELETE',
  })
}

export function getMarketingSegments() {
  return marketingRequest('/segments')
}

export function getMarketingBehaviors(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return marketingRequest(`/behaviors${qs ? `?${qs}` : ''}`)
}

export function getMarketingRecommendations(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return marketingRequest(`/recommendations${qs ? `?${qs}` : ''}`)
}

export function getMarketingProducts(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return marketingRequest(`/products${qs ? `?${qs}` : ''}`)
}

export function getMarketingReports() {
  return marketingRequest('/reports')
}

export function getMarketingProfile() {
  return marketingRequest('/me')
}

export function regenerateMarketingApiKey() {
  return marketingRequest('/api-key/regenerate', {
    method: 'POST',
  })
}

// AI Sales Agent
export function createAiSalesSession(customerId) {
  return request('/ai-sales/session', { method: 'POST', body: JSON.stringify({ customerId }) })
}

export function sendAiSalesMessage(payload) {
  return request('/ai-sales/chat', { method: 'POST', body: JSON.stringify(payload) })
}

export function getAiSalesRecommendations(criteria) {
  return request('/ai-sales/recommend', { method: 'POST', body: JSON.stringify(criteria) })
}

export function compareAiSalesProducts(productIds) {
  return request('/ai-sales/compare', { method: 'POST', body: JSON.stringify({ productIds }) })
}

export function createAiSalesHandoff(payload) {
  return request('/ai-sales/handoff', { method: 'POST', body: JSON.stringify(payload) })
}

export function getAiSalesAnalytics() {
  return request('/ai-sales/analytics')
}

// Orders
export function getOrders(all = false) {
  return request(`/orders${all ? '?all=true' : ''}`)
}

export function getOrderById(orderId) {
  return request(`/orders/${orderId}`)
}

export function createOrder(payload) {
  return request('/orders', { method: 'POST', body: JSON.stringify(payload) })
}

// Payments (Razorpay)
export function getPaymentConfig() {
  return request('/payments/config')
}

export function createPaymentOrder(orderId) {
  return request('/payments/create-order', { method: 'POST', body: JSON.stringify({ orderId }) })
}

export function verifyPayment(payload) {
  return request('/payments/verify', { method: 'POST', body: JSON.stringify(payload) })
}

// Returns & refunds
export function getReturnRequests() {
  return request('/returns')
}

export function getReturnRequest(id) {
  return request(`/returns/${id}`)
}

export function createReturnRequest(payload) {
  return request('/returns', { method: 'POST', body: JSON.stringify(payload) })
}

export function cancelReturnRequest(id) {
  return request(`/returns/${id}/cancel`, { method: 'PATCH' })
}

import { supabase } from './supabase'

// Direct Supabase KB access (KB is publicly readable, no backend needed)
const sbKb = {
  list: async (filters = {}) => {
    let q = supabase.from('kb_entries').select('id,title,summary,topic,skill_level,call_stages,source,example_script,full_content')
    if (filters.topic) q = q.eq('topic', filters.topic)
    if (filters.skill_level) q = q.eq('skill_level', filters.skill_level)
    const { data } = await q.order('title').limit(100)
    return data || []
  },
  search: async (term) => {
    const { data } = await supabase.from('kb_entries')
      .select('id,title,summary,topic,skill_level,call_stages')
      .ilike('title', `%${term}%`)
      .limit(20)
    return data || []
  },
  get: async (id) => {
    const { data } = await supabase.from('kb_entries').select('*').eq('id', id).single()
    return data
  },
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return {}
  return { Authorization: `Bearer ${session.access_token}` }
}

async function request(path, options = {}) {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...headers, ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

export const api = {
  // Auth
  getMe: () => request('/auth/me'),

  // Scenarios
  getScenarios: (filters = {}) => {
    const params = new URLSearchParams(filters)
    return request(`/scenarios?${params}`)
  },
  getRandomScenario: (mode) => request(`/scenarios/random?mode=${mode}`),
  getScenario: (id) => request(`/scenarios/${id}`),

  // Calls
  startCall: (payload) => request('/calls/start', { method: 'POST', body: JSON.stringify(payload) }),
  endCall: (id) => request(`/calls/${id}/end`, { method: 'POST' }),
  getCall: (id) => request(`/calls/${id}`),
  getCallHistory: (page = 1) => request(`/calls/history?page=${page}`),
  getHint: (id, context) => request(`/calls/${id}/hints`, { method: 'POST', body: JSON.stringify({ context }) }),
  getPitch: (id) => request(`/calls/${id}/pitch`),

  // SEEZ Card
  getCard: (userId) => request(`/card/${userId}`),

  // Knowledge Base — tries backend first, falls back to direct Supabase
  getKbEntries: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters)
      return await request(`/kb?${params}`)
    } catch {
      return sbKb.list(filters)
    }
  },
  getKbEntry: async (id) => {
    try { return await request(`/kb/${id}`) }
    catch { return sbKb.get(id) }
  },
  searchKb: async (query) => {
    try { return await request(`/kb/search?q=${encodeURIComponent(query)}`) }
    catch { return sbKb.search(query) }
  },
  getRecommendedKb: async () => {
    try { return await request('/kb/recommended') }
    catch { return [] }
  },
  bookmarkKb: (id) => request(`/kb/bookmark/${id}`, { method: 'POST' }),
  getBookmarkedKb: async () => {
    try { return await request('/kb/bookmarked') }
    catch { return [] }
  },

  // Call history
  deleteHistory: () => request('/calls/history', { method: 'DELETE' }),

  // Products
  getProducts: () => request('/products'),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Payments
  createCheckout: (tier) => request('/payments/checkout', { method: 'POST', body: JSON.stringify({ tier }) }),
  getBillingPortal: () => request('/payments/portal'),
}

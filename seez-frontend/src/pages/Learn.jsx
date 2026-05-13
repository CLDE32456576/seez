import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Bookmark, BookmarkCheck } from 'lucide-react'
import { api } from '../lib/api'

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'opening', label: 'Opening' },
  { id: 'rapport', label: 'Rapport' },
  { id: 'discovery', label: 'Discovery' },
  { id: 'objection', label: 'Objection' },
  { id: 'closing', label: 'Closing' },
  { id: 'negotiation', label: 'Negotiation' },
  { id: 'psychology', label: 'Psychology' },
]

const SKILL_LEVELS = ['all', 'beginner', 'intermediate', 'advanced']
const SKILL_COLORS = { beginner: '#8e9192', intermediate: '#c8c6c5', advanced: '#dcc662' }

const TABS = [
  { id: 'all', label: 'All Concepts' },
  { id: 'recommended', label: 'Recommended' },
  { id: 'bookmarked', label: 'Bookmarked' },
]

function parseFullContent(raw) {
  if (!raw) return {}
  const sections = {}
  const parts = raw.split('\n\n')
  for (const part of parts) {
    const colonIdx = part.indexOf(':')
    if (colonIdx > 0) {
      const key = part.slice(0, colonIdx).trim()
      const value = part.slice(colonIdx + 1).trim()
      sections[key] = value
    }
  }
  return sections
}

export default function Learn() {
  const [tab, setTab] = useState('all')
  const [entries, setEntries] = useState([])
  const [recommended, setRecommended] = useState([])
  const [bookmarked, setBookmarked] = useState([])
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set())
  const [category, setCategory] = useState('all')
  const [skill, setSkill] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [fullEntry, setFullEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    loadEntries()
    loadRecommended()
    loadBookmarked()
  }, [])

  useEffect(() => {
    if (tab === 'all' && search.length < 2) loadEntries()
  }, [category, skill])

  const loadEntries = async () => {
    setLoading(true)
    try {
      const filters = {}
      if (category !== 'all') filters.topic = category
      if (skill !== 'all') filters.skill_level = skill
      const data = await api.getKbEntries(filters)
      setEntries(Array.isArray(data) ? data : [])
    } catch {
      setEntries([])
    } finally {
      setLoading(false)
    }
  }

  const loadRecommended = async () => {
    try {
      const data = await api.getRecommendedKb()
      setRecommended(Array.isArray(data) ? data : [])
    } catch {
      setRecommended([])
    }
  }

  const loadBookmarked = async () => {
    try {
      const data = await api.getBookmarkedKb()
      const list = Array.isArray(data) ? data : []
      setBookmarked(list)
      setBookmarkedIds(new Set(list.map((e) => e.id)))
    } catch {
      setBookmarked([])
    }
  }

  const handleSelect = async (entry) => {
    setSelected(entry)
    setFullEntry(null)
    setLoadingDetail(true)
    try {
      const full = await api.getKbEntry(entry.id)
      setFullEntry(full || entry)
    } catch {
      setFullEntry(entry)
    } finally {
      setLoadingDetail(false)
    }
  }

  const toggleBookmark = async (e, entryId) => {
    e.stopPropagation()
    try {
      await api.bookmarkKb(entryId)
      const newIds = new Set(bookmarkedIds)
      if (newIds.has(entryId)) newIds.delete(entryId)
      else newIds.add(entryId)
      setBookmarkedIds(newIds)
      loadBookmarked()
    } catch {}
  }

  const handleSearch = async (q) => {
    setSearch(q)
    if (q.length < 2) { loadEntries(); return }
    try {
      const data = await api.searchKb(q)
      setEntries(Array.isArray(data) ? data : [])
    } catch {}
  }

  const activeList = tab === 'recommended' ? recommended : tab === 'bookmarked' ? bookmarked : entries
  const filtered = tab !== 'all' ? activeList : activeList

  const displayEntry = fullEntry || selected
  const sections = displayEntry ? parseFullContent(displayEntry.full_content) : {}

  return (
    <div className="p-8 md:p-12 max-w-[1060px] mx-auto">
      <div className="mb-10">
        <h1 className="font-display text-4xl text-[#c8c6c5]">Academy</h1>
        <p className="font-mono-data text-xs text-[#8e9192] mt-1">100 sales and psychology concepts. Study what matters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          {/* Tabs */}
          <div className="flex gap-0 border border-[#444748]/30">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex-1 label-caps py-3 transition-colors text-center relative"
                style={tab === t.id
                  ? { background: 'var(--bg-card)', color: 'var(--text-hi)' }
                  : { background: 'transparent', color: 'var(--text-mid)' }
                }
              >
                {t.label}
                {t.id === 'bookmarked' && bookmarkedIds.size > 0 && (
                  <span className="absolute top-2 right-1 font-mono-data" style={{ fontSize: '9px', color: '#dcc662' }}>{bookmarkedIds.size}</span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e9192]" />
            <input
              type="text"
              placeholder="Search concepts..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full border focus:border-[#dcc662]/40 focus:outline-none transition-colors font-mono-data text-sm"
              style={{ paddingLeft: '2.5rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', background: 'var(--bg-card)', borderColor: 'var(--border-lo)', color: 'var(--text-hi)' }}
            />
          </div>

          {/* Filters — only in All tab */}
          {tab === 'all' && (
            <>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className="label-caps px-3 py-1.5 border transition-colors"
                    style={category === c.id
                      ? { borderColor: 'rgba(220,198,98,0.4)', background: 'rgba(220,198,98,0.08)', color: '#dcc662' }
                      : { borderColor: 'var(--border-lo)', background: 'var(--bg-input)', color: 'var(--text-mid)' }
                    }
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-0 border border-[#444748]/30">
                {SKILL_LEVELS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSkill(s)}
                    className="flex-1 label-caps py-2.5 transition-colors capitalize"
                    style={skill === s
                      ? { background: 'var(--bg-hover)', color: 'var(--text-hi)' }
                      : { background: 'transparent', color: 'var(--text-mid)' }
                    }
                  >
                    {s === 'all' ? 'All' : s}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Entry list */}
          <div className="flex flex-col gap-1.5" style={{ maxHeight: '58vh', overflowY: 'auto' }}>
            {loading && tab === 'all' ? (
              [1,2,3,4,5,6].map((i) => (
                <div key={i} className="border border-[#444748]/20 bg-[#1e2020] p-4 animate-pulse">
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="h-3 rounded bg-[#2a2c2d] w-3/4" />
                    <div className="h-4 w-5 rounded bg-[#2a2c2d] flex-shrink-0" />
                  </div>
                  <div className="h-2 rounded bg-[#2a2c2d] w-full mb-1.5" />
                  <div className="h-2 rounded bg-[#2a2c2d] w-2/3" />
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center">
                <span className="material-symbols-outlined text-3xl text-[#444748] block mb-2">menu_book</span>
                <p className="font-mono-data text-xs text-[#8e9192]">
                  {tab === 'bookmarked'
                    ? 'No bookmarks yet.'
                    : tab === 'recommended'
                    ? 'Complete a call to get recommendations.'
                    : 'No entries found'}
                </p>
              </div>
            ) : filtered.map((entry) => (
              // div instead of button to avoid <button> nested inside <button> (bookmark)
              <div
                key={entry.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelect(entry)}
                onKeyDown={(e) => e.key === 'Enter' && handleSelect(entry)}
                className="w-full text-left border p-4 transition-all group cursor-pointer"
                style={selected?.id === entry.id
                  ? { borderColor: 'rgba(220,198,98,0.3)', background: 'rgba(220,198,98,0.05)' }
                  : { borderColor: 'var(--border-lo)', background: 'var(--bg-card)' }
                }
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-header text-sm font-medium text-[#c8c6c5] leading-tight text-left">{entry.title}</p>
                  <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                    <span
                      className="label-caps px-1.5 py-0.5 border"
                      style={{ color: SKILL_COLORS[entry.skill_level], borderColor: `${SKILL_COLORS[entry.skill_level]}25`, background: `${SKILL_COLORS[entry.skill_level]}08`, fontSize: '8px' }}
                    >
                      {entry.skill_level?.[0]?.toUpperCase()}
                    </span>
                    <button
                      onClick={(e) => toggleBookmark(e, entry.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {bookmarkedIds.has(entry.id)
                        ? <BookmarkCheck size={13} style={{ color: '#dcc662' }} />
                        : <Bookmark size={13} style={{ color: '#8e9192' }} />
                      }
                    </button>
                  </div>
                </div>
                <p className="font-mono-data text-[11px] text-[#8e9192] mt-1.5 line-clamp-2 text-left">{entry.summary}</p>
              </div>
            ))}
          </div>

          {tab === 'all' && !loading && (
            <p className="font-mono-data text-[10px] text-[#8e9192]/50 text-center">{filtered.length} concepts</p>
          )}
        </div>

        {/* Right: Detail */}
        <div className="lg:col-span-2">
          {displayEntry ? (
            <div className="border border-[#444748]/30 bg-[#1e2020] p-10 space-y-8 sticky top-6 relative">
              {loadingDetail && (
                <div className="absolute inset-0 bg-[#1e2020]/80 flex items-center justify-center z-10">
                  <svg className="animate-spin h-5 w-5 text-[#dcc662]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              )}

              {/* Header */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="label-caps px-2 py-1 border"
                    style={{ color: SKILL_COLORS[displayEntry.skill_level], borderColor: `${SKILL_COLORS[displayEntry.skill_level]}30`, background: `${SKILL_COLORS[displayEntry.skill_level]}08` }}
                  >
                    {displayEntry.skill_level}
                  </span>
                  <span className="label-caps text-[#8e9192] capitalize">{displayEntry.topic}</span>
                  <button
                    onClick={(e) => toggleBookmark(e, displayEntry.id)}
                    className="ml-auto flex items-center gap-2 label-caps transition-colors"
                    style={{ color: bookmarkedIds.has(displayEntry.id) ? '#dcc662' : '#8e9192' }}
                  >
                    {bookmarkedIds.has(displayEntry.id)
                      ? <><BookmarkCheck size={14} /> Saved</>
                      : <><Bookmark size={14} /> Save</>
                    }
                  </button>
                </div>
                <h2 className="font-display text-2xl font-semibold text-[#c8c6c5] mb-3">{displayEntry.title}</h2>
                <p className="font-mono-data text-xs text-[#8e9192] leading-relaxed">{displayEntry.summary}</p>
                {displayEntry.source && (
                  <p className="font-mono-data mt-2" style={{ fontSize: '10px', color: '#444748' }}>Source: {displayEntry.source}</p>
                )}
              </div>

              {sections['Core Idea'] && (
                <div>
                  <p className="label-caps text-[#8e9192] mb-3" style={{ fontSize: '9px' }}>CORE IDEA</p>
                  <p className="font-mono-data text-xs text-[#c8c6c5] leading-relaxed">{sections['Core Idea']}</p>
                </div>
              )}

              {sections['Why It Works'] && (
                <div>
                  <p className="label-caps text-[#8e9192] mb-3" style={{ fontSize: '9px' }}>WHY IT WORKS</p>
                  <p className="font-mono-data text-xs text-[#8e9192] leading-relaxed">{sections['Why It Works']}</p>
                </div>
              )}

              {sections['How to Apply'] && (
                <div>
                  <p className="label-caps text-[#8e9192] mb-3" style={{ fontSize: '9px' }}>HOW TO APPLY</p>
                  <p className="font-mono-data text-xs text-[#8e9192] leading-relaxed">{sections['How to Apply']}</p>
                </div>
              )}

              {displayEntry.example_script && (
                <div>
                  <p className="label-caps text-[#8e9192] mb-3" style={{ fontSize: '9px' }}>EXAMPLE SCRIPT</p>
                  <div className="border-l-2 border-[#dcc662]/40 pl-5 py-1" style={{ background: 'rgba(220,198,98,0.02)' }}>
                    <p className="font-mono-data text-xs text-[#c8c6c5] italic leading-relaxed">"{displayEntry.example_script}"</p>
                  </div>
                </div>
              )}

              {sections['Common Mistakes'] && (
                <div>
                  <p className="label-caps text-[#8e9192] mb-3" style={{ fontSize: '9px' }}>COMMON MISTAKES</p>
                  <div className="border border-[#8B2222]/15 p-4" style={{ background: 'rgba(139,34,34,0.02)' }}>
                    <p className="font-mono-data text-xs text-[#8e9192] leading-relaxed">{sections['Common Mistakes']}</p>
                  </div>
                </div>
              )}

              {displayEntry.call_stages?.length > 0 && (
                <div>
                  <p className="label-caps text-[#8e9192] mb-3" style={{ fontSize: '9px' }}>BEST USED IN</p>
                  <div className="flex flex-wrap gap-2">
                    {displayEntry.call_stages.map((s) => (
                      <span key={s} className="border border-[#444748]/30 bg-[#1a1c1c] px-3 py-1 font-mono-data text-xs text-[#c8c6c5]">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-[#444748]/20">
                <Link to="/practice" className="label-caps text-[#dcc662] hover:text-[#c9b452] transition-colors">
                  Practice this concept in a simulation →
                </Link>
              </div>
            </div>
          ) : (
            <div className="border border-[#444748]/30 bg-[#1e2020] p-20 flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-5xl text-[#444748] mb-4">menu_book</span>
              <p className="font-header text-base font-medium text-[#c8c6c5] mb-2">Select a concept</p>
              <p className="font-mono-data text-xs text-[#8e9192]">Click any entry to read the full concept, psychology, and example script.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

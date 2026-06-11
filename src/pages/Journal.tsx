import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { 
  NotebookPen, 
  Plus, 
  Sparkles, 
  Heart,
  Calendar,
  BookOpen,
  ArrowRight,
  Loader,
  Star,
  Search,
  X
} from 'lucide-react'

interface JournalEntry {
  id: string
  title: string
  content: string | null
  mood: string | null
  scripture_reference: string | null
  entry_type: string
  tags: string[]
  is_favorite: boolean
  entry_date: string
  created_at: string
  updated_at: string
}

function Journal() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    fetchEntries()
  }, [user])

  useEffect(() => {
    filterEntries()
  }, [entries, searchQuery, filterType])

  const fetchEntries = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      setEntries(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load journal entries')
    } finally {
      setLoading(false)
    }
  }

  const filterEntries = () => {
    let filtered = [...entries]

    // Filter by type
    if (filterType !== 'all') {
      if (filterType === 'favorites') {
        filtered = filtered.filter(e => e.is_favorite)
      } else {
        filtered = filtered.filter(e => e.entry_type === filterType)
      }
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(query) ||
        e.content?.toLowerCase().includes(query) ||
        e.scripture_reference?.toLowerCase().includes(query) ||
        e.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    setFilteredEntries(filtered)
  }

  // Stats
  const totalEntries = entries.length
  const favoriteEntries = entries.filter(e => e.is_favorite).length
  
  // Get current streak (consecutive days)
  const getCurrentStreak = () => {
    if (entries.length === 0) return 0
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const uniqueDates = [...new Set(entries.map(e => e.entry_date))].sort().reverse()
    
    let streak = 0
    let checkDate = new Date(today)
    
    for (const dateStr of uniqueDates) {
      const entryDate = new Date(dateStr)
      entryDate.setHours(0, 0, 0, 0)
      
      const diffDays = Math.floor((checkDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays === streak) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
    
    return streak
  }

  const streak = getCurrentStreak()

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  // Mood styling
  const getMoodEmoji = (mood: string | null) => {
    if (!mood) return '📝'
    switch (mood) {
      case 'joyful': return '😊'
      case 'peaceful': return '☮️'
      case 'grateful': return '🙏'
      case 'reflective': return '💭'
      case 'struggling': return '😔'
      case 'hopeful': return '🌟'
      case 'worshipful': return '🎵'
      case 'broken': return '💔'
      case 'inspired': return '🔥'
      default: return '📝'
    }
  }

  // Entry type styling
  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'reflection': return 'bg-blue-100 text-blue-700'
      case 'prayer': return 'bg-purple-100 text-purple-700'
      case 'praise': return 'bg-yellow-100 text-yellow-700'
      case 'gratitude': return 'bg-pink-100 text-pink-700'
      case 'lesson': return 'bg-green-100 text-green-700'
      case 'devotional': return 'bg-indigo-100 text-indigo-700'
      case 'fasting': return 'bg-orange-100 text-orange-700'
      case 'testimony': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const entryTypes = [
    { value: 'all', label: 'All Entries', emoji: '📚' },
    { value: 'favorites', label: 'Favorites', emoji: '⭐' },
    { value: 'reflection', label: 'Reflection', emoji: '💭' },
    { value: 'prayer', label: 'Prayer', emoji: '🙏' },
    { value: 'praise', label: 'Praise', emoji: '🎤' },
    { value: 'gratitude', label: 'Gratitude', emoji: '❤️' },
    { value: 'lesson', label: 'Lesson', emoji: '📚' },
    { value: 'devotional', label: 'Devotional', emoji: '📖' },
    { value: 'fasting', label: 'Fasting', emoji: '🤲' },
    { value: 'testimony', label: 'Testimony', emoji: '✨' },
  ]

  return (
    <div className="min-h-screen p-6 md:p-10">
      
      {/* Header */}
      <div className="mb-10 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-gold-500" size={20} />
            <span className="text-sm font-body text-gold-600 font-semibold uppercase tracking-wider">
              Devotional Journal
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-brand-blue mb-3">
            Your Spiritual Journey
          </h1>
          <p className="text-gray-600 text-lg font-body max-w-2xl">
            Document your walk with God. Capture lessons, prayers, and praise reports.
          </p>
        </div>

        {/* Create Button */}
        <Link
          to="/journal/new"
          className="flex items-center gap-2 bg-brand-blue text-white font-body font-bold px-6 py-3 rounded-xl hover:bg-primary-700 transition-all duration-300 hover:scale-105 shadow-lg"
        >
          <Plus size={20} />
          New Entry
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
              <NotebookPen className="text-white" size={20} />
            </div>
            <p className="text-gray-500 text-sm font-body">Total Entries</p>
          </div>
          <p className="text-3xl font-heading font-bold text-brand-blue">{totalEntries}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Heart className="text-white" size={20} />
            </div>
            <p className="text-gray-500 text-sm font-body">Day Streak</p>
          </div>
          <p className="text-3xl font-heading font-bold text-brand-blue">
            {streak} {streak === 1 ? 'day' : 'days'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
              <Star className="text-white" size={20} />
            </div>
            <p className="text-gray-500 text-sm font-body">Favorites</p>
          </div>
          <p className="text-3xl font-heading font-bold text-brand-blue">{favoriteEntries}</p>
        </div>

      </div>

      {/* Search and Filter Bar */}
      {entries.length > 0 && (
        <div className="mb-6 flex flex-col md:flex-row gap-3">
          
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your entries..."
              className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue font-body"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Filter Dropdown */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue font-body min-w-[180px]"
          >
            {entryTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.emoji} {type.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Entries List */}
      <div>
        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Loader className="text-brand-blue animate-spin mx-auto mb-4" size={32} />
            <p className="text-gray-600 font-body">Loading your journal...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl">
            <p className="font-body">{error}</p>
          </div>
        )}

        {/* Empty State - No entries at all */}
        {!loading && !error && entries.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mb-4">
              <NotebookPen className="text-white" size={36} />
            </div>
            <h3 className="text-2xl font-heading font-bold text-brand-blue mb-2">
              Begin Your Journey
            </h3>
            <p className="text-gray-600 font-body mb-6 max-w-md mx-auto">
              Your spiritual journey deserves to be documented. 
              Start with your first entry today.
            </p>
            <Link
              to="/journal/new"
              className="inline-flex items-center gap-2 bg-brand-blue text-white font-body font-bold px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors"
            >
              <Plus size={20} />
              Write Your First Entry
            </Link>
          </div>
        )}

        {/* Empty State - Filtered results */}
        {!loading && !error && entries.length > 0 && filteredEntries.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Search className="text-gray-400 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-heading font-bold text-brand-blue mb-2">
              No Entries Found
            </h3>
            <p className="text-gray-600 font-body">
              Try a different search or filter
            </p>
          </div>
        )}

        {/* Entries Grid */}
        {!loading && !error && filteredEntries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map((entry) => (
              <Link
                key={entry.id}
                to={`/journal/${entry.id}`}
                className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-gold-300 transition-all duration-300"
              >
                {/* Header: Type Badge + Favorite */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-body font-semibold px-3 py-1 rounded-full ${getTypeStyle(entry.entry_type)}`}>
                    {entry.entry_type.charAt(0).toUpperCase() + entry.entry_type.slice(1)}
                  </span>
                  {entry.is_favorite && (
                    <Star className="text-yellow-500 fill-yellow-500" size={16} />
                  )}
                </div>

                {/* Mood */}
                {entry.mood && (
                  <div className="text-3xl mb-2">{getMoodEmoji(entry.mood)}</div>
                )}

                {/* Title */}
                <h3 className="text-xl font-heading font-bold text-brand-blue mb-2 line-clamp-2">
                  {entry.title}
                </h3>

                {/* Content Preview */}
                {entry.content && (
                  <p className="text-gray-600 text-sm font-body mb-3 line-clamp-3 leading-relaxed">
                    {entry.content}
                  </p>
                )}

                {/* Scripture */}
                {entry.scripture_reference && (
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="text-gold-600" size={14} />
                    <p className="text-gold-700 text-sm font-scripture italic">
                      {entry.scripture_reference}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {entry.tags.slice(0, 3).map((tag) => (
                      <span 
                        key={tag}
                        className="inline-block bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-body"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Date */}
                <div className="flex items-center gap-2 text-gray-500 text-xs font-body mt-4 pt-4 border-t border-gray-100">
                  <Calendar size={12} />
                  {formatDate(entry.entry_date)}
                </div>

                {/* Arrow */}
                <div className="flex items-center text-brand-blue font-body font-semibold text-sm mt-3 group-hover:text-gold-600 transition-colors">
                  Read Entry
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Scripture Footer */}
      <div className="mt-12 p-8 bg-gradient-to-br from-brand-blue to-primary-900 rounded-2xl text-center">
        <p className="text-gold-500 font-scripture text-xl italic mb-2">
          "This is the day which the LORD hath made; we will rejoice and be glad in it."
        </p>
        <p className="text-white font-body text-sm opacity-80">
          — Psalm 118:24 (KJV)
        </p>
      </div>

    </div>
  )
}

export default Journal
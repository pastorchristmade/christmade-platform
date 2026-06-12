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
  X,
  Sun
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

interface Devotional {
  id: string
  title: string
  scripture_reference: string
  scripture_text: string
  topic: string | null
  publish_date: string
  author_name: string | null
}

function Journal() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([])
  const [todayDevotional, setTodayDevotional] = useState<Devotional | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingDevotional, setLoadingDevotional] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    fetchEntries()
    fetchTodayDevotional()
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

  const fetchTodayDevotional = async () => {
    try {
      setLoadingDevotional(true)
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('devotionals')
        .select('id, title, scripture_reference, scripture_text, topic, publish_date, author_name')
        .eq('publish_date', today)
        .eq('status', 'published')
        .single()

      if (!error && data) {
        setTodayDevotional(data)
      }
    } catch (err) {
      // No devotional today - that's okay
    } finally {
      setLoadingDevotional(false)
    }
  }

  const filterEntries = () => {
    let filtered = [...entries]

    if (filterType !== 'all') {
      if (filterType === 'favorites') {
        filtered = filtered.filter(e => e.is_favorite)
      } else {
        filtered = filtered.filter(e => e.entry_type === filterType)
      }
    }

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

  const totalEntries = entries.length
  const favoriteEntries = entries.filter(e => e.is_favorite).length
  
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

  // Get today's date nicely formatted
  const todayFormatted = new Date().toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <div className="min-h-screen p-6 md:p-10">
      
      {/* Header */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
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
            Document your walk with God. Read today's devotional and capture your reflections.
          </p>
        </div>

        <Link
          to="/journal/new"
          className="flex items-center gap-2 bg-brand-blue text-white font-body font-bold px-6 py-3 rounded-xl hover:bg-primary-700 transition-all duration-300 hover:scale-105 shadow-lg"
        >
          <Plus size={20} />
          New Entry
        </Link>
      </div>

      {/* TODAY'S DEVOTIONAL - HIGHLIGHTED AT TOP */}
      {!loadingDevotional && todayDevotional && (
        <div className="mb-8">
          <Link 
            to={`/devotional/${todayDevotional.id}`}
            className="block bg-gradient-to-br from-brand-blue via-primary-700 to-primary-900 rounded-2xl p-6 md:p-8 text-white hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]"
          >
            <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Sun className="text-gold-500" size={24} />
                <span className="text-sm font-body text-gold-500 font-semibold uppercase tracking-wider">
                  Today's Devotional
                </span>
              </div>
              <span className="text-xs font-body text-primary-200">
                {todayFormatted}
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-3">
              {todayDevotional.title}
            </h2>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
              <p className="text-lg font-scripture italic text-white mb-2 leading-relaxed">
                "{todayDevotional.scripture_text}"
              </p>
              <p className="text-gold-500 font-body font-semibold text-sm">
                — {todayDevotional.scripture_reference} (KJV)
              </p>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                {todayDevotional.topic && (
                  <span className="inline-block bg-gold-500 text-brand-blue px-3 py-1 rounded-full text-xs font-body font-bold">
                    {todayDevotional.topic}
                  </span>
                )}
                {todayDevotional.author_name && (
                  <span className="text-sm font-body text-primary-200">
                    by {todayDevotional.author_name}
                  </span>
                )}
              </div>
              
              <div className="flex items-center text-gold-500 font-body font-semibold text-sm">
                Read Full Devotional
                <ArrowRight size={16} className="ml-2" />
              </div>
            </div>
          </Link>
        </div>
      )}

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

      {/* Browse Devotionals Link */}
      <div className="mb-8">
        <Link 
          to="/devotionals"
          className="inline-flex items-center gap-2 text-brand-blue font-body font-semibold hover:text-gold-600 transition-colors"
        >
          <BookOpen size={18} />
          Browse All Devotionals
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Search and Filter Bar */}
      {entries.length > 0 && (
        <div className="mb-6 flex flex-col md:flex-row gap-3">
          
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

      {/* My Entries Header */}
      <h2 className="text-2xl font-heading font-bold text-brand-blue mb-6">
        Your Journal Entries
      </h2>

      {/* Entries List */}
      <div>
        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Loader className="text-brand-blue animate-spin mx-auto mb-4" size={32} />
            <p className="text-gray-600 font-body">Loading your journal...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl">
            <p className="font-body">{error}</p>
          </div>
        )}

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

        {!loading && !error && filteredEntries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map((entry) => (
              <Link
                key={entry.id}
                to={`/journal/${entry.id}`}
                className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-gold-300 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-body font-semibold px-3 py-1 rounded-full ${getTypeStyle(entry.entry_type)}`}>
                    {entry.entry_type.charAt(0).toUpperCase() + entry.entry_type.slice(1)}
                  </span>
                  {entry.is_favorite && (
                    <Star className="text-yellow-500 fill-yellow-500" size={16} />
                  )}
                </div>

                {entry.mood && (
                  <div className="text-3xl mb-2">{getMoodEmoji(entry.mood)}</div>
                )}

                <h3 className="text-xl font-heading font-bold text-brand-blue mb-2 line-clamp-2">
                  {entry.title}
                </h3>

                {entry.content && (
                  <p className="text-gray-600 text-sm font-body mb-3 line-clamp-3 leading-relaxed">
                    {entry.content}
                  </p>
                )}

                {entry.scripture_reference && (
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="text-gold-600" size={14} />
                    <p className="text-gold-700 text-sm font-scripture italic">
                      {entry.scripture_reference}
                    </p>
                  </div>
                )}

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

                <div className="flex items-center gap-2 text-gray-500 text-xs font-body mt-4 pt-4 border-t border-gray-100">
                  <Calendar size={12} />
                  {formatDate(entry.entry_date)}
                </div>

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
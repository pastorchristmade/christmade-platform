import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { useSermonSeries } from '../hooks/useSermonSeries'
import SermonSeriesManager from '../components/SermonSeriesManager'
import { 
  PenTool, 
  Plus, 
  Sparkles, 
  FileText, 
  CheckCircle, 
  Mic, 
  Calendar,
  BookOpen,
  ArrowRight,
  Loader,
  Clock,
  AlertCircle,
  BookMarked,
  Settings
} from 'lucide-react'

interface Sermon {
  id: string
  title: string
  theme: string | null
  scripture_reference: string | null
  status: 'draft' | 'completed' | 'preached'
  preached_date: string | null
  scheduled_date: string | null
  service_type: string | null
  series_id: string | null
  series_part: number | null
  created_at: string
  updated_at: string
}

function Sermon() {
  const { user } = useAuth()
  const { series, loading: seriesLoading } = useSermonSeries()
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showSeriesManager, setShowSeriesManager] = useState(false)
  const [selectedSeriesFilter, setSelectedSeriesFilter] = useState<string>('all')

  useEffect(() => {
    fetchSermons()
  }, [user])

  const fetchSermons = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('sermons')
        .select('id, title, theme, scripture_reference, status, preached_date, scheduled_date, service_type, series_id, series_part, created_at, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setSermons(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load sermons')
    } finally {
      setLoading(false)
    }
  }

  // ─── Stats ───
  const totalSermons = sermons.length
  const drafts = sermons.filter(s => s.status === 'draft').length
  const preached = sermons.filter(s => s.status === 'preached').length

  // ─── Calendar logic ───
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]

  const upcomingSermons = sermons
    .filter(s => s.scheduled_date && s.scheduled_date >= todayStr && s.status !== 'preached')
    .sort((a, b) => (a.scheduled_date || '').localeCompare(b.scheduled_date || ''))

  const nextSermon = upcomingSermons[0]

  // ─── Filter sermons by selected series ───
  const filteredSermons = selectedSeriesFilter === 'all'
    ? sermons
    : selectedSeriesFilter === 'standalone'
    ? sermons.filter(s => !s.series_id)
    : sermons.filter(s => s.series_id === selectedSeriesFilter)

  // Days until
  const getDaysUntil = (dateStr: string) => {
    const target = new Date(dateStr)
    target.setHours(0, 0, 0, 0)
    const diff = Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'TODAY'
    if (diff === 1) return 'Tomorrow'
    if (diff < 7) return `${diff} days`
    if (diff < 30) return `${Math.floor(diff / 7)} week${Math.floor(diff / 7) === 1 ? '' : 's'}`
    return `${Math.floor(diff / 30)} month${Math.floor(diff / 30) === 1 ? '' : 's'}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatScheduledDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700'
      case 'completed':
        return 'bg-blue-100 text-blue-700'
      case 'preached':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText size={12} />
      case 'completed':
        return <CheckCircle size={12} />
      case 'preached':
        return <Mic size={12} />
      default:
        return null
    }
  }

  // ─── Get series name by id ───
  const getSeriesById = (id: string | null) => {
    if (!id) return null
    return series.find(s => s.id === id) || null
  }

  return (
    <>
      <div className="min-h-screen p-6 md:p-10">
        
        {/* Header */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="text-gold-500" size={20} />
              <span className="text-sm font-body text-gold-600 font-semibold uppercase tracking-wider">
                Sermon Architect
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-brand-blue mb-3">
              Your Sermons
            </h1>
            <p className="text-gray-600 text-lg font-body max-w-2xl">
              Build powerful, scripture-rooted sermons that transform lives.
            </p>
          </div>

          <Link
            to="/sermon/new"
            className="flex items-center gap-2 bg-brand-blue text-white font-body font-bold px-6 py-3 rounded-xl hover:bg-primary-700 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <Plus size={20} />
            Create New Sermon
          </Link>
        </div>

        {/* Next Sermon Banner */}
        {!loading && nextSermon && (
          <Link
            to={`/sermon/${nextSermon.id}`}
            className="block mb-6 group"
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-blue via-blue-900 to-primary-900 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-brand-gold">
              <div className="absolute top-2 right-2 opacity-10">
                <Calendar className="w-32 h-32 text-brand-gold" />
              </div>

              <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gold-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="text-gold-500" size={24} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gold-500 text-xs font-bold uppercase tracking-wider">
                        Next Sermon
                      </span>
                      <span className="px-2 py-0.5 bg-gold-500 text-brand-blue text-[10px] font-bold rounded-full uppercase tracking-wider">
                        {getDaysUntil(nextSermon.scheduled_date!)}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-heading font-bold text-white mb-1 line-clamp-1">
                      {nextSermon.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="text-blue-200">
                        📅 {formatScheduledDate(nextSermon.scheduled_date!)}
                      </span>
                      {nextSermon.service_type && (
                        <span className="px-2 py-0.5 bg-white/10 rounded-full text-blue-100 text-xs">
                          {nextSermon.service_type}
                        </span>
                      )}
                      {nextSermon.status === 'draft' && (
                        <span className="inline-flex items-center gap-1 text-yellow-300 text-xs">
                          <AlertCircle size={12} />
                          Still in draft
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-gold text-brand-blue rounded-lg font-bold text-sm group-hover:bg-yellow-300 transition-colors shadow-md">
                  Open Sermon
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <PenTool className="text-white" size={18} />
              </div>
              <p className="text-gray-500 text-xs font-body">Total</p>
            </div>
            <p className="text-2xl font-heading font-bold text-brand-blue">{totalSermons}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                <FileText className="text-white" size={18} />
              </div>
              <p className="text-gray-500 text-xs font-body">Drafts</p>
            </div>
            <p className="text-2xl font-heading font-bold text-brand-blue">{drafts}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                <Mic className="text-white" size={18} />
              </div>
              <p className="text-gray-500 text-xs font-body">Preached</p>
            </div>
            <p className="text-2xl font-heading font-bold text-brand-blue">{preached}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <BookMarked className="text-white" size={18} />
              </div>
              <p className="text-gray-500 text-xs font-body">Series</p>
            </div>
            <p className="text-2xl font-heading font-bold text-brand-blue">{series.length}</p>
          </div>

        </div>

        {/* ═══════════════════════════════════════════════════════════
            SERIES SECTION
            ═══════════════════════════════════════════════════════════ */}
        {!seriesLoading && series.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <BookMarked className="text-brand-blue" size={20} />
                <h2 className="text-xl font-heading font-bold text-brand-blue">
                  Your Sermon Series
                </h2>
                <span className="text-sm text-gray-500 font-body">
                  ({series.length})
                </span>
              </div>
              <button
                onClick={() => setShowSeriesManager(true)}
                className="inline-flex items-center gap-1 text-xs text-brand-blue font-body font-semibold hover:text-gold-600 transition-colors"
              >
                <Settings size={12} />
                Manage Series
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {series.map((s) => {
                const progress = s.total_parts > 0 ? ((s.sermon_count || 0) / s.total_parts) * 100 : 0
                const isComplete = (s.sermon_count || 0) >= s.total_parts
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSeriesFilter(s.id)}
                    className="text-left bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group"
                  >
                    <div className={`h-2 bg-gradient-to-r ${s.color}`} />
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <h3 className="font-heading font-bold text-brand-blue line-clamp-1 flex-1">
                          {s.name}
                        </h3>
                        {isComplete && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">
                            Complete
                          </span>
                        )}
                      </div>
                      {s.description && (
                        <p className="text-xs text-gray-600 font-body line-clamp-2 mb-3">
                          {s.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-body text-gray-500">
                          {s.sermon_count || 0} of {s.total_parts} parts
                        </span>
                        <span className="text-[11px] font-bold text-brand-blue">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${s.color} transition-all duration-500`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-brand-blue font-body font-semibold mt-2 group-hover:text-gold-600 transition-colors">
                        View sermons in this series →
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* If no series yet — gentle prompt */}
        {!seriesLoading && series.length === 0 && sermons.length > 0 && (
          <div className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <BookMarked className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="font-heading font-bold text-brand-blue text-sm">
                    Group your sermons into series
                  </p>
                  <p className="text-xs text-gray-600 font-body">
                    Organize multi-part teachings like "The Beatitudes" or "Walking in Faith"
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSeriesManager(true)}
                className="inline-flex items-center gap-1.5 bg-brand-blue text-white font-body font-bold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
              >
                <Plus size={14} />
                Create Series
              </button>
            </div>
          </div>
        )}

        {/* Upcoming Schedule */}
        {!loading && upcomingSermons.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-brand-blue" size={20} />
              <h2 className="text-xl font-heading font-bold text-brand-blue">
                Upcoming Schedule
              </h2>
              <span className="text-sm text-gray-500 font-body">
                ({upcomingSermons.length} sermon{upcomingSermons.length === 1 ? '' : 's'})
              </span>
            </div>

            <div className="space-y-2">
              {upcomingSermons.slice(0, 5).map((sermon) => (
                <Link
                  key={sermon.id}
                  to={`/sermon/${sermon.id}`}
                  className="block group"
                >
                  <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md hover:border-gold-300 transition-all">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-14 h-14 bg-brand-blue/5 rounded-lg flex flex-col items-center justify-center">
                          <span className="text-[10px] text-brand-blue font-bold uppercase">
                            {new Date(sermon.scheduled_date!).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-xl font-heading font-bold text-brand-blue leading-tight">
                            {new Date(sermon.scheduled_date!).getDate()}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-heading font-bold text-brand-blue line-clamp-1">
                            {sermon.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-xs text-gray-500 font-body">
                              {formatScheduledDate(sermon.scheduled_date!)}
                            </span>
                            {sermon.service_type && (
                              <span className="text-xs text-brand-blue font-body">
                                • {sermon.service_type}
                              </span>
                            )}
                            <span className={`inline-flex items-center gap-1 text-[10px] font-body font-semibold px-2 py-0.5 rounded-full ${getStatusBadge(sermon.status)}`}>
                              {getStatusIcon(sermon.status)}
                              {sermon.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-brand-blue bg-blue-50 px-3 py-1 rounded-full">
                          {getDaysUntil(sermon.scheduled_date!)}
                        </span>
                        <ArrowRight className="text-gray-400 group-hover:text-brand-blue transition-colors" size={16} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            ALL SERMONS WITH SERIES FILTER
            ═══════════════════════════════════════════════════════════ */}
        <div>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="text-2xl font-heading font-bold text-brand-blue">
              {selectedSeriesFilter === 'all' 
                ? 'All Sermons' 
                : selectedSeriesFilter === 'standalone'
                ? 'Standalone Sermons'
                : `${getSeriesById(selectedSeriesFilter)?.name || 'Series'} — Sermons`}
            </h2>

            {/* Series Filter */}
            {series.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedSeriesFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-body font-semibold transition-colors ${
                    selectedSeriesFilter === 'all'
                      ? 'bg-brand-blue text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-blue'
                  }`}
                >
                  All ({sermons.length})
                </button>
                <button
                  onClick={() => setSelectedSeriesFilter('standalone')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-body font-semibold transition-colors ${
                    selectedSeriesFilter === 'standalone'
                      ? 'bg-brand-blue text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-blue'
                  }`}
                >
                  Standalone ({sermons.filter(s => !s.series_id).length})
                </button>
              </div>
            )}
          </div>

          {loading && (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <Loader className="text-brand-blue animate-spin mx-auto mb-4" size={32} />
              <p className="text-gray-600 font-body">Loading your sermons...</p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl">
              <p className="font-body">{error}</p>
            </div>
          )}

          {!loading && !error && sermons.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mb-4">
                <PenTool className="text-white" size={36} />
              </div>
              <h3 className="text-2xl font-heading font-bold text-brand-blue mb-2">
                No Sermons Yet
              </h3>
              <p className="text-gray-600 font-body mb-6 max-w-md mx-auto">
                Start building your first sermon. Let the Holy Spirit guide your words 
                as you prepare to feed the flock of God.
              </p>
              <Link
                to="/sermon/new"
                className="inline-flex items-center gap-2 bg-brand-blue text-white font-body font-bold px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors"
              >
                <Plus size={20} />
                Create Your First Sermon
              </Link>
            </div>
          )}

          {!loading && !error && sermons.length > 0 && filteredSermons.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <p className="text-gray-600 font-body mb-3">No sermons in this series yet.</p>
              <button
                onClick={() => setSelectedSeriesFilter('all')}
                className="inline-flex items-center gap-2 text-brand-blue font-body font-semibold hover:text-gold-600 transition-colors"
              >
                ← Show all sermons
              </button>
            </div>
          )}

          {!loading && !error && filteredSermons.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSermons.map((sermon) => {
                const sermonSeries = getSeriesById(sermon.series_id)
                return (
                  <Link
                    key={sermon.id}
                    to={`/sermon/${sermon.id}`}
                    className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-gold-300 transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Series color stripe */}
                    {sermonSeries && (
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${sermonSeries.color}`} />
                    )}

                    <div className="flex items-center justify-between mb-4 mt-1">
                      <span className={`inline-flex items-center gap-1 text-xs font-body font-semibold px-3 py-1 rounded-full ${getStatusBadge(sermon.status)}`}>
                        {getStatusIcon(sermon.status)}
                        {sermon.status.charAt(0).toUpperCase() + sermon.status.slice(1)}
                      </span>
                      {sermon.scheduled_date && sermon.scheduled_date >= todayStr && (
                        <span className="text-[10px] text-brand-blue font-bold bg-blue-50 px-2 py-0.5 rounded-full">
                          📅 {getDaysUntil(sermon.scheduled_date)}
                        </span>
                      )}
                    </div>

                    {/* Series badge */}
                    {sermonSeries && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <BookMarked className="text-purple-500" size={12} />
                        <span className="text-[11px] text-purple-700 font-body font-semibold">
                          {sermonSeries.name}
                          {sermon.series_part && ` • Part ${sermon.series_part}`}
                        </span>
                      </div>
                    )}

                    <h3 className="text-xl font-heading font-bold text-brand-blue mb-2 line-clamp-2">
                      {sermon.title}
                    </h3>

                    {sermon.theme && (
                      <p className="text-gray-600 text-sm font-body mb-3 line-clamp-2">
                        {sermon.theme}
                      </p>
                    )}

                    {sermon.scripture_reference && (
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="text-gold-600" size={14} />
                        <p className="text-gold-700 text-sm font-scripture italic">
                          {sermon.scripture_reference}
                        </p>
                      </div>
                    )}

                    {sermon.scheduled_date && (
                      <div className="flex items-center gap-2 text-brand-blue text-xs font-body mb-2">
                        <Calendar size={12} />
                        <span className="font-semibold">
                          {formatScheduledDate(sermon.scheduled_date)}
                        </span>
                        {sermon.service_type && (
                          <span className="text-gray-500">• {sermon.service_type}</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-500 text-xs font-body mt-4 pt-4 border-t border-gray-100">
                      <Calendar size={12} />
                      Updated {formatDate(sermon.updated_at)}
                    </div>

                    <div className="flex items-center text-brand-blue font-body font-semibold text-sm mt-3 group-hover:text-gold-600 transition-colors">
                      Open Sermon
                      <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Scripture Footer */}
        <div className="mt-12 p-8 bg-gradient-to-br from-brand-blue to-primary-900 rounded-2xl text-center">
          <p className="text-gold-500 font-scripture text-xl italic mb-2">
            "Preach the word; be instant in season, out of season; reprove, rebuke, exhort with all longsuffering and doctrine."
          </p>
          <p className="text-white font-body text-sm opacity-80">
            — 2 Timothy 4:2 (KJV)
          </p>
        </div>

      </div>

      {/* Series Manager Modal */}
      <SermonSeriesManager
        isOpen={showSeriesManager}
        onClose={() => setShowSeriesManager(false)}
      />
    </>
  )
}

export default Sermon
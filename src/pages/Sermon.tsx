import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
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
  Loader
} from 'lucide-react'

interface Sermon {
  id: string
  title: string
  theme: string | null
  scripture_reference: string | null
  status: 'draft' | 'completed' | 'preached'
  preached_date: string | null
  created_at: string
  updated_at: string
}

function Sermon() {
  const { user } = useAuth()
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSermons()
  }, [user])

  const fetchSermons = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('sermons')
        .select('id, title, theme, scripture_reference, status, preached_date, created_at, updated_at')
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

  // Calculate stats
  const totalSermons = sermons.length
  const drafts = sermons.filter(s => s.status === 'draft').length
  const preached = sermons.filter(s => s.status === 'preached').length

  // Format date helper
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  // Status badge styling
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

  return (
    <div className="min-h-screen p-10">
      
      {/* Header */}
      <div className="mb-10 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-gold-500" size={20} />
            <span className="text-sm font-body text-gold-600 font-semibold uppercase tracking-wider">
              Sermon Architect
            </span>
          </div>
          <h1 className="text-5xl font-heading font-bold text-brand-blue mb-3">
            Your Sermons
          </h1>
          <p className="text-gray-600 text-lg font-body max-w-2xl">
            Build powerful, scripture-rooted sermons that transform lives.
          </p>
        </div>

        {/* Create Button */}
        <Link
          to="/sermon/new"
          className="flex items-center gap-2 bg-brand-blue text-white font-body font-bold px-6 py-3 rounded-xl hover:bg-primary-700 transition-all duration-300 hover:scale-105 shadow-lg"
        >
          <Plus size={20} />
          Create New Sermon
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <PenTool className="text-white" size={20} />
            </div>
            <p className="text-gray-500 text-sm font-body">Total Sermons</p>
          </div>
          <p className="text-3xl font-heading font-bold text-brand-blue">{totalSermons}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
              <FileText className="text-white" size={20} />
            </div>
            <p className="text-gray-500 text-sm font-body">Drafts</p>
          </div>
          <p className="text-3xl font-heading font-bold text-brand-blue">{drafts}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
              <Mic className="text-white" size={20} />
            </div>
            <p className="text-gray-500 text-sm font-body">Preached</p>
          </div>
          <p className="text-3xl font-heading font-bold text-brand-blue">{preached}</p>
        </div>

      </div>

      {/* Sermons List */}
      <div>
        <h2 className="text-2xl font-heading font-bold text-brand-blue mb-6">
          Your Sermon Library
        </h2>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Loader className="text-brand-blue animate-spin mx-auto mb-4" size={32} />
            <p className="text-gray-600 font-body">Loading your sermons...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl">
            <p className="font-body">{error}</p>
          </div>
        )}

        {/* Empty State */}
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

        {/* Sermons Grid */}
        {!loading && !error && sermons.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sermons.map((sermon) => (
              <Link
                key={sermon.id}
                to={`/sermon/${sermon.id}`}
                className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-gold-300 transition-all duration-300"
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center gap-1 text-xs font-body font-semibold px-3 py-1 rounded-full ${getStatusBadge(sermon.status)}`}>
                    {getStatusIcon(sermon.status)}
                    {sermon.status.charAt(0).toUpperCase() + sermon.status.slice(1)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-heading font-bold text-brand-blue mb-2 line-clamp-2">
                  {sermon.title}
                </h3>

                {/* Theme */}
                {sermon.theme && (
                  <p className="text-gray-600 text-sm font-body mb-3 line-clamp-2">
                    {sermon.theme}
                  </p>
                )}

                {/* Scripture Reference */}
                {sermon.scripture_reference && (
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="text-gold-600" size={14} />
                    <p className="text-gold-700 text-sm font-scripture italic">
                      {sermon.scripture_reference}
                    </p>
                  </div>
                )}

                {/* Date */}
                <div className="flex items-center gap-2 text-gray-500 text-xs font-body mt-4 pt-4 border-t border-gray-100">
                  <Calendar size={12} />
                  Updated {formatDate(sermon.updated_at)}
                </div>

                {/* Arrow */}
                <div className="flex items-center text-brand-blue font-body font-semibold text-sm mt-3 group-hover:text-gold-600 transition-colors">
                  Open Sermon
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
          "Preach the word; be instant in season, out of season; reprove, rebuke, exhort with all longsuffering and doctrine."
        </p>
        <p className="text-white font-body text-sm opacity-80">
          — 2 Timothy 4:2 (KJV)
        </p>
      </div>

    </div>
  )
}

export default Sermon
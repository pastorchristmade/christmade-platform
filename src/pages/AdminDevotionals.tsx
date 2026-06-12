import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useUserPlan } from '../hooks/useUserPlan'
import { 
  Plus, 
  BookOpen,
  Loader,
  Calendar,
  Eye,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  FileText,
  Archive,
  ShieldCheck
} from 'lucide-react'

interface Devotional {
  id: string
  title: string
  scripture_reference: string
  topic: string | null
  publish_date: string
  status: 'draft' | 'published' | 'archived'
  view_count: number
  created_at: string
}

function AdminDevotionals() {
  const { isAdmin, loading: planLoading } = useUserPlan()
  const [devotionals, setDevotionals] = useState<Devotional[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all')

  useEffect(() => {
    if (isAdmin) {
      fetchDevotionals()
    } else if (!planLoading) {
      setLoading(false)
    }
  }, [isAdmin, planLoading])

  const fetchDevotionals = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('devotionals')
        .select('id, title, scripture_reference, topic, publish_date, status, view_count, created_at')
        .order('publish_date', { ascending: false })

      if (error) throw error

      setDevotionals(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load devotionals')
    } finally {
      setLoading(false)
    }
  }

  const filteredDevotionals = filter === 'all' 
    ? devotionals 
    : devotionals.filter(d => d.status === filter)

  const totalDevotionals = devotionals.length
  const publishedCount = devotionals.filter(d => d.status === 'published').length
  const draftCount = devotionals.filter(d => d.status === 'draft').length
  const totalViews = devotionals.reduce((sum, d) => sum + (d.view_count || 0), 0)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'published': return 'bg-green-100 text-green-700'
      case 'archived': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText size={12} />
      case 'published': return <CheckCircle size={12} />
      case 'archived': return <Archive size={12} />
      default: return null
    }
  }

  // SHOW LOADING WHILE CHECKING ADMIN STATUS
  if (planLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="text-brand-blue animate-spin mx-auto mb-4" size={40} />
          <p className="text-gray-600 font-body">Verifying access...</p>
        </div>
      </div>
    )
  }

  // ONLY SHOW ACCESS DENIED AFTER LOADING IS COMPLETE
  if (!planLoading && !isAdmin) {
    return (
      <div className="min-h-screen p-10">
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 text-red-700 p-8 rounded-2xl text-center">
          <AlertCircle className="mx-auto mb-3" size={48} />
          <h2 className="text-2xl font-heading font-bold mb-2">Access Denied</h2>
          <p className="font-body mb-4">
            This page is only for administrators of Christmade.
          </p>
          <Link 
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-brand-blue text-white font-body font-semibold px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      
      {/* Header */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="text-gold-500" size={20} />
            <span className="text-sm font-body text-gold-600 font-semibold uppercase tracking-wider">
              Admin Panel
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-brand-blue mb-3">
            Devotional Manager
          </h1>
          <p className="text-gray-600 text-lg font-body max-w-2xl">
            Create and manage daily devotionals for the Christmade community.
          </p>
        </div>

        <Link
          to="/admin/devotionals/new"
          className="flex items-center gap-2 bg-brand-blue text-white font-body font-bold px-6 py-3 rounded-xl hover:bg-primary-700 transition-all duration-300 hover:scale-105 shadow-lg"
        >
          <Plus size={20} />
          New Devotional
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <BookOpen className="text-blue-700" size={16} />
            </div>
          </div>
          <p className="text-gray-500 text-xs font-body mb-1">Total</p>
          <p className="text-2xl font-heading font-bold text-brand-blue">{totalDevotionals}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="text-green-700" size={16} />
            </div>
          </div>
          <p className="text-gray-500 text-xs font-body mb-1">Published</p>
          <p className="text-2xl font-heading font-bold text-brand-blue">{publishedCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <FileText className="text-gray-700" size={16} />
            </div>
          </div>
          <p className="text-gray-500 text-xs font-body mb-1">Drafts</p>
          <p className="text-2xl font-heading font-bold text-brand-blue">{draftCount}</p>
        </div>

        <div className="bg-brand-blue p-5 rounded-2xl shadow-sm text-white">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gold-500/20 flex items-center justify-center">
              <Eye className="text-gold-500" size={16} />
            </div>
          </div>
          <p className="text-primary-200 text-xs font-body mb-1">Total Views</p>
          <p className="text-2xl font-heading font-bold text-gold-500">{totalViews}</p>
        </div>

      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { value: 'all', label: 'All' },
          { value: 'published', label: 'Published' },
          { value: 'draft', label: 'Drafts' },
          { value: 'archived', label: 'Archived' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as any)}
            className={`px-4 py-2 rounded-lg font-body font-semibold text-sm transition-colors ${
              filter === tab.value
                ? 'bg-brand-blue text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Devotionals List */}
      <div>
        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Loader className="text-brand-blue animate-spin mx-auto mb-4" size={32} />
            <p className="text-gray-600 font-body">Loading devotionals...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl">
            <p className="font-body">{error}</p>
          </div>
        )}

        {!loading && !error && devotionals.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-purple-700 rounded-2xl flex items-center justify-center mb-4">
              <BookOpen className="text-white" size={36} />
            </div>
            <h3 className="text-2xl font-heading font-bold text-brand-blue mb-2">
              Start Your Ministry
            </h3>
            <p className="text-gray-600 font-body mb-6 max-w-md mx-auto">
              Create your first devotional. Your voice will reach believers worldwide.
            </p>
            <Link
              to="/admin/devotionals/new"
              className="inline-flex items-center gap-2 bg-brand-blue text-white font-body font-bold px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors"
            >
              <Plus size={20} />
              Write Your First Devotional
            </Link>
          </div>
        )}

        {!loading && !error && devotionals.length > 0 && filteredDevotionals.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <p className="text-gray-600 font-body">No {filter} devotionals found.</p>
          </div>
        )}

        {!loading && !error && filteredDevotionals.length > 0 && (
          <div className="space-y-3">
            {filteredDevotionals.map((devotional) => (
              <Link
                key={devotional.id}
                to={`/admin/devotionals/${devotional.id}`}
                className="block bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gold-300 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 text-xs font-body font-semibold px-2 py-1 rounded-full ${getStatusBadge(devotional.status)}`}>
                        {getStatusIcon(devotional.status)}
                        {devotional.status.charAt(0).toUpperCase() + devotional.status.slice(1)}
                      </span>
                      
                      <span className="inline-flex items-center gap-1 text-xs font-body text-gray-500">
                        <Calendar size={12} />
                        {formatDate(devotional.publish_date)}
                      </span>

                      {devotional.view_count > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs font-body text-gray-500">
                          <Eye size={12} />
                          {devotional.view_count} views
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-heading font-bold text-brand-blue mb-1 line-clamp-1">
                      {devotional.title}
                    </h3>

                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gold-700 font-scripture italic">
                        {devotional.scripture_reference}
                      </span>
                      
                      {devotional.topic && (
                        <span className="text-gray-500 font-body">
                          • {devotional.topic}
                        </span>
                      )}
                    </div>
                  </div>

                  <ArrowRight className="text-gray-400 flex-shrink-0 mt-2" size={20} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default AdminDevotionals
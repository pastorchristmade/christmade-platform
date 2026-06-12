import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { useUserPlan } from '../hooks/useUserPlan'
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  BookOpen,
  Loader,
  AlertCircle,
  Calendar,
  CheckCircle,
  Eye,
  FileText,
  Archive,
  Send,
  ShieldCheck
} from 'lucide-react'

function AdminDevotionalEdit() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { isAdmin, loading: planLoading } = useUserPlan()
  const navigate = useNavigate()
  const isNewDevotional = !id || id === 'new'
  
  const [title, setTitle] = useState('')
  const [scriptureReference, setScriptureReference] = useState('')
  const [scriptureText, setScriptureText] = useState('')
  const [message, setMessage] = useState('')
  const [prayerPoint, setPrayerPoint] = useState('')
  const [reflectionQuestion, setReflectionQuestion] = useState('')
  const [topic, setTopic] = useState('')
  const [publishDate, setPublishDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft')
  const [viewCount, setViewCount] = useState(0)
  
  const [loading, setLoading] = useState(!isNewDevotional)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!isNewDevotional && isAdmin) {
      fetchDevotional()
    } else if (isNewDevotional) {
      setLoading(false)
    }
  }, [id, isAdmin])

  const fetchDevotional = async () => {
    if (!id || id === 'new') return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('devotionals')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      setTitle(data.title || '')
      setScriptureReference(data.scripture_reference || '')
      setScriptureText(data.scripture_text || '')
      setMessage(data.message || '')
      setPrayerPoint(data.prayer_point || '')
      setReflectionQuestion(data.reflection_question || '')
      setTopic(data.topic || '')
      setPublishDate(data.publish_date || new Date().toISOString().split('T')[0])
      setStatus(data.status || 'draft')
      setViewCount(data.view_count || 0)
    } catch (err: any) {
      setError(err.message || 'Failed to load devotional')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent, publishNow: boolean = false) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!title.trim()) {
      setError('Please enter a title')
      return
    }
    if (!scriptureReference.trim()) {
      setError('Please enter a scripture reference')
      return
    }
    if (!scriptureText.trim()) {
      setError('Please enter the scripture text')
      return
    }
    if (!message.trim()) {
      setError('Please write the devotional message')
      return
    }

    if (!user) {
      setError('You must be logged in')
      return
    }

    setSaving(true)
    
    const finalStatus = publishNow ? 'published' : status
    const userName = user.user_metadata?.full_name || 'Pastor Christmade'

    const devotionalData = {
      title: title.trim(),
      scripture_reference: scriptureReference.trim(),
      scripture_text: scriptureText.trim(),
      message: message.trim(),
      prayer_point: prayerPoint.trim() || null,
      reflection_question: reflectionQuestion.trim() || null,
      topic: topic.trim() || null,
      publish_date: publishDate,
      status: finalStatus,
      author_id: user.id,
      author_name: userName,
    }

    try {
      if (isNewDevotional) {
        const { data, error } = await supabase
          .from('devotionals')
          .insert([devotionalData])
          .select()
          .single()

        if (error) throw error

        setSuccess(publishNow ? 'Devotional published successfully!' : 'Devotional saved as draft!')
        setTimeout(() => {
          navigate(`/admin/devotionals/${data.id}`)
        }, 1500)
      } else {
        const { error } = await supabase
          .from('devotionals')
          .update(devotionalData)
          .eq('id', id)

        if (error) throw error

        setSuccess('Devotional updated successfully!')
        setStatus(finalStatus)
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err: any) {
      if (err.message?.includes('unique_published_devotional_per_day')) {
        setError(`A devotional is already published for ${formatDate(publishDate)}. Choose a different date or unpublish the other one.`)
      } else {
        setError(err.message || 'Failed to save devotional')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (isNewDevotional) return
    
    const confirmed = window.confirm(
      'Are you sure you want to delete this devotional? This cannot be undone.'
    )
    if (!confirmed) return

    try {
      const { error } = await supabase
        .from('devotionals')
        .delete()
        .eq('id', id)

      if (error) throw error

      navigate('/admin/devotionals')
    } catch (err: any) {
      setError(err.message || 'Failed to delete devotional')
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
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

  // Loading devotional data
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="text-brand-blue animate-spin mx-auto mb-4" size={40} />
          <p className="text-gray-600 font-body">Loading devotional...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      
      <Link 
        to="/admin/devotionals" 
        className="inline-flex items-center gap-2 text-gray-600 hover:text-brand-blue font-body text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Devotionals
      </Link>

      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="text-gold-500" size={20} />
            <span className="text-sm font-body text-gold-600 font-semibold uppercase tracking-wider">
              {isNewDevotional ? 'New Devotional' : 'Edit Devotional'}
            </span>
            {!isNewDevotional && (
              <span className={`inline-flex items-center gap-1 text-xs font-body font-semibold px-3 py-1 rounded-full ${
                status === 'published' ? 'bg-green-100 text-green-700' :
                status === 'draft' ? 'bg-gray-100 text-gray-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {status === 'published' && <CheckCircle size={12} />}
                {status === 'draft' && <FileText size={12} />}
                {status === 'archived' && <Archive size={12} />}
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-brand-blue mb-2">
            {isNewDevotional ? 'Write New Devotional' : 'Edit Devotional'}
          </h1>
          {!isNewDevotional && viewCount > 0 && (
            <p className="text-gray-600 text-sm font-body flex items-center gap-2">
              <Eye size={14} />
              {viewCount} {viewCount === 1 ? 'view' : 'views'}
            </p>
          )}
        </div>

        {!isNewDevotional && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-body font-semibold text-sm rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 size={16} />
            Delete
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 max-w-4xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-body">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 max-w-4xl bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-body">
          {success}
        </div>
      )}

      <form onSubmit={(e) => handleSave(e, false)} className="max-w-4xl space-y-6">
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-body font-semibold text-brand-blue mb-3 uppercase tracking-wider">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g., The Power of Faith"
            className="w-full px-4 py-3 text-2xl font-heading text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-body font-semibold text-brand-blue mb-3 uppercase tracking-wider">
              Publish Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 font-body text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
            <p className="text-xs text-gray-500 font-body mt-2">
              When should believers see this?
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-body font-semibold text-brand-blue mb-3 uppercase tracking-wider">
              Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Faith, Love, Healing"
              className="w-full px-4 py-3 font-body text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
            <p className="text-xs text-gray-500 font-body mt-2">
              Helps organize devotionals
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-brand-blue to-primary-900 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="text-gold-500" size={20} />
            <span className="text-sm font-body text-gold-500 font-semibold uppercase tracking-wider">
              Scripture *
            </span>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-body text-gold-300 mb-1">Reference</label>
              <input
                type="text"
                value={scriptureReference}
                onChange={(e) => setScriptureReference(e.target.value)}
                required
                placeholder="e.g., Hebrews 11:1"
                className="w-full px-4 py-3 text-gold-500 font-scripture italic bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 placeholder-white/40"
              />
            </div>

            <div>
              <label className="block text-xs font-body text-gold-300 mb-1">Scripture Text</label>
              <textarea
                value={scriptureText}
                onChange={(e) => setScriptureText(e.target.value)}
                required
                rows={3}
                placeholder="Now faith is the substance of things hoped for..."
                className="w-full px-4 py-3 text-white font-scripture italic bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 placeholder-white/40"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-body font-semibold text-brand-blue mb-3 uppercase tracking-wider">
            Devotional Message *
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={15}
            placeholder="Pastor, share the Word with the body of Christ today..."
            className="w-full px-4 py-3 font-body text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent leading-relaxed text-base"
          />
          <p className="text-xs text-gray-500 font-body mt-2">
            {message.length} characters • Recommended: 200-500 words
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-body font-semibold text-brand-blue mb-3 uppercase tracking-wider">
            Prayer Point
          </label>
          <textarea
            value={prayerPoint}
            onChange={(e) => setPrayerPoint(e.target.value)}
            rows={4}
            placeholder="Father, we thank you for..."
            className="w-full px-4 py-3 font-body text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue leading-relaxed"
          />
          <p className="text-xs text-gray-500 font-body mt-2">
            Optional: Guide believers in prayer
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-body font-semibold text-brand-blue mb-3 uppercase tracking-wider">
            Reflection Question
          </label>
          <textarea
            value={reflectionQuestion}
            onChange={(e) => setReflectionQuestion(e.target.value)}
            rows={3}
            placeholder="How can you apply this scripture in your life today?"
            className="w-full px-4 py-3 font-body text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue leading-relaxed"
          />
          <p className="text-xs text-gray-500 font-body mt-2">
            Optional: Help believers think deeper
          </p>
        </div>

        {!isNewDevotional && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-body font-semibold text-brand-blue mb-3 uppercase tracking-wider">
              Status
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setStatus('draft')}
                className={`p-4 rounded-lg border-2 font-body font-semibold text-sm transition-all ${
                  status === 'draft' 
                    ? 'border-brand-blue bg-brand-blue text-white' 
                    : 'border-gray-200 text-gray-600 hover:border-brand-blue'
                }`}
              >
                📝 Draft
              </button>
              <button
                type="button"
                onClick={() => setStatus('published')}
                className={`p-4 rounded-lg border-2 font-body font-semibold text-sm transition-all ${
                  status === 'published' 
                    ? 'border-green-500 bg-green-500 text-white' 
                    : 'border-gray-200 text-gray-600 hover:border-green-500'
                }`}
              >
                ✅ Published
              </button>
              <button
                type="button"
                onClick={() => setStatus('archived')}
                className={`p-4 rounded-lg border-2 font-body font-semibold text-sm transition-all ${
                  status === 'archived' 
                    ? 'border-yellow-500 bg-yellow-500 text-white' 
                    : 'border-gray-200 text-gray-600 hover:border-yellow-500'
                }`}
              >
                📦 Archived
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-4">
          <Link
            to="/admin/devotionals"
            className="px-6 py-3 text-gray-700 font-body font-semibold border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-center"
          >
            Cancel
          </Link>
          
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 text-white font-body font-bold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader className="animate-spin" size={18} />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save as Draft
              </>
            )}
          </button>

          <button
            type="button"
            onClick={(e) => handleSave(e, true)}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue text-white font-body font-bold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader className="animate-spin" size={18} />
                Publishing...
              </>
            ) : (
              <>
                <Send size={18} />
                Publish Now
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  )
}

export default AdminDevotionalEdit
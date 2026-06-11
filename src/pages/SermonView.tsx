import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { useUserPlan } from '../hooks/useUserPlan'
import { generateSermonPDF } from '../services/pdfGenerator'
import { 
  Sparkles, 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  BookOpen,
  Loader,
  X,
  Pencil,
  Calendar,
  CheckCircle,
  FileText,
  Mic,
  AlertCircle,
  Download,
  Printer,
  Copy,
  Share2,
  Check
} from 'lucide-react'

interface MainPoint {
  id: string
  title: string
  content: string
}

interface Sermon {
  id: string
  title: string
  theme: string | null
  scripture_text: string | null
  scripture_reference: string | null
  introduction: string | null
  main_points: MainPoint[]
  conclusion: string | null
  tags: string[]
  status: 'draft' | 'completed' | 'preached'
  preached_date: string | null
  created_at: string
  updated_at: string
}

function SermonView() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { isFree, organizationName, customFooter } = useUserPlan()
  const navigate = useNavigate()
  
  const [sermon, setSermon] = useState<Sermon | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState(false)
  
  // Edit form states
  const [title, setTitle] = useState('')
  const [theme, setTheme] = useState('')
  const [scriptureReference, setScriptureReference] = useState('')
  const [scriptureText, setScriptureText] = useState('')
  const [introduction, setIntroduction] = useState('')
  const [conclusion, setConclusion] = useState('')
  const [status, setStatus] = useState<'draft' | 'completed' | 'preached'>('draft')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [mainPoints, setMainPoints] = useState<MainPoint[]>([])

  useEffect(() => {
    fetchSermon()
  }, [id, user])

  const fetchSermon = async () => {
    if (!user || !id) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('sermons')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      setSermon(data)
      setTitle(data.title || '')
      setTheme(data.theme || '')
      setScriptureReference(data.scripture_reference || '')
      setScriptureText(data.scripture_text || '')
      setIntroduction(data.introduction || '')
      setConclusion(data.conclusion || '')
      setStatus(data.status || 'draft')
      setTags(data.tags || [])
      setMainPoints(
        data.main_points && data.main_points.length > 0 
          ? data.main_points 
          : [{ id: '1', title: '', content: '' }]
      )
    } catch (err: any) {
      setError(err.message || 'Failed to load sermon')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Sermon title is required')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('sermons')
        .update({
          title: title.trim(),
          theme: theme.trim() || null,
          scripture_reference: scriptureReference.trim() || null,
          scripture_text: scriptureText.trim() || null,
          introduction: introduction.trim() || null,
          main_points: mainPoints.filter(p => p.title.trim() || p.content.trim()),
          conclusion: conclusion.trim() || null,
          tags: tags,
          status: status,
        })
        .eq('id', id)

      if (error) throw error

      setSuccess('Sermon updated successfully!')
      setEditing(false)
      fetchSermon()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save sermon')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this sermon? This cannot be undone.'
    )
    if (!confirmed) return

    try {
      const { error } = await supabase
        .from('sermons')
        .delete()
        .eq('id', id)

      if (error) throw error

      navigate('/sermon')
    } catch (err: any) {
      setError(err.message || 'Failed to delete sermon')
    }
  }

  // Download PDF
  const handleDownloadPDF = () => {
    if (!sermon) return

    const authorName = user?.user_metadata?.full_name || 'Christmade User'

    generateSermonPDF(sermon, {
      showBranding: isFree,
      organizationName: organizationName,
      customFooter: customFooter,
      authorName: authorName,
    })
  }

  // Print sermon
  const handlePrint = () => {
    window.print()
  }

  // Copy sermon to clipboard
  const handleCopy = async () => {
    if (!sermon) return

    let text = `${sermon.title}\n`
    if (sermon.theme) text += `${sermon.theme}\n`
    text += '\n'
    
    if (sermon.scripture_reference || sermon.scripture_text) {
      text += `SCRIPTURE\n`
      if (sermon.scripture_text) text += `"${sermon.scripture_text}"\n`
      if (sermon.scripture_reference) text += `— ${sermon.scripture_reference} (KJV)\n`
      text += '\n'
    }

    if (sermon.introduction) {
      text += `INTRODUCTION\n${sermon.introduction}\n\n`
    }

    if (sermon.main_points && sermon.main_points.length > 0) {
      text += `MAIN POINTS\n`
      sermon.main_points.forEach((point, idx) => {
        if (point.title) text += `${idx + 1}. ${point.title}\n`
        if (point.content) text += `${point.content}\n`
        text += '\n'
      })
    }

    if (sermon.conclusion) {
      text += `CONCLUSION\n${sermon.conclusion}\n\n`
    }

    if (isFree) {
      text += `\n---\nMade with Christmade — Tools That Build the Kingdom\nhttps://christmade-platform.netlify.app`
    }

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setError('Failed to copy to clipboard')
    }
  }

  // Share sermon
  const handleShare = async () => {
    if (!sermon) return

    const shareText = `📖 ${sermon.title}\n${sermon.theme || ''}\n${sermon.scripture_reference ? `\n${sermon.scripture_reference}` : ''}`
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: sermon.title,
          text: shareText,
          url: url,
        })
      } catch (err) {
        // User cancelled share, no need to show error
      }
    } else {
      // Fallback: copy URL to clipboard
      try {
        await navigator.clipboard.writeText(url)
        setSuccess('Link copied to clipboard!')
        setTimeout(() => setSuccess(''), 2000)
      } catch (err) {
        setError('Sharing not supported on this browser')
      }
    }
  }

  const addMainPoint = () => {
    setMainPoints([...mainPoints, { 
      id: Date.now().toString(), 
      title: '', 
      content: '' 
    }])
  }

  const removeMainPoint = (id: string) => {
    if (mainPoints.length === 1) return
    setMainPoints(mainPoints.filter(p => p.id !== id))
  }

  const updateMainPoint = (id: string, field: 'title' | 'content', value: string) => {
    setMainPoints(mainPoints.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ))
  }

  const addTag = () => {
    const trimmed = newTag.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'completed': return 'bg-blue-100 text-blue-700'
      case 'preached': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText size={14} />
      case 'completed': return <CheckCircle size={14} />
      case 'preached': return <Mic size={14} />
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <div className="text-center">
          <Loader className="text-brand-blue animate-spin mx-auto mb-4" size={32} />
          <p className="text-gray-600 font-body">Loading sermon...</p>
        </div>
      </div>
    )
  }

  if (!sermon) {
    return (
      <div className="min-h-screen p-10">
        <Link 
          to="/sermon" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-brand-blue font-body text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Sermon Library
        </Link>
        
        <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-2xl text-center max-w-2xl">
          <AlertCircle className="mx-auto mb-3" size={32} />
          <h2 className="text-xl font-heading font-bold mb-2">Sermon Not Found</h2>
          <p className="font-body">This sermon doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      
      {/* Back Link */}
      <Link 
        to="/sermon" 
        className="inline-flex items-center gap-2 text-gray-600 hover:text-brand-blue font-body text-sm mb-6 transition-colors print:hidden"
      >
        <ArrowLeft size={16} />
        Back to Sermon Library
      </Link>

      {/* Status Messages */}
      {error && (
        <div className="mb-6 max-w-4xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-body print:hidden">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 max-w-4xl bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-body print:hidden">
          {success}
        </div>
      )}

      {/* ACTION BUTTONS BAR (Download/Share/Print/Copy) */}
      {!editing && (
        <div className="max-w-4xl mb-6 print:hidden">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-body text-gray-500 uppercase tracking-wider mr-2">
                Actions:
              </span>
              
              {/* Download PDF */}
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white font-body font-semibold text-sm rounded-lg hover:bg-primary-700 transition-colors"
                title="Download as PDF"
              >
                <Download size={16} />
                Download PDF
              </button>

              {/* Print */}
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-body font-semibold text-sm rounded-lg hover:bg-gray-200 transition-colors"
                title="Print sermon"
              >
                <Printer size={16} />
                Print
              </button>

              {/* Copy */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-body font-semibold text-sm rounded-lg hover:bg-gray-200 transition-colors"
                title="Copy sermon text"
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy Text
                  </>
                )}
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-brand-blue font-body font-semibold text-sm rounded-lg hover:bg-gold-400 transition-colors"
                title="Share sermon"
              >
                <Share2 size={16} />
                Share
              </button>
            </div>

            {/* Free Plan Notice */}
            {isFree && (
              <p className="text-xs text-gray-500 font-body mt-3 pt-3 border-t border-gray-100">
                💎 PDF downloads include Christmade branding on free plan. 
                <span className="text-brand-blue font-semibold"> Upgrade to remove branding.</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-4xl mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-4 print:hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="text-gold-500" size={20} />
            <span className="text-sm font-body text-gold-600 font-semibold uppercase tracking-wider">
              {editing ? 'Editing Sermon' : 'Sermon'}
            </span>
            <span className={`inline-flex items-center gap-1 text-xs font-body font-semibold px-3 py-1 rounded-full ${getStatusBadge(sermon.status)}`}>
              {getStatusIcon(sermon.status)}
              {sermon.status.charAt(0).toUpperCase() + sermon.status.slice(1)}
            </span>
          </div>

          {/* Edit/Delete Buttons */}
          <div className="flex gap-2">
            {!editing ? (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white font-body font-semibold text-sm rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Pencil size={16} />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-body font-semibold text-sm rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setEditing(false)
                    fetchSermon()
                  }}
                  className="px-4 py-2 text-gray-700 font-body font-semibold text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white font-body font-semibold text-sm rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader className="animate-spin" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Title */}
        {editing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 text-3xl md:text-4xl font-heading font-bold text-brand-blue border-2 border-brand-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue mb-2"
          />
        ) : (
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-brand-blue mb-2">
            {sermon.title}
          </h1>
        )}

        {/* Theme */}
        {editing ? (
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Theme / Topic"
            className="w-full px-4 py-2 text-lg font-body text-gray-700 italic border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        ) : (
          sermon.theme && (
            <p className="text-xl font-body text-gray-600 italic">
              {sermon.theme}
            </p>
          )
        )}

        {/* Tags */}
        {sermon.tags && sermon.tags.length > 0 && !editing && (
          <div className="flex flex-wrap gap-2 mt-4">
            {sermon.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block bg-gold-100 text-gold-700 px-3 py-1 rounded-full text-xs font-body font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-4xl space-y-6">
        
        {/* Scripture */}
        {(sermon.scripture_reference || sermon.scripture_text || editing) && (
          <div className="bg-gradient-to-br from-brand-blue to-primary-900 rounded-2xl p-6 md:p-8 text-white">
            <div className="flex items-center gap-2 mb-3 print:hidden">
              <BookOpen className="text-gold-500" size={20} />
              <span className="text-sm font-body text-gold-500 font-semibold uppercase tracking-wider">
                Scripture
              </span>
            </div>
            
            {editing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={scriptureReference}
                  onChange={(e) => setScriptureReference(e.target.value)}
                  placeholder="Reference (e.g., Hebrews 11:1)"
                  className="w-full px-4 py-2 text-gold-500 font-scripture italic bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 placeholder-white/40"
                />
                <textarea
                  value={scriptureText}
                  onChange={(e) => setScriptureText(e.target.value)}
                  placeholder="Scripture text..."
                  rows={3}
                  className="w-full px-4 py-2 text-white font-scripture italic bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 placeholder-white/40"
                />
              </div>
            ) : (
              <>
                {sermon.scripture_text && (
                  <p className="text-xl md:text-2xl font-scripture italic mb-3 leading-relaxed">
                    "{sermon.scripture_text}"
                  </p>
                )}
                {sermon.scripture_reference && (
                  <p className="text-gold-500 font-body font-semibold">
                    — {sermon.scripture_reference} (KJV)
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* Introduction */}
        {(sermon.introduction || editing) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-sm font-body font-semibold text-brand-blue mb-4 uppercase tracking-wider">
              Introduction
            </h2>
            {editing ? (
              <textarea
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
                rows={5}
                placeholder="Opening of your message..."
                className="w-full px-4 py-3 font-body text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue leading-relaxed"
              />
            ) : (
              <p className="font-body text-gray-700 leading-relaxed whitespace-pre-wrap">
                {sermon.introduction}
              </p>
            )}
          </div>
        )}

        {/* Main Points */}
        {((sermon.main_points && sermon.main_points.length > 0) || editing) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-body font-semibold text-brand-blue uppercase tracking-wider">
                Main Points
              </h2>
              {editing && (
                <button
                  type="button"
                  onClick={addMainPoint}
                  className="flex items-center gap-1 text-sm text-brand-blue font-body font-semibold hover:text-gold-600 transition-colors"
                >
                  <Plus size={16} />
                  Add Point
                </button>
              )}
            </div>

            <div className="space-y-6">
              {(editing ? mainPoints : sermon.main_points).map((point, index) => (
                <div key={point.id} className={editing ? 'border border-gray-200 rounded-lg p-4 bg-gray-50' : ''}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gold-500 text-brand-blue rounded-full flex items-center justify-center font-bold font-heading">
                      {index + 1}
                    </div>

                    <div className="flex-1 space-y-2">
                      {editing ? (
                        <>
                          <input
                            type="text"
                            value={point.title}
                            onChange={(e) => updateMainPoint(point.id, 'title', e.target.value)}
                            placeholder={`Point ${index + 1} title`}
                            className="w-full px-3 py-2 text-lg font-heading font-bold text-brand-blue border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white"
                          />
                          <textarea
                            value={point.content}
                            onChange={(e) => updateMainPoint(point.id, 'content', e.target.value)}
                            placeholder="Develop this point..."
                            rows={4}
                            className="w-full px-3 py-2 font-body text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white"
                          />
                        </>
                      ) : (
                        <>
                          {point.title && (
                            <h3 className="text-xl font-heading font-bold text-brand-blue">
                              {point.title}
                            </h3>
                          )}
                          {point.content && (
                            <p className="font-body text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {point.content}
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    {editing && mainPoints.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMainPoint(point.id)}
                        className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conclusion */}
        {(sermon.conclusion || editing) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-sm font-body font-semibold text-brand-blue mb-4 uppercase tracking-wider">
              Conclusion
            </h2>
            {editing ? (
              <textarea
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                rows={5}
                placeholder="Closing of your message..."
                className="w-full px-4 py-3 font-body text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue leading-relaxed"
              />
            ) : (
              <p className="font-body text-gray-700 leading-relaxed whitespace-pre-wrap">
                {sermon.conclusion}
              </p>
            )}
          </div>
        )}

        {/* Edit Mode: Tags */}
        {editing && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-sm font-body font-semibold text-brand-blue mb-4 uppercase tracking-wider">
              Tags
            </h2>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-gold-100 text-gold-700 px-3 py-1 rounded-full text-sm font-body font-semibold"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Add a tag..."
                className="flex-1 px-4 py-2 font-body text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-brand-blue text-white font-body font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Edit Mode: Status */}
        {editing && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-sm font-body font-semibold text-brand-blue mb-4 uppercase tracking-wider">
              Status
            </h2>
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
                onClick={() => setStatus('completed')}
                className={`p-4 rounded-lg border-2 font-body font-semibold text-sm transition-all ${
                  status === 'completed' 
                    ? 'border-brand-blue bg-brand-blue text-white' 
                    : 'border-gray-200 text-gray-600 hover:border-brand-blue'
                }`}
              >
                ✅ Completed
              </button>
              <button
                type="button"
                onClick={() => setStatus('preached')}
                className={`p-4 rounded-lg border-2 font-body font-semibold text-sm transition-all ${
                  status === 'preached' 
                    ? 'border-brand-blue bg-brand-blue text-white' 
                    : 'border-gray-200 text-gray-600 hover:border-brand-blue'
                }`}
              >
                🎤 Preached
              </button>
            </div>
          </div>
        )}

        {/* Metadata Footer */}
        {!editing && (
          <div className="bg-gray-50 rounded-2xl p-6 text-center print:hidden">
            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm font-body">
              <Calendar size={14} />
              <span>Created {formatDate(sermon.created_at)}</span>
              <span>•</span>
              <span>Updated {formatDate(sermon.updated_at)}</span>
            </div>
          </div>
        )}

      </div>

    </div>
  )
}

export default SermonView
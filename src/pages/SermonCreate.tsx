import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { 
  Sparkles, 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  BookOpen,
  Loader,
  X
} from 'lucide-react'

interface MainPoint {
  id: string
  title: string
  content: string
}

function SermonCreate() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // Form states
  const [title, setTitle] = useState('')
  const [theme, setTheme] = useState('')
  const [scriptureReference, setScriptureReference] = useState('')
  const [scriptureText, setScriptureText] = useState('')
  const [introduction, setIntroduction] = useState('')
  const [conclusion, setConclusion] = useState('')
  const [status, setStatus] = useState<'draft' | 'completed' | 'preached'>('draft')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  
  // Main points state
  const [mainPoints, setMainPoints] = useState<MainPoint[]>([
    { id: '1', title: '', content: '' }
  ])

  // UI states
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Add new main point
  const addMainPoint = () => {
    const newPoint: MainPoint = {
      id: Date.now().toString(),
      title: '',
      content: ''
    }
    setMainPoints([...mainPoints, newPoint])
  }

  // Remove main point
  const removeMainPoint = (id: string) => {
    if (mainPoints.length === 1) {
      setError('You need at least one main point')
      return
    }
    setMainPoints(mainPoints.filter(point => point.id !== id))
  }

  // Update main point
  const updateMainPoint = (id: string, field: 'title' | 'content', value: string) => {
    setMainPoints(mainPoints.map(point => 
      point.id === id ? { ...point, [field]: value } : point
    ))
  }

  // Add tag
  const addTag = () => {
    const trimmed = newTag.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setNewTag('')
    }
  }

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  // Handle tag input keypress
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  // Save sermon
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Please enter a sermon title')
      return
    }

    if (!user) {
      setError('You must be logged in')
      return
    }

    setSaving(true)

    try {
      const { data, error } = await supabase
        .from('sermons')
        .insert([
          {
            user_id: user.id,
            title: title.trim(),
            theme: theme.trim() || null,
            scripture_reference: scriptureReference.trim() || null,
            scripture_text: scriptureText.trim() || null,
            introduction: introduction.trim() || null,
            main_points: mainPoints.filter(p => p.title.trim() || p.content.trim()),
            conclusion: conclusion.trim() || null,
            tags: tags,
            status: status,
          }
        ])
        .select()
        .single()

      if (error) throw error

      // Navigate to the new sermon view
      navigate(`/sermon/${data.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to save sermon')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      
      {/* Back Link */}
      <Link 
        to="/sermon" 
        className="inline-flex items-center gap-2 text-gray-600 hover:text-brand-blue font-body text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Sermon Library
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="text-gold-500" size={20} />
          <span className="text-sm font-body text-gold-600 font-semibold uppercase tracking-wider">
            New Sermon
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-brand-blue mb-3">
          Create Sermon
        </h1>
        <p className="text-gray-600 text-lg font-body">
          Let the Word of God flow through you.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 max-w-4xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-body">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="max-w-4xl space-y-6">
        
        {/* Sermon Title */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-body font-semibold text-brand-blue mb-3 uppercase tracking-wider">
            Sermon Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g., The Power of Faith"
            className="w-full px-4 py-3 text-xl font-heading text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
          />
        </div>

        {/* Theme */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-body font-semibold text-brand-blue mb-3 uppercase tracking-wider">
            Theme / Topic
          </label>
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="e.g., Walking by faith, not by sight"
            className="w-full px-4 py-3 font-body text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
          />
        </div>

        {/* Scripture */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-body font-semibold text-brand-blue mb-3 uppercase tracking-wider">
            Main Scripture
          </label>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-body text-gray-500 mb-1">Reference</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-600" size={18} />
                <input
                  type="text"
                  value={scriptureReference}
                  onChange={(e) => setScriptureReference(e.target.value)}
                  placeholder="e.g., Hebrews 11:1"
                  className="w-full pl-10 pr-4 py-3 font-scripture italic text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-body text-gray-500 mb-1">Scripture Text</label>
              <textarea
                value={scriptureText}
                onChange={(e) => setScriptureText(e.target.value)}
                placeholder="Now faith is the substance of things hoped for, the evidence of things not seen..."
                rows={3}
                className="w-full px-4 py-3 font-scripture italic text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-body font-semibold text-brand-blue mb-3 uppercase tracking-wider">
            Introduction
          </label>
          <textarea
            value={introduction}
            onChange={(e) => setIntroduction(e.target.value)}
            placeholder="How will you open your message? An illustration, question, or context..."
            rows={5}
            className="w-full px-4 py-3 font-body text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent leading-relaxed"
          />
        </div>

        {/* Main Points */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-body font-semibold text-brand-blue uppercase tracking-wider">
              Main Points
            </label>
            <button
              type="button"
              onClick={addMainPoint}
              className="flex items-center gap-1 text-sm text-brand-blue font-body font-semibold hover:text-gold-600 transition-colors"
            >
              <Plus size={16} />
              Add Point
            </button>
          </div>

          <div className="space-y-4">
            {mainPoints.map((point, index) => (
              <div key={point.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start gap-3">
                  
                  {/* Point Number */}
                  <div className="flex-shrink-0 w-8 h-8 bg-gold-500 text-brand-blue rounded-full flex items-center justify-center font-bold text-sm font-heading">
                    {index + 1}
                  </div>

                  {/* Point Content */}
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={point.title}
                      onChange={(e) => updateMainPoint(point.id, 'title', e.target.value)}
                      placeholder={`Point ${index + 1} title`}
                      className="w-full px-3 py-2 font-body font-semibold text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white"
                    />
                    <textarea
                      value={point.content}
                      onChange={(e) => updateMainPoint(point.id, 'content', e.target.value)}
                      placeholder="Develop this point with scripture, illustrations, applications..."
                      rows={4}
                      className="w-full px-3 py-2 font-body text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white"
                    />
                  </div>

                  {/* Remove Button */}
                  {mainPoints.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMainPoint(point.id)}
                      className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Remove point"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conclusion */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-body font-semibold text-brand-blue mb-3 uppercase tracking-wider">
            Conclusion
          </label>
          <textarea
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
            placeholder="How will you wrap up? Call to action, prayer, altar call..."
            rows={5}
            className="w-full px-4 py-3 font-body text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent leading-relaxed"
          />
        </div>

        {/* Tags */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-body font-semibold text-brand-blue mb-3 uppercase tracking-wider">
            Tags
          </label>
          
          {/* Existing tags */}
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
                    aria-label={`Remove ${tag}`}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Add tag input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleTagKeyPress}
              placeholder="e.g., Faith, Healing, Love..."
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
          <p className="text-xs text-gray-500 font-body mt-2">
            Press Enter or click Add to add a tag
          </p>
        </div>

        {/* Status */}
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

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-4">
          <Link
            to="/sermon"
            className="px-6 py-3 text-gray-700 font-body font-semibold border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue text-white font-body font-bold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader className="animate-spin" size={18} />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Sermon
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  )
}

export default SermonCreate
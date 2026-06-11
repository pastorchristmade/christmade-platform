import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { 
  Sparkles, 
  ArrowLeft, 
  Save, 
  BookOpen,
  Loader,
  X,
  Star,
  Calendar
} from 'lucide-react'

const moods = [
  { value: 'joyful', emoji: '😊', label: 'Joyful' },
  { value: 'peaceful', emoji: '☮️', label: 'Peaceful' },
  { value: 'grateful', emoji: '🙏', label: 'Grateful' },
  { value: 'reflective', emoji: '💭', label: 'Reflective' },
  { value: 'hopeful', emoji: '🌟', label: 'Hopeful' },
  { value: 'worshipful', emoji: '🎵', label: 'Worshipful' },
  { value: 'inspired', emoji: '🔥', label: 'Inspired' },
  { value: 'struggling', emoji: '😔', label: 'Struggling' },
  { value: 'broken', emoji: '💔', label: 'Broken' },
]

const entryTypes = [
  { value: 'reflection', emoji: '💭', label: 'Reflection', desc: 'Personal thoughts & insights' },
  { value: 'prayer', emoji: '🙏', label: 'Prayer', desc: 'Prayer to God' },
  { value: 'praise', emoji: '🎤', label: 'Praise', desc: 'Worship & adoration' },
  { value: 'gratitude', emoji: '❤️', label: 'Gratitude', desc: 'What you\'re thankful for' },
  { value: 'lesson', emoji: '📚', label: 'Lesson', desc: 'What God is teaching' },
  { value: 'devotional', emoji: '📖', label: 'Devotional', desc: 'Daily devotion notes' },
  { value: 'fasting', emoji: '🤲', label: 'Fasting', desc: 'Fasting experience' },
  { value: 'testimony', emoji: '✨', label: 'Testimony', desc: 'Praise reports' },
]

function JournalCreate() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // Form states
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<string>('')
  const [entryType, setEntryType] = useState<string>('reflection')
  const [scriptureReference, setScriptureReference] = useState('')
  const [scriptureText, setScriptureText] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  // UI states
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Add tag
  const addTag = () => {
    const trimmed = newTag.trim().toLowerCase()
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

  // Save entry
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Please enter a title for your entry')
      return
    }

    if (!user) {
      setError('You must be logged in')
      return
    }

    setSaving(true)

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([
          {
            user_id: user.id,
            title: title.trim(),
            content: content.trim() || null,
            mood: mood || null,
            entry_type: entryType,
            scripture_reference: scriptureReference.trim() || null,
            scripture_text: scriptureText.trim() || null,
            tags: tags,
            is_favorite: isFavorite,
            entry_date: entryDate,
          }
        ])
        .select()
        .single()

      if (error) throw error

      navigate(`/journal/${data.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to save entry')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      
      {/* Back Link */}
      <Link 
        to="/journal" 
        className="inline-flex items-center gap-2 text-gray-600 hover:text-brand-blue font-body text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Journal
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="text-gold-500" size={20} />
          <span className="text-sm font-body text-gold-600 font-semibold uppercase tracking-wider">
            New Entry
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-brand-blue mb-3">
          Write Your Heart
        </h1>
        <p className="text-gray-600 text-lg font-body">
          Let your soul speak. God is listening.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 max-w-4xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-body">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="max-w-4xl space-y-6">
        
        {/* Title & Favorite */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <label className="block text-sm font-body font-semibold text-brand-blue mb-3 uppercase tracking-wider">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="What's on your heart today?"
                className="w-full px-4 py-3 text-xl font-heading text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              />
            </div>
            
            {/* Favorite Toggle */}
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`mt-9 p-3 rounded-lg transition-colors ${
                isFavorite 
                  ? 'bg-yellow-100 text-yellow-500' 
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
            >
              <Star size={20} className={isFavorite ? 'fill-yellow-500' : ''} />
            </button>
          </div>
        </div>

        {/* Date & Entry Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Date */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-body font-semibold text-brand-blue mb-3 uppercase tracking-wider">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 font-body text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          {/* Entry Type Quick Display */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-body font-semibold text-brand-blue mb-3 uppercase tracking-wider">
              Entry Type
            </label>
            <div className="text-2xl font-heading text-brand-blue">
              {entryTypes.find(t => t.value === entryType)?.emoji} {entryTypes.find(t => t.value === entryType)?.label}
            </div>
            <p className="text-sm text-gray-500 font-body">
              {entryTypes.find(t => t.value === entryType)?.desc}
            </p>
          </div>
        </div>

        {/* Entry Type Selection */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-body font-semibold text-brand-blue mb-4 uppercase tracking-wider">
            Type of Entry
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {entryTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setEntryType(type.value)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  entryType === type.value 
                    ? 'border-brand-blue bg-brand-blue text-white' 
                    : 'border-gray-200 text-gray-700 hover:border-brand-blue'
                }`}
              >
                <div className="text-2xl mb-1">{type.emoji}</div>
                <div className="font-body font-semibold text-sm">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Mood Selection */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-body font-semibold text-brand-blue mb-4 uppercase tracking-wider">
            How is your spirit?
          </label>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {moods.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(mood === m.value ? '' : m.value)}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  mood === m.value 
                    ? 'border-brand-blue bg-brand-blue/5' 
                    : 'border-gray-200 hover:border-brand-blue'
                }`}
              >
                <div className="text-3xl mb-1">{m.emoji}</div>
                <div className={`font-body text-xs font-semibold ${
                  mood === m.value ? 'text-brand-blue' : 'text-gray-600'
                }`}>
                  {m.label}
                </div>
              </button>
            ))}
          </div>
          {mood && (
            <p className="text-xs text-gray-500 font-body mt-3">
              Click again to deselect
            </p>
          )}
        </div>

        {/* Content / Body */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-body font-semibold text-brand-blue mb-3 uppercase tracking-wider">
            Your Entry
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Pour out your heart here... Share what God is doing, what you're learning, what you're praying for, what you're grateful for..."
            rows={12}
            className="w-full px-4 py-3 font-body text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent leading-relaxed"
          />
          <p className="text-xs text-gray-500 font-body mt-2">
            {content.length} characters
          </p>
        </div>

        {/* Scripture */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-body font-semibold text-brand-blue mb-3 uppercase tracking-wider">
            Scripture (Optional)
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
                  placeholder="e.g., Psalm 23:1"
                  className="w-full pl-10 pr-4 py-3 font-scripture italic text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-body text-gray-500 mb-1">Scripture Text</label>
              <textarea
                value={scriptureText}
                onChange={(e) => setScriptureText(e.target.value)}
                placeholder="The LORD is my shepherd; I shall not want..."
                rows={3}
                className="w-full px-4 py-3 font-scripture italic text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-body font-semibold text-brand-blue mb-3 uppercase tracking-wider">
            Tags
          </label>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-gold-100 text-gold-700 px-3 py-1 rounded-full text-sm font-body font-semibold"
                >
                  #{tag}
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
              placeholder="e.g., faith, healing, family..."
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
            Press Enter or click Add. Tags help you find entries later.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-4">
          <Link
            to="/journal"
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
                Save Entry
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  )
}

export default JournalCreate
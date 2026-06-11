import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { 
  Sparkles, 
  ArrowLeft, 
  Save, 
  Trash2, 
  BookOpen,
  Loader,
  X,
  Pencil,
  Calendar,
  AlertCircle,
  Star,
  Copy,
  Check
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
  { value: 'reflection', emoji: '💭', label: 'Reflection' },
  { value: 'prayer', emoji: '🙏', label: 'Prayer' },
  { value: 'praise', emoji: '🎤', label: 'Praise' },
  { value: 'gratitude', emoji: '❤️', label: 'Gratitude' },
  { value: 'lesson', emoji: '📚', label: 'Lesson' },
  { value: 'devotional', emoji: '📖', label: 'Devotional' },
  { value: 'fasting', emoji: '🤲', label: 'Fasting' },
  { value: 'testimony', emoji: '✨', label: 'Testimony' },
]

interface JournalEntry {
  id: string
  title: string
  content: string | null
  mood: string | null
  scripture_text: string | null
  scripture_reference: string | null
  entry_type: string
  tags: string[]
  is_favorite: boolean
  entry_date: string
  created_at: string
  updated_at: string
}

function JournalView() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState(false)
  
  // Edit form states
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<string>('')
  const [entryType, setEntryType] = useState<string>('reflection')
  const [scriptureReference, setScriptureReference] = useState('')
  const [scriptureText, setScriptureText] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [entryDate, setEntryDate] = useState('')

  useEffect(() => {
    fetchEntry()
  }, [id, user])

  const fetchEntry = async () => {
    if (!user || !id) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      setEntry(data)
      setTitle(data.title || '')
      setContent(data.content || '')
      setMood(data.mood || '')
      setEntryType(data.entry_type || 'reflection')
      setScriptureReference(data.scripture_reference || '')
      setScriptureText(data.scripture_text || '')
      setTags(data.tags || [])
      setIsFavorite(data.is_favorite || false)
      setEntryDate(data.entry_date || '')
    } catch (err: any) {
      setError(err.message || 'Failed to load entry')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('journal_entries')
        .update({
          title: title.trim(),
          content: content.trim() || null,
          mood: mood || null,
          entry_type: entryType,
          scripture_reference: scriptureReference.trim() || null,
          scripture_text: scriptureText.trim() || null,
          tags: tags,
          is_favorite: isFavorite,
          entry_date: entryDate,
        })
        .eq('id', id)

      if (error) throw error

      setSuccess('Entry updated successfully!')
      setEditing(false)
      fetchEntry()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save entry')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this entry? This cannot be undone.'
    )
    if (!confirmed) return

    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)

      if (error) throw error

      navigate('/journal')
    } catch (err: any) {
      setError(err.message || 'Failed to delete entry')
    }
  }

  const toggleFavorite = async () => {
    if (!entry) return
    
    try {
      const { error } = await supabase
        .from('journal_entries')
        .update({ is_favorite: !entry.is_favorite })
        .eq('id', id)

      if (error) throw error

      setEntry({ ...entry, is_favorite: !entry.is_favorite })
      setIsFavorite(!entry.is_favorite)
    } catch (err: any) {
      setError('Failed to update favorite')
    }
  }

  const handleCopy = async () => {
    if (!entry) return

    let text = `${entry.title}\n`
    text += `Date: ${formatDate(entry.entry_date)}\n`
    if (entry.mood) text += `Mood: ${getMoodLabel(entry.mood)} ${getMoodEmoji(entry.mood)}\n`
    text += `Type: ${entryTypes.find(t => t.value === entry.entry_type)?.label}\n\n`
    
    if (entry.scripture_reference || entry.scripture_text) {
      text += `SCRIPTURE\n`
      if (entry.scripture_text) text += `"${entry.scripture_text}"\n`
      if (entry.scripture_reference) text += `— ${entry.scripture_reference} (KJV)\n\n`
    }

    if (entry.content) {
      text += `${entry.content}\n\n`
    }

    if (entry.tags && entry.tags.length > 0) {
      text += `Tags: ${entry.tags.map(t => `#${t}`).join(' ')}\n`
    }

    text += `\n---\nFrom my Christmade Devotional Journal`

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setError('Failed to copy')
    }
  }

  const addTag = () => {
    const trimmed = newTag.trim().toLowerCase()
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

  const getMoodEmoji = (m: string | null) => {
    return moods.find(mood => mood.value === m)?.emoji || ''
  }

  const getMoodLabel = (m: string | null) => {
    return moods.find(mood => mood.value === m)?.label || ''
  }

  const getTypeData = (type: string) => {
    return entryTypes.find(t => t.value === type)
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

  if (loading) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <div className="text-center">
          <Loader className="text-brand-blue animate-spin mx-auto mb-4" size={32} />
          <p className="text-gray-600 font-body">Loading entry...</p>
        </div>
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="min-h-screen p-10">
        <Link 
          to="/journal" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-brand-blue font-body text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Journal
        </Link>
        
        <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-2xl text-center max-w-2xl">
          <AlertCircle className="mx-auto mb-3" size={32} />
          <h2 className="text-xl font-heading font-bold mb-2">Entry Not Found</h2>
          <p className="font-body">This entry doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    )
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

      {/* Status Messages */}
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

      {/* Action Buttons */}
      {!editing && (
        <div className="max-w-4xl mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-body text-gray-500 uppercase tracking-wider mr-2">
                Actions:
              </span>
              
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white font-body font-semibold text-sm rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Pencil size={16} />
                Edit
              </button>

              <button
                onClick={toggleFavorite}
                className={`flex items-center gap-2 px-4 py-2 font-body font-semibold text-sm rounded-lg transition-colors ${
                  entry.is_favorite 
                    ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Star size={16} className={entry.is_favorite ? 'fill-yellow-500' : ''} />
                {entry.is_favorite ? 'Favorited' : 'Favorite'}
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-body font-semibold text-sm rounded-lg hover:bg-gray-200 transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </button>

              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-body font-semibold text-sm rounded-lg hover:bg-red-100 transition-colors ml-auto"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Mode Buttons */}
      {editing && (
        <div className="max-w-4xl mb-6 flex gap-2">
          <button
            onClick={() => {
              setEditing(false)
              fetchEntry()
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
        </div>
      )}

      {/* Header */}
      <div className="max-w-4xl mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-gold-500" size={20} />
          <span className="text-sm font-body text-gold-600 font-semibold uppercase tracking-wider">
            {editing ? 'Editing Entry' : 'Journal Entry'}
          </span>
          <span className={`inline-flex items-center gap-1 text-xs font-body font-semibold px-3 py-1 rounded-full ${getTypeStyle(entry.entry_type)}`}>
            {getTypeData(entry.entry_type)?.emoji} {getTypeData(entry.entry_type)?.label}
          </span>
          {entry.is_favorite && !editing && (
            <Star className="text-yellow-500 fill-yellow-500" size={16} />
          )}
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
            {entry.title}
          </h1>
        )}

        {/* Date and Mood */}
        <div className="flex items-center gap-4 text-gray-600 font-body">
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            {editing ? (
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="px-2 py-1 border border-gray-200 rounded text-sm"
              />
            ) : (
              <span>{formatDate(entry.entry_date)}</span>
            )}
          </div>
          
          {entry.mood && !editing && (
            <div className="flex items-center gap-1">
              <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
              <span className="text-sm">{getMoodLabel(entry.mood)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        
        {/* Edit Mode: Entry Type */}
        {editing && (
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
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
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
        )}

        {/* Edit Mode: Mood */}
        {editing && (
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
          </div>
        )}

        {/* Scripture */}
        {(entry.scripture_reference || entry.scripture_text || editing) && (
          <div className="bg-gradient-to-br from-brand-blue to-primary-900 rounded-2xl p-6 md:p-8 text-white">
            <div className="flex items-center gap-2 mb-3">
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
                  placeholder="Reference (e.g., Psalm 23:1)"
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
                {entry.scripture_text && (
                  <p className="text-xl md:text-2xl font-scripture italic mb-3 leading-relaxed">
                    "{entry.scripture_text}"
                  </p>
                )}
                {entry.scripture_reference && (
                  <p className="text-gold-500 font-body font-semibold">
                    — {entry.scripture_reference} (KJV)
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* Content */}
        {(entry.content || editing) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            {editing ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                placeholder="Your entry..."
                className="w-full px-4 py-3 font-body text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue leading-relaxed"
              />
            ) : (
              <p className="font-body text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                {entry.content}
              </p>
            )}
          </div>
        )}

        {/* Tags */}
        {((entry.tags && entry.tags.length > 0) || editing) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-body font-semibold text-brand-blue mb-3 uppercase tracking-wider">
              Tags
            </label>
            
            {editing ? (
              <>
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
              </>
            ) : (
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="inline-block bg-gold-100 text-gold-700 px-3 py-1 rounded-full text-sm font-body font-semibold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Metadata Footer */}
        {!editing && (
          <div className="bg-gray-50 rounded-2xl p-6 text-center">
            <div className="text-gray-500 text-sm font-body">
              <p>Created {formatDate(entry.created_at)}</p>
              {entry.created_at !== entry.updated_at && (
                <p className="mt-1">Last updated {formatDate(entry.updated_at)}</p>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  )
}

export default JournalView
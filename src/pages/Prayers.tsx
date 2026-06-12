// src/pages/Prayers.tsx
// ═══════════════════════════════════════════════════════════
// PRAYER REQUEST TRACKER
// Personal prayer journal with answered testimonies
// ═══════════════════════════════════════════════════════════

import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import {
  HandHeart,
  Plus,
  Sparkles,
  CheckCircle,
  Clock,
  PauseCircle,
  Trash2,
  Edit2,
  X,
  Save,
  Loader,
  Tag,
  BookOpen,
  Calendar,
  Heart,
  Star,
} from 'lucide-react'

interface Prayer {
  id: string
  title: string
  description: string | null
  category: string | null
  status: 'praying' | 'answered' | 'on_hold'
  scripture_reference: string | null
  testimony: string | null
  answered_at: string | null
  created_at: string
  updated_at: string
}

const PRAYER_CATEGORIES = [
  { value: 'personal', label: 'Personal', emoji: '🙏' },
  { value: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
  { value: 'health', label: 'Health', emoji: '💊' },
  { value: 'finances', label: 'Finances', emoji: '💰' },
  { value: 'ministry', label: 'Ministry', emoji: '⛪' },
  { value: 'work', label: 'Work/Career', emoji: '💼' },
  { value: 'relationships', label: 'Relationships', emoji: '❤️' },
  { value: 'nation', label: 'Nation', emoji: '🌍' },
  { value: 'salvation', label: 'Salvation', emoji: '✝️' },
  { value: 'other', label: 'Other', emoji: '✨' },
]

function Prayers() {
  const { user } = useAuth()
  const [prayers, setPrayers] = useState<Prayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'praying' | 'answered' | 'on_hold'>('all')
  
  // Form states
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('personal')
  const [scriptureRef, setScriptureRef] = useState('')
  const [saving, setSaving] = useState(false)

  // Testimony modal
  const [testimonyPrayer, setTestimonyPrayer] = useState<Prayer | null>(null)
  const [testimonyText, setTestimonyText] = useState('')
  const [savingTestimony, setSavingTestimony] = useState(false)

  useEffect(() => {
    fetchPrayers()
  }, [user])

  const fetchPrayers = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('prayers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPrayers(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load prayers')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setCategory('personal')
    setScriptureRef('')
    setEditingId(null)
    setError('')
  }

  const handleStartCreate = () => {
    resetForm()
    setShowForm(true)
  }

  const handleStartEdit = (p: Prayer) => {
    setTitle(p.title)
    setDescription(p.description || '')
    setCategory(p.category || 'personal')
    setScriptureRef(p.scripture_reference || '')
    setEditingId(p.id)
    setShowForm(true)
    setError('')
  }

  const handleCancel = () => {
    resetForm()
    setShowForm(false)
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Prayer title is required')
      return
    }
    if (!user) return

    setSaving(true)
    setError('')

    try {
      if (editingId) {
        const { error } = await supabase
          .from('prayers')
          .update({
            title: title.trim(),
            description: description.trim() || null,
            category,
            scripture_reference: scriptureRef.trim() || null,
          })
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase.from('prayers').insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          category,
          scripture_reference: scriptureRef.trim() || null,
          status: 'praying',
        })

        if (error) throw error
      }

      await fetchPrayers()
      resetForm()
      setShowForm(false)
    } catch (err: any) {
      setError(err.message || 'Failed to save prayer')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (p: Prayer, newStatus: Prayer['status']) => {
    // If marking as answered, open testimony modal
    if (newStatus === 'answered' && p.status !== 'answered') {
      setTestimonyPrayer(p)
      setTestimonyText(p.testimony || '')
      return
    }

    try {
      const { error } = await supabase
        .from('prayers')
        .update({ status: newStatus })
        .eq('id', p.id)

      if (error) throw error
      await fetchPrayers()
    } catch (err: any) {
      alert(err.message || 'Failed to update status')
    }
  }

  const handleSaveTestimony = async () => {
    if (!testimonyPrayer) return

    setSavingTestimony(true)
    try {
      const { error } = await supabase
        .from('prayers')
        .update({
          status: 'answered',
          testimony: testimonyText.trim() || null,
        })
        .eq('id', testimonyPrayer.id)

      if (error) throw error
      await fetchPrayers()
      setTestimonyPrayer(null)
      setTestimonyText('')
    } catch (err: any) {
      alert(err.message || 'Failed to save testimony')
    } finally {
      setSavingTestimony(false)
    }
  }

  const handleDelete = async (p: Prayer) => {
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return

    try {
      const { error } = await supabase
        .from('prayers')
        .delete()
        .eq('id', p.id)

      if (error) throw error
      await fetchPrayers()
    } catch (err: any) {
      alert(err.message || 'Failed to delete prayer')
    }
  }

  // ─── Stats ───
  const total = prayers.length
  const prayingCount = prayers.filter((p) => p.status === 'praying').length
  const answeredCount = prayers.filter((p) => p.status === 'answered').length
  const onHoldCount = prayers.filter((p) => p.status === 'on_hold').length

  // ─── Filtered list ───
  const filteredPrayers = filter === 'all' ? prayers : prayers.filter((p) => p.status === filter)

  // ─── Helpers ───
  const getCategoryInfo = (cat: string | null) => {
    return PRAYER_CATEGORIES.find((c) => c.value === cat) || PRAYER_CATEGORIES[0]
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'praying':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'answered':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'on_hold':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'praying':
        return <Clock size={12} />
      case 'answered':
        return <CheckCircle size={12} />
      case 'on_hold':
        return <PauseCircle size={12} />
      default:
        return null
    }
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
                Prayer Wall
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-brand-blue mb-3">
              Your Prayer Journey
            </h1>
            <p className="text-gray-600 text-lg font-body max-w-2xl">
              Bring every request before God. Track His faithfulness. Celebrate every answered prayer.
            </p>
          </div>

          <button
            onClick={handleStartCreate}
            className="flex items-center gap-2 bg-brand-blue text-white font-body font-bold px-6 py-3 rounded-xl hover:bg-primary-700 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <Plus size={20} />
            New Prayer
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                <HandHeart className="text-white" size={18} />
              </div>
              <p className="text-gray-500 text-xs font-body">Total</p>
            </div>
            <p className="text-2xl font-heading font-bold text-brand-blue">{total}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <Clock className="text-white" size={18} />
              </div>
              <p className="text-gray-500 text-xs font-body">Praying</p>
            </div>
            <p className="text-2xl font-heading font-bold text-brand-blue">{prayingCount}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                <CheckCircle className="text-white" size={18} />
              </div>
              <p className="text-gray-500 text-xs font-body">Answered</p>
            </div>
            <p className="text-2xl font-heading font-bold text-brand-blue">{answeredCount}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                <PauseCircle className="text-white" size={18} />
              </div>
              <p className="text-gray-500 text-xs font-body">On Hold</p>
            </div>
            <p className="text-2xl font-heading font-bold text-brand-blue">{onHoldCount}</p>
          </div>

        </div>

        {/* Encouragement Banner */}
        {answeredCount > 0 && (
          <div className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Heart className="text-white" size={20} />
              </div>
              <div>
                <p className="font-heading font-bold text-green-800">
                  🙌 {answeredCount} prayer{answeredCount === 1 ? '' : 's'} answered!
                </p>
                <p className="text-xs text-green-700 font-body">
                  God is faithful. Keep believing for the rest.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        {prayers.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-body font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-brand-blue text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-blue'
              }`}
            >
              All ({total})
            </button>
            <button
              onClick={() => setFilter('praying')}
              className={`px-4 py-2 rounded-lg text-sm font-body font-semibold transition-colors ${
                filter === 'praying'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-500'
              }`}
            >
              🙏 Praying ({prayingCount})
            </button>
            <button
              onClick={() => setFilter('answered')}
              className={`px-4 py-2 rounded-lg text-sm font-body font-semibold transition-colors ${
                filter === 'answered'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-green-500'
              }`}
            >
              ✅ Answered ({answeredCount})
            </button>
            <button
              onClick={() => setFilter('on_hold')}
              className={`px-4 py-2 rounded-lg text-sm font-body font-semibold transition-colors ${
                filter === 'on_hold'
                  ? 'bg-gray-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-500'
              }`}
            >
              ⏸️ On Hold ({onHoldCount})
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            CREATE/EDIT FORM (inline)
            ═══════════════════════════════════════════════════════════ */}
        {showForm && (
          <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading font-bold text-brand-blue">
                {editingId ? 'Edit Prayer' : 'New Prayer Request'}
              </h3>
              <button
                onClick={handleCancel}
                className="p-1.5 hover:bg-white rounded-lg transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {error && (
              <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs font-body">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-body font-semibold text-gray-700 mb-1">
                  Prayer Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Healing for Mom"
                  className="w-full px-3 py-2 font-body text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-body font-semibold text-gray-700 mb-1">
                  Description / Details
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What are you asking God for? Be specific..."
                  rows={3}
                  className="w-full px-3 py-2 font-body text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-body font-semibold text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 font-body text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white"
                  >
                    {PRAYER_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.emoji} {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-body font-semibold text-gray-700 mb-1">
                    Scripture (Optional)
                  </label>
                  <input
                    type="text"
                    value={scriptureRef}
                    onChange={(e) => setScriptureRef(e.target.value)}
                    placeholder="e.g., Isaiah 53:5"
                    className="w-full px-3 py-2 font-body text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-blue text-white font-body font-bold px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 text-sm"
                >
                  {saving ? (
                    <>
                      <Loader className="animate-spin" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {editingId ? 'Update Prayer' : 'Add Prayer'}
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-4 py-2.5 text-gray-700 font-body font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            PRAYERS LIST
            ═══════════════════════════════════════════════════════════ */}
        <div>
          <h2 className="text-2xl font-heading font-bold text-brand-blue mb-6">
            {filter === 'all' ? 'All Prayers' : 
             filter === 'praying' ? 'Currently Praying' :
             filter === 'answered' ? 'Answered Prayers' :
             'On Hold'}
          </h2>

          {loading && (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <Loader className="text-brand-blue animate-spin mx-auto mb-4" size={32} />
              <p className="text-gray-600 font-body">Loading your prayers...</p>
            </div>
          )}

          {!loading && prayers.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4">
                <HandHeart className="text-white" size={36} />
              </div>
              <h3 className="text-2xl font-heading font-bold text-brand-blue mb-2">
                Start Your Prayer Journey
              </h3>
              <p className="text-gray-600 font-body mb-6 max-w-md mx-auto">
                Cast every care upon Him. Your prayers matter. God hears every word.
              </p>
              <button
                onClick={handleStartCreate}
                className="inline-flex items-center gap-2 bg-brand-blue text-white font-body font-bold px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors"
              >
                <Plus size={20} />
                Write Your First Prayer
              </button>
            </div>
          )}

          {!loading && prayers.length > 0 && filteredPrayers.length === 0 && (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <p className="text-gray-600 font-body">No prayers in this category.</p>
            </div>
          )}

          {!loading && filteredPrayers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPrayers.map((prayer) => {
                const catInfo = getCategoryInfo(prayer.category)
                const isAnswered = prayer.status === 'answered'
                
                return (
                  <div
                    key={prayer.id}
                    className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-md ${
                      isAnswered
                        ? 'border-green-200 bg-gradient-to-br from-green-50/30 to-white'
                        : 'border-gray-100'
                    }`}
                  >
                    {/* Top row: Status + Actions */}
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <span className={`inline-flex items-center gap-1 text-xs font-body font-semibold px-3 py-1 rounded-full border ${getStatusStyle(prayer.status)}`}>
                        {getStatusIcon(prayer.status)}
                        {prayer.status === 'on_hold' ? 'On Hold' : prayer.status.charAt(0).toUpperCase() + prayer.status.slice(1)}
                      </span>

                      <div className="flex gap-1">
                        <button
                          onClick={() => handleStartEdit(prayer)}
                          className="p-1.5 text-gray-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(prayer)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="flex items-center gap-2 mb-2">
                      <Tag size={12} className="text-gray-400" />
                      <span className="text-xs font-body text-gray-600">
                        {catInfo.emoji} {catInfo.label}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-heading font-bold text-brand-blue mb-2 line-clamp-2">
                      {prayer.title}
                    </h3>

                    {/* Description */}
                    {prayer.description && (
                      <p className="text-gray-600 text-sm font-body mb-3 line-clamp-3 leading-relaxed">
                        {prayer.description}
                      </p>
                    )}

                    {/* Scripture */}
                    {prayer.scripture_reference && (
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="text-gold-600" size={14} />
                        <p className="text-gold-700 text-sm font-scripture italic">
                          {prayer.scripture_reference}
                        </p>
                      </div>
                    )}

                    {/* Testimony (if answered) */}
                    {prayer.testimony && (
                      <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg mb-3">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="text-green-600" size={12} />
                          <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider">
                            Testimony
                          </p>
                        </div>
                        <p className="text-sm text-green-800 font-body italic">
                          "{prayer.testimony}"
                        </p>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 font-body mb-3">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={11} />
                        Added {formatDate(prayer.created_at)}
                      </span>
                      {prayer.answered_at && (
                        <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                          <CheckCircle size={11} />
                          Answered {formatDate(prayer.answered_at)}
                        </span>
                      )}
                    </div>

                    {/* Quick status actions */}
                    <div className="flex gap-1.5 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleStatusChange(prayer, 'praying')}
                        disabled={prayer.status === 'praying'}
                        className={`flex-1 py-1.5 text-[11px] font-body font-semibold rounded-lg transition-colors ${
                          prayer.status === 'praying'
                            ? 'bg-blue-100 text-blue-700 cursor-default'
                            : 'bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                        }`}
                      >
                        🙏 Praying
                      </button>
                      <button
                        onClick={() => handleStatusChange(prayer, 'answered')}
                        disabled={prayer.status === 'answered'}
                        className={`flex-1 py-1.5 text-[11px] font-body font-semibold rounded-lg transition-colors ${
                          prayer.status === 'answered'
                            ? 'bg-green-100 text-green-700 cursor-default'
                            : 'bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-700'
                        }`}
                      >
                        ✅ Answered
                      </button>
                      <button
                        onClick={() => handleStatusChange(prayer, 'on_hold')}
                        disabled={prayer.status === 'on_hold'}
                        className={`flex-1 py-1.5 text-[11px] font-body font-semibold rounded-lg transition-colors ${
                          prayer.status === 'on_hold'
                            ? 'bg-gray-200 text-gray-700 cursor-default'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        ⏸️ Hold
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Scripture Footer */}
        <div className="mt-12 p-8 bg-gradient-to-br from-brand-blue to-primary-900 rounded-2xl text-center">
          <p className="text-gold-500 font-scripture text-xl italic mb-2">
            "Call unto me, and I will answer thee, and shew thee great and mighty things, which thou knowest not."
          </p>
          <p className="text-white font-body text-sm opacity-80">
            — Jeremiah 33:3 (KJV)
          </p>
        </div>

      </div>

      {/* ═══════════════════════════════════════════════════════════
          TESTIMONY MODAL (when marking as answered)
          ═══════════════════════════════════════════════════════════ */}
      {testimonyPrayer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-t-2xl p-5 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-heading font-bold mb-1">
                Prayer Answered! 🙌
              </h3>
              <p className="text-green-50 text-sm font-body">
                "{testimonyPrayer.title}"
              </p>
            </div>

            <div className="p-5">
              <label className="block text-sm font-body font-semibold text-brand-blue mb-2">
                Share your testimony (optional)
              </label>
              <textarea
                value={testimonyText}
                onChange={(e) => setTestimonyText(e.target.value)}
                placeholder="How did God answer this prayer? What happened?"
                rows={4}
                className="w-full px-3 py-2 font-body text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              />
              <p className="text-xs text-gray-500 font-body mt-1">
                Remembering His faithfulness builds your faith for the next prayer.
              </p>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSaveTestimony}
                  disabled={savingTestimony}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white font-body font-bold px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {savingTestimony ? (
                    <>
                      <Loader className="animate-spin" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Testimony
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setTestimonyPrayer(null)
                    setTestimonyText('')
                  }}
                  disabled={savingTestimony}
                  className="px-4 py-2.5 text-gray-700 font-body font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Prayers
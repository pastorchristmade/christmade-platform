// src/components/SermonSeriesManager.tsx
// ═══════════════════════════════════════════════════════════
// SERMON SERIES MANAGER
// Modal for creating/editing/deleting sermon series
// ═══════════════════════════════════════════════════════════

import { useState } from 'react'
import { useSermonSeries, SERIES_COLORS } from '../hooks/useSermonSeries'
import type { SermonSeries } from '../hooks/useSermonSeries'
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Save,
  Loader,
  BookMarked,
  Check,
} from 'lucide-react'

interface SermonSeriesManagerProps {
  isOpen: boolean
  onClose: () => void
}

const SermonSeriesManager = ({ isOpen, onClose }: SermonSeriesManagerProps) => {
  const { series, loading, createSeries, updateSeries, deleteSeries } = useSermonSeries()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(SERIES_COLORS[0].value)
  const [totalParts, setTotalParts] = useState(3)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const resetForm = () => {
    setName('')
    setDescription('')
    setColor(SERIES_COLORS[0].value)
    setTotalParts(3)
    setEditingId(null)
    setError('')
  }

  const handleStartCreate = () => {
    resetForm()
    setShowForm(true)
  }

  const handleStartEdit = (s: SermonSeries) => {
    setName(s.name)
    setDescription(s.description || '')
    setColor(s.color)
    setTotalParts(s.total_parts)
    setEditingId(s.id)
    setShowForm(true)
    setError('')
  }

  const handleCancel = () => {
    resetForm()
    setShowForm(false)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Series name is required')
      return
    }

    setSaving(true)
    setError('')

    try {
      if (editingId) {
        await updateSeries(editingId, {
          name: name.trim(),
          description: description.trim(),
          color,
          total_parts: totalParts,
        })
      } else {
        await createSeries(name, description, color, totalParts)
      }
      resetForm()
      setShowForm(false)
    } catch (err: any) {
      setError(err.message || 'Failed to save series')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (s: SermonSeries) => {
    const sermonCount = s.sermon_count || 0
    const message =
      sermonCount > 0
        ? `Delete "${s.name}"? ${sermonCount} sermon${sermonCount === 1 ? '' : 's'} will be unlinked (but not deleted).`
        : `Delete "${s.name}"? This cannot be undone.`

    if (!window.confirm(message)) return

    try {
      await deleteSeries(s.id)
    } catch (err: any) {
      alert(err.message || 'Failed to delete series')
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-8 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-blue/10 rounded-lg flex items-center justify-center">
              <BookMarked className="text-brand-blue" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-heading font-bold text-brand-blue">
                Sermon Series
              </h3>
              <p className="text-xs text-gray-500 font-body">
                Group related sermons together
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          
          {/* ═══════════════════════════════════════════════════════════
              FORM (Create or Edit)
              ═══════════════════════════════════════════════════════════ */}
          {showForm && (
            <div className="mb-5 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h4 className="text-sm font-heading font-bold text-brand-blue mb-3 uppercase tracking-wider">
                {editingId ? 'Edit Series' : 'New Series'}
              </h4>

              {error && (
                <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs font-body">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                {/* Name */}
                <div>
                  <label className="block text-xs font-body font-semibold text-gray-700 mb-1">
                    Series Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., The Beatitudes"
                    className="w-full px-3 py-2 font-body text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-body font-semibold text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this series about?"
                    rows={2}
                    className="w-full px-3 py-2 font-body text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white"
                  />
                </div>

                {/* Total Parts */}
                <div>
                  <label className="block text-xs font-body font-semibold text-gray-700 mb-1">
                    Total Parts (planned)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={totalParts}
                    onChange={(e) => setTotalParts(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 font-body text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white"
                  />
                  <p className="text-[11px] text-gray-500 font-body mt-1">
                    e.g., 5 if you plan 5 sermons in this series
                  </p>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-xs font-body font-semibold text-gray-700 mb-2">
                    Series Color
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {SERIES_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setColor(c.value)}
                        className={`h-10 rounded-lg bg-gradient-to-br ${c.value} relative transition-all hover:scale-105 ${
                          color === c.value
                            ? 'ring-2 ring-offset-2 ring-brand-blue'
                            : ''
                        }`}
                        title={c.label}
                      >
                        {color === c.value && (
                          <Check className="text-white absolute inset-0 m-auto" size={16} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
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
                        {editingId ? 'Update Series' : 'Create Series'}
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
              EXISTING SERIES LIST
              ═══════════════════════════════════════════════════════════ */}
          {!showForm && (
            <button
              onClick={handleStartCreate}
              className="w-full mb-4 flex items-center justify-center gap-2 bg-brand-blue text-white font-body font-bold px-4 py-3 rounded-xl hover:bg-primary-700 transition-colors"
            >
              <Plus size={18} />
              Create New Series
            </button>
          )}

          {loading && (
            <div className="text-center py-8">
              <Loader className="text-brand-blue animate-spin mx-auto mb-2" size={24} />
              <p className="text-sm text-gray-600 font-body">Loading series...</p>
            </div>
          )}

          {!loading && series.length === 0 && !showForm && (
            <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <BookMarked className="text-gray-400 mx-auto mb-2" size={32} />
              <p className="text-sm font-body text-gray-600 mb-1">
                No series yet
              </p>
              <p className="text-xs font-body text-gray-500">
                Create your first sermon series to group related messages
              </p>
            </div>
          )}

          {!loading && series.length > 0 && (
            <div className="space-y-2">
              {series.map((s) => {
                const progress = s.total_parts > 0 ? ((s.sermon_count || 0) / s.total_parts) * 100 : 0
                return (
                  <div
                    key={s.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className={`h-1.5 bg-gradient-to-r ${s.color}`} />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-heading font-bold text-brand-blue line-clamp-1">
                            {s.name}
                          </h4>
                          {s.description && (
                            <p className="text-xs text-gray-600 font-body line-clamp-2 mt-0.5">
                              {s.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleStartEdit(s)}
                            className="p-1.5 text-gray-500 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(s)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Progress */}
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
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <p className="text-[11px] text-gray-500 font-body text-center">
            💡 Tip: After creating a series, you can assign sermons to it when creating or editing
          </p>
        </div>

      </div>
    </div>
  )
}

export default SermonSeriesManager
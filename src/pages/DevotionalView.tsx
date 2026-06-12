// src/pages/DevotionalView.tsx
// ═══════════════════════════════════════════════════════════
// DEVOTIONAL VIEW PAGE
// Displays a single published devotional for users to read
// ═══════════════════════════════════════════════════════════

import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import {
  ArrowLeft,
  BookOpen,
  Heart,
  Calendar,
  Tag,
  User,
  Eye,
  Sparkles,
  HandHeart,
  MessageCircle,
  NotebookPen,
  Share2,
} from 'lucide-react'

// ─── Type Definition ───
interface Devotional {
  id: string
  title: string
  scripture_reference: string
  scripture_text: string
  message: string
  prayer_point: string | null
  reflection_question: string | null
  topic: string | null
  author_id: string
  author_name: string
  publish_date: string
  status: string
  view_count: number
  created_at: string
  updated_at: string
}

const DevotionalView = () => {
  // ─── Hooks ───
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // ─── State ───
  const [devotional, setDevotional] = useState<Devotional | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // ─── Fetch the devotional from Supabase ───
  useEffect(() => {
    const fetchDevotional = async () => {
      if (!id) {
        setError('No devotional ID provided')
        setLoading(false)
        return
      }

      try {
        // Get the devotional
        const { data, error: fetchError } = await supabase
          .from('devotionals')
          .select('*')
          .eq('id', id)
          .single()

        if (fetchError) throw fetchError
        if (!data) throw new Error('Devotional not found')

        // Only allow viewing published devotionals
        if (data.status !== 'published') {
          throw new Error('This devotional is not yet published')
        }

        setDevotional(data)

        // Increment view count (fire and forget)
        await supabase
          .from('devotionals')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', id)
      } catch (err: any) {
        console.error('Error fetching devotional:', err)
        setError(err.message || 'Failed to load devotional')
      } finally {
        setLoading(false)
      }
    }

    fetchDevotional()
  }, [id])

  // ─── Format publish date ───
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // ─── Share devotional ───
  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('Link copied: ' + url)
    }
  }

  // ─── Add to journal (pre-fills journal create page) ───
  const handleAddToJournal = () => {
    if (!devotional) return
    navigate('/journal/new', {
      state: {
        fromDevotional: true,
        devotionalTitle: devotional.title,
        devotionalScripture: devotional.scripture_reference,
        devotionalTopic: devotional.topic,
      },
    })
  }

  // ═══════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6 animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded"></div>
        <div className="h-12 w-3/4 bg-gray-300 rounded"></div>
        <div className="h-32 bg-gray-200 rounded-2xl"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════
  // ERROR STATE
  // ═══════════════════════════════════════════════════════════
  if (error || !devotional) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-12">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center border border-gray-100">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-heading text-brand-blue mb-3">
            Devotional Not Available
          </h2>
          <p className="text-gray-600 mb-8">
            {error || 'This devotional could not be found.'}
          </p>
          <Link
            to="/journal"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-xl hover:bg-blue-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Devotionals
          </Link>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════
  // MAIN DEVOTIONAL DISPLAY
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* ─── Back Button ─── */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-brand-blue hover:text-blue-900 mb-6 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Devotionals
      </button>

      {/* ─── Top Badge ─── */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-brand-gold" />
        <span className="text-brand-gold font-bold uppercase tracking-wider text-sm">
          Daily Devotional
        </span>
      </div>

      {/* ─── Title ─── */}
      <h1 className="text-4xl sm:text-5xl font-heading text-brand-blue mb-6 leading-tight">
        {devotional.title}
      </h1>

      {/* ─── Meta Info Row ─── */}
      <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-gray-600 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-blue" />
          <span>{formatDate(devotional.publish_date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-brand-blue" />
          <span>By {devotional.author_name}</span>
        </div>
        {devotional.topic && (
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-brand-blue" />
            <span className="px-3 py-1 bg-blue-50 text-brand-blue rounded-full font-medium">
              {devotional.topic}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <Eye className="w-4 h-4 text-gray-400" />
          <span>{devotional.view_count + 1} views</span>
        </div>
      </div>

      {/* ─── Scripture Card ─── */}
      <div className="bg-gradient-to-br from-brand-blue to-blue-900 rounded-2xl p-8 mb-8 shadow-xl border-l-4 border-brand-gold">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-brand-gold" />
          <span className="text-brand-gold font-bold uppercase tracking-wider text-sm">
            Today's Scripture
          </span>
        </div>
        <p className="text-white text-xl sm:text-2xl font-scripture italic leading-relaxed mb-4">
          "{devotional.scripture_text}"
        </p>
        <p className="text-brand-gold font-bold text-lg">
          — {devotional.scripture_reference}
        </p>
      </div>

      {/* ─── Main Message ─── */}
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-10 mb-8 border border-gray-100">
        <h2 className="text-2xl font-heading text-brand-blue mb-6 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-brand-gold" />
          Today's Message
        </h2>
        <div className="prose prose-lg max-w-none">
          {devotional.message.split('\n').map((paragraph, idx) =>
            paragraph.trim() ? (
              <p
                key={idx}
                className="text-gray-700 leading-relaxed mb-4 text-lg"
              >
                {paragraph}
              </p>
            ) : null
          )}
        </div>
      </div>

      {/* ─── Prayer Point (if exists) ─── */}
      {devotional.prayer_point && (
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 sm:p-8 mb-8 border-l-4 border-brand-gold shadow-sm">
          <h3 className="text-xl font-heading text-brand-blue mb-4 flex items-center gap-2">
            <HandHeart className="w-6 h-6 text-brand-gold" />
            Prayer Point
          </h3>
          <p className="text-gray-700 leading-relaxed text-lg italic">
            {devotional.prayer_point}
          </p>
        </div>
      )}

      {/* ─── Reflection Question (if exists) ─── */}
      {devotional.reflection_question && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-8 mb-8 border-l-4 border-brand-blue shadow-sm">
          <h3 className="text-xl font-heading text-brand-blue mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-blue" />
            Reflect & Respond
          </h3>
          <p className="text-gray-700 leading-relaxed text-lg">
            {devotional.reflection_question}
          </p>
        </div>
      )}

      {/* ─── Action Buttons ─── */}
      <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
        <h3 className="text-lg font-heading text-brand-blue mb-4 text-center">
          What will you do with today's word?
        </h3>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleAddToJournal}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-xl hover:bg-blue-900 transition-all font-medium shadow-sm hover:shadow-md"
          >
            <NotebookPen className="w-5 h-5" />
            Reflect in My Journal
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-brand-blue text-brand-blue rounded-xl hover:bg-blue-50 transition-all font-medium"
          >
            <Share2 className="w-5 h-5" />
            {copied ? 'Link Copied! ✓' : 'Share Devotional'}
          </button>
        </div>
      </div>

      {/* ─── Closing Scripture Footer ─── */}
      <div className="text-center py-8 border-t border-gray-200">
        <Heart className="w-8 h-8 text-brand-gold mx-auto mb-3" />
        <p className="text-gray-600 italic font-scripture">
          "Thy word is a lamp unto my feet, and a light unto my path."
        </p>
        <p className="text-brand-blue font-bold mt-2">— Psalm 119:105</p>
      </div>
    </div>
  )
}

export default DevotionalView
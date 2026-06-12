import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import ShareCard from '../components/ShareCard'
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
  Star,
} from 'lucide-react'

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
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [devotional, setDevotional] = useState<Devotional | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [showShareCard, setShowShareCard] = useState(false)

  useEffect(() => {
    const fetchDevotional = async () => {
      if (!id) {
        setError('No devotional ID provided')
        setLoading(false)
        return
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('devotionals')
          .select('*')
          .eq('id', id)
          .single()

        if (fetchError) throw fetchError
        if (!data) throw new Error('Devotional not found')

        if (data.status !== 'published') {
          throw new Error('This devotional is not yet published')
        }

        setDevotional(data)

        await supabase
          .from('devotionals')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', id)

        if (user) {
          const { data: favData } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('item_type', 'devotional')
            .eq('item_id', id)
            .maybeSingle()

          if (favData) setIsFavorite(true)
        }
      } catch (err: any) {
        console.error('Error fetching devotional:', err)
        setError(err.message || 'Failed to load devotional')
      } finally {
        setLoading(false)
      }
    }

    fetchDevotional()
  }, [id, user])

  const handleToggleFavorite = async () => {
    if (!user || !devotional) return
    setFavoriteLoading(true)

    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_type', 'devotional')
          .eq('item_id', devotional.id)
        setIsFavorite(false)
      } else {
        await supabase.from('favorites').insert({
          user_id: user.id,
          item_type: 'devotional',
          item_id: devotional.id,
        })
        setIsFavorite(true)
      }
    } catch (err) {
      console.error('Error toggling favorite:', err)
    } finally {
      setFavoriteLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

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
            to="/devotionals"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-xl hover:bg-blue-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Devotionals
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Back + Favorite */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-brand-blue hover:text-blue-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Devotionals
          </button>

          <button
            onClick={handleToggleFavorite}
            disabled={favoriteLoading}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              isFavorite
                ? 'bg-brand-gold text-brand-blue shadow-md hover:shadow-lg'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-brand-gold hover:text-brand-gold'
            } ${favoriteLoading ? 'opacity-50 cursor-wait' : ''}`}
          >
            <Star
              className={`w-4 h-4 ${isFavorite ? 'fill-brand-blue' : ''}`}
            />
            {isFavorite ? 'Favorited' : 'Add to Favorites'}
          </button>
        </div>

        {/* Top Badge */}
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-brand-gold" />
          <span className="text-brand-gold font-bold uppercase tracking-wider text-sm">
            Daily Devotional
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-heading text-brand-blue mb-6 leading-tight">
          {devotional.title}
        </h1>

        {/* Meta */}
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

        {/* Scripture */}
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

        {/* Message */}
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

        {/* Prayer Point */}
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

        {/* Reflection */}
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

        {/* Action Buttons */}
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
              onClick={() => setShowShareCard(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-brand-blue text-brand-blue rounded-xl hover:bg-blue-50 transition-all font-medium"
            >
              <Share2 className="w-5 h-5" />
              Share Devotional
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200">
          <Heart className="w-8 h-8 text-brand-gold mx-auto mb-3" />
          <p className="text-gray-600 italic font-scripture">
            "Thy word is a lamp unto my feet, and a light unto my path."
          </p>
          <p className="text-brand-blue font-bold mt-2">— Psalm 119:105</p>
        </div>
      </div>

      {/* Share Card Modal */}
      <ShareCard
        isOpen={showShareCard}
        onClose={() => setShowShareCard(false)}
        title={devotional.title}
        scripture={devotional.scripture_text}
        reference={devotional.scripture_reference}
        topic={devotional.topic || undefined}
        type="devotional"
      />
    </>
  )
}

export default DevotionalView
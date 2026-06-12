// src/pages/Devotionals.tsx
// ═══════════════════════════════════════════════════════════
// DEVOTIONAL LIBRARY PAGE (with Favorites)
// ═══════════════════════════════════════════════════════════

import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import {
  ArrowLeft,
  Search,
  BookOpen,
  Tag,
  Calendar,
  Eye,
  Sparkles,
  ArrowRight,
  Loader,
  Filter,
  Star,
} from 'lucide-react'

interface Devotional {
  id: string
  title: string
  scripture_reference: string
  scripture_text: string
  topic: string | null
  publish_date: string
  view_count: number
  author_name: string
}

const Devotionals = () => {
  const { user } = useAuth()
  const [devotionals, setDevotionals] = useState<Devotional[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<string>('all')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  // ─── Fetch devotionals + favorites ───
  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]

        // Fetch devotionals
        const { data: devData, error: fetchError } = await supabase
          .from('devotionals')
          .select(
            'id, title, scripture_reference, scripture_text, topic, publish_date, view_count, author_name'
          )
          .eq('status', 'published')
          .lte('publish_date', today)
          .order('publish_date', { ascending: false })

        if (fetchError) throw fetchError
        setDevotionals(devData || [])

        // Fetch user's favorites
        if (user) {
          const { data: favData } = await supabase
            .from('favorites')
            .select('item_id')
            .eq('user_id', user.id)
            .eq('item_type', 'devotional')

          if (favData) {
            setFavoriteIds(new Set(favData.map((f) => f.item_id)))
          }
        }
      } catch (err: any) {
        console.error('Error fetching devotionals:', err)
        setError(err.message || 'Failed to load devotionals')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  // ─── Toggle favorite ───
  const handleToggleFavorite = async (
    e: React.MouseEvent,
    devotionalId: string
  ) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return

    const isFav = favoriteIds.has(devotionalId)
    const newSet = new Set(favoriteIds)

    try {
      if (isFav) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_type', 'devotional')
          .eq('item_id', devotionalId)
        newSet.delete(devotionalId)
      } else {
        await supabase.from('favorites').insert({
          user_id: user.id,
          item_type: 'devotional',
          item_id: devotionalId,
        })
        newSet.add(devotionalId)
      }
      setFavoriteIds(newSet)
    } catch (err) {
      console.error('Error toggling favorite:', err)
    }
  }

  // ─── Unique topics ───
  const topics = useMemo(() => {
    const uniqueTopics = new Set<string>()
    devotionals.forEach((d) => {
      if (d.topic) uniqueTopics.add(d.topic)
    })
    return Array.from(uniqueTopics).sort()
  }, [devotionals])

  // ─── Filter devotionals ───
  const filteredDevotionals = useMemo(() => {
    return devotionals.filter((d) => {
      const matchesSearch =
        searchTerm === '' ||
        d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.scripture_reference
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (d.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

      const matchesTopic =
        selectedTopic === 'all' || d.topic === selectedTopic

      const matchesFavorite = !showFavoritesOnly || favoriteIds.has(d.id)

      return matchesSearch && matchesTopic && matchesFavorite
    })
  }, [devotionals, searchTerm, selectedTopic, showFavoritesOnly, favoriteIds])

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0]
    return dateStr === today
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6 md:p-10">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader
              className="text-brand-blue animate-spin mx-auto mb-4"
              size={40}
            />
            <p className="text-gray-600 font-body">Loading devotionals...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 md:p-10">
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 text-red-700 p-8 rounded-2xl text-center">
          <p className="font-body mb-4">{error}</p>
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

  const favoritesCount = favoriteIds.size

  return (
    <div className="min-h-screen p-6 md:p-10">
      {/* Back */}
      <Link
        to="/journal"
        className="inline-flex items-center gap-2 text-brand-blue hover:text-blue-900 mb-6 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Journal
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="text-gold-500" size={20} />
          <span className="text-sm font-body text-gold-600 font-semibold uppercase tracking-wider">
            Devotional Library
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-brand-blue mb-3">
          Browse All Devotionals
        </h1>
        <p className="text-gray-600 text-lg font-body max-w-2xl">
          Spiritual nourishment for every day. Find the word God has for you.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setShowFavoritesOnly(false)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-body font-semibold text-sm transition-all ${
            !showFavoritesOnly
              ? 'bg-brand-blue text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-blue'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          All Devotionals ({devotionals.length})
        </button>
        <button
          onClick={() => setShowFavoritesOnly(true)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-body font-semibold text-sm transition-all ${
            showFavoritesOnly
              ? 'bg-brand-gold text-brand-blue shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-gold'
          }`}
        >
          <Star
            className={`w-4 h-4 ${showFavoritesOnly ? 'fill-brand-blue' : ''}`}
          />
          My Favorites ({favoritesCount})
        </button>
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by title, scripture, or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-body text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            />
          </div>

          {topics.length > 0 && (
            <div className="relative md:w-64">
              <Filter
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={18}
              />
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-body text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all">All Topics</option>
                {topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500 font-body mt-3">
          {filteredDevotionals.length === devotionals.length
            ? `${devotionals.length} devotional${devotionals.length === 1 ? '' : 's'} total`
            : `Showing ${filteredDevotionals.length} of ${devotionals.length} devotionals`}
        </p>
      </div>

      {/* Empty state — no devotionals */}
      {devotionals.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-purple-700 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen className="text-white" size={36} />
          </div>
          <h3 className="text-2xl font-heading font-bold text-brand-blue mb-2">
            No Devotionals Yet
          </h3>
          <p className="text-gray-600 font-body max-w-md mx-auto">
            Check back soon — fresh spiritual nourishment is on the way!
          </p>
        </div>
      )}

      {/* Empty state — favorites filter active but no favorites */}
      {devotionals.length > 0 &&
        showFavoritesOnly &&
        filteredDevotionals.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center mb-4">
              <Star className="text-white" size={36} />
            </div>
            <h3 className="text-2xl font-heading font-bold text-brand-blue mb-2">
              No Favorites Yet
            </h3>
            <p className="text-gray-600 font-body mb-4 max-w-md mx-auto">
              Tap the star icon on any devotional to save it here for later.
            </p>
            <button
              onClick={() => setShowFavoritesOnly(false)}
              className="inline-flex items-center gap-2 bg-brand-blue text-white font-body font-semibold px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors"
            >
              Browse All Devotionals
            </button>
          </div>
        )}

      {/* Empty state — search/filter no results */}
      {devotionals.length > 0 &&
        !showFavoritesOnly &&
        filteredDevotionals.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Search className="text-gray-400" size={36} />
            </div>
            <h3 className="text-2xl font-heading font-bold text-brand-blue mb-2">
              No Devotionals Found
            </h3>
            <p className="text-gray-600 font-body mb-4 max-w-md mx-auto">
              Try a different search term or topic.
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedTopic('all')
              }}
              className="inline-flex items-center gap-2 bg-brand-blue text-white font-body font-semibold px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

      {/* Devotionals list */}
      {filteredDevotionals.length > 0 && (
        <div className="space-y-4">
          {filteredDevotionals.map((devotional) => {
            const isFav = favoriteIds.has(devotional.id)
            return (
              <Link
                key={devotional.id}
                to={`/devotional/${devotional.id}`}
                className="block group"
              >
                <div
                  className={`relative bg-white rounded-2xl shadow-sm border transition-all duration-300 p-6 hover:shadow-xl hover:border-gold-300 ${
                    isToday(devotional.publish_date)
                      ? 'border-l-4 border-l-brand-gold border-gray-100'
                      : 'border-gray-100'
                  }`}
                >
                  {/* Favorite Star Button */}
                  <button
                    onClick={(e) => handleToggleFavorite(e, devotional.id)}
                    className={`absolute top-4 right-4 p-2 rounded-full transition-all hover:scale-110 ${
                      isFav
                        ? 'bg-brand-gold text-brand-blue shadow-md'
                        : 'bg-gray-100 text-gray-400 hover:bg-yellow-50 hover:text-brand-gold'
                    }`}
                    aria-label={isFav ? 'Remove favorite' : 'Add to favorites'}
                  >
                    <Star
                      className={`w-5 h-5 ${isFav ? 'fill-brand-blue' : ''}`}
                    />
                  </button>

                  {/* TODAY badge */}
                  {isToday(devotional.publish_date) && (
                    <span className="absolute top-4 right-16 px-3 py-1 bg-brand-gold text-brand-blue text-xs font-bold rounded-full uppercase tracking-wider animate-pulse">
                      Today
                    </span>
                  )}

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-3 mb-3 text-sm pr-12">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(devotional.publish_date)}</span>
                    </div>
                    {devotional.topic && (
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-4 h-4 text-brand-blue" />
                        <span className="px-2 py-0.5 bg-blue-50 text-brand-blue rounded-full font-medium text-xs">
                          {devotional.topic}
                        </span>
                      </div>
                    )}
                    {devotional.view_count > 0 && (
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Eye className="w-4 h-4" />
                        <span className="text-xs">
                          {devotional.view_count} views
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-heading font-bold text-brand-blue mb-2 group-hover:text-blue-900 transition-colors pr-12">
                    {devotional.title}
                  </h2>

                  {/* Scripture ref */}
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-brand-gold" />
                    <span className="text-brand-gold font-semibold text-sm">
                      {devotional.scripture_reference}
                    </span>
                  </div>

                  {/* Scripture preview */}
                  <p className="text-gray-600 font-scripture italic line-clamp-2 mb-4 leading-relaxed">
                    "{devotional.scripture_text}"
                  </p>

                  {/* CTA */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-body">
                      By {devotional.author_name}
                    </span>
                    <div className="inline-flex items-center gap-2 text-brand-blue font-bold text-sm group-hover:text-gold-600 transition-colors">
                      Read Devotional
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Devotionals
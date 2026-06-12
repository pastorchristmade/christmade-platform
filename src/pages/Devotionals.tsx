// src/pages/Devotionals.tsx
// ═══════════════════════════════════════════════════════════
// DEVOTIONAL LIBRARY PAGE
// Browse all published devotionals
// ═══════════════════════════════════════════════════════════

import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
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
  // ─── State ───
  const [devotionals, setDevotionals] = useState<Devotional[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<string>('all')

  // ─── Fetch all published devotionals ───
  useEffect(() => {
    const fetchDevotionals = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]

        const { data, error: fetchError } = await supabase
          .from('devotionals')
          .select(
            'id, title, scripture_reference, scripture_text, topic, publish_date, view_count, author_name'
          )
          .eq('status', 'published')
          .lte('publish_date', today)
          .order('publish_date', { ascending: false })

        if (fetchError) throw fetchError
        setDevotionals(data || [])
      } catch (err: any) {
        console.error('Error fetching devotionals:', err)
        setError(err.message || 'Failed to load devotionals')
      } finally {
        setLoading(false)
      }
    }

    fetchDevotionals()
  }, [])

  // ─── Get unique topics for filter ───
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

      return matchesSearch && matchesTopic
    })
  }, [devotionals, searchTerm, selectedTopic])

  // ─── Check if devotional is today's ───
  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0]
    return dateStr === today
  }

  // ─── Format date ───
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // ═══════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="min-h-screen p-6 md:p-10">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader className="text-brand-blue animate-spin mx-auto mb-4" size={40} />
            <p className="text-gray-600 font-body">Loading devotionals...</p>
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════
  // ERROR STATE
  // ═══════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════
  // MAIN PAGE
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen p-6 md:p-10">
      {/* ─── Back Button ─── */}
      <Link
        to="/journal"
        className="inline-flex items-center gap-2 text-brand-blue hover:text-blue-900 mb-6 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Journal
      </Link>

      {/* ─── Header ─── */}
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

      {/* ─── Search + Filter Bar ─── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
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

          {/* Topic Filter */}
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

        {/* Results count */}
        <p className="text-sm text-gray-500 font-body mt-3">
          {filteredDevotionals.length === devotionals.length
            ? `${devotionals.length} devotional${devotionals.length === 1 ? '' : 's'} total`
            : `Showing ${filteredDevotionals.length} of ${devotionals.length} devotionals`}
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          DEVOTIONALS LIST
          ═══════════════════════════════════════════════════════════ */}

      {/* Empty state — no devotionals at all */}
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

      {/* Empty state — no results from search/filter */}
      {devotionals.length > 0 && filteredDevotionals.length === 0 && (
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

      {/* Devotionals grid */}
      {filteredDevotionals.length > 0 && (
        <div className="space-y-4">
          {filteredDevotionals.map((devotional) => (
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
                {/* TODAY badge */}
                {isToday(devotional.publish_date) && (
                  <span className="absolute top-4 right-4 px-3 py-1 bg-brand-gold text-brand-blue text-xs font-bold rounded-full uppercase tracking-wider animate-pulse">
                    Today
                  </span>
                )}

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-3 mb-3 text-sm">
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
                <h2 className="text-2xl font-heading font-bold text-brand-blue mb-2 group-hover:text-blue-900 transition-colors">
                  {devotional.title}
                </h2>

                {/* Scripture reference */}
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

                {/* Read CTA */}
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
          ))}
        </div>
      )}
    </div>
  )
}

export default Devotionals
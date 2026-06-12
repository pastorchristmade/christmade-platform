// src/pages/MyGrowth.tsx
// ═══════════════════════════════════════════════════════════
// MY SPIRITUAL GROWTH PAGE
// Personal dashboard showing user's faith journey stats
// ═══════════════════════════════════════════════════════════

import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { useStreak } from '../hooks/useStreak'
import { useBadges } from '../hooks/useBadges'
import {
  Sparkles,
  Flame,
  NotebookPen,
  BookOpen,
  Star,
  TrendingUp,
  Calendar,
  Trophy,
  Heart,
  ArrowRight,
  Loader,
} from 'lucide-react'

interface JournalEntry {
  id: string
  mood: string | null
  entry_type: string
  entry_date: string
  created_at: string
  tags: string[]
}

const MOOD_EMOJIS: Record<string, string> = {
  joyful: '😊',
  peaceful: '☮️',
  grateful: '🙏',
  reflective: '💭',
  struggling: '😔',
  hopeful: '🌟',
  worshipful: '🎵',
  broken: '💔',
  inspired: '🔥',
}

const TYPE_EMOJIS: Record<string, string> = {
  reflection: '💭',
  prayer: '🙏',
  praise: '🎤',
  gratitude: '❤️',
  lesson: '📚',
  devotional: '📖',
  fasting: '🤲',
  testimony: '✨',
}

const MyGrowth = () => {
  const { user } = useAuth()
  const {
    currentStreak,
    longestStreak,
    totalEntries,
    milestone,
    nextMilestone,
    loading: streakLoading,
  } = useStreak()
  const { earnedCount, totalCount: totalBadges, completionPercent } = useBadges()

  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // ─── Fetch data ───
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Journal entries
        const { data: entriesData } = await supabase
          .from('journal_entries')
          .select('id, mood, entry_type, entry_date, created_at, tags')
          .eq('user_id', user.id)
          .order('entry_date', { ascending: false })

        if (entriesData) setEntries(entriesData)

        // Favorites count
        const { count: favCount } = await supabase
          .from('favorites')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('item_type', 'devotional')

        if (favCount !== null) setFavoritesCount(favCount)
      } catch (err) {
        console.error('Error fetching growth data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  // ─── Days walking with God ───
  const daysSinceJoined = useMemo(() => {
    if (!user?.created_at) return 0
    const joined = new Date(user.created_at)
    const now = new Date()
    const diff = Math.floor((now.getTime() - joined.getTime()) / (1000 * 60 * 60 * 24))
    return diff + 1
  }, [user])

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown'

  // ─── Mood stats ───
  const moodStats = useMemo(() => {
    const counts: Record<string, number> = {}
    entries.forEach((e) => {
      if (e.mood) {
        counts[e.mood] = (counts[e.mood] || 0) + 1
      }
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
  }, [entries])

  // ─── Entry type stats ───
  const typeStats = useMemo(() => {
    const counts: Record<string, number> = {}
    entries.forEach((e) => {
      counts[e.entry_type] = (counts[e.entry_type] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }, [entries])

  // ─── Top tags ───
  const topTags = useMemo(() => {
    const counts: Record<string, number> = {}
    entries.forEach((e) => {
      if (e.tags && Array.isArray(e.tags)) {
        e.tags.forEach((tag) => {
          counts[tag] = (counts[tag] || 0) + 1
        })
      }
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }, [entries])

  // ─── Most active day of week ───
  const mostActiveDay = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const counts: number[] = [0, 0, 0, 0, 0, 0, 0]
    entries.forEach((e) => {
      const day = new Date(e.entry_date).getDay()
      counts[day]++
    })
    const maxIndex = counts.indexOf(Math.max(...counts))
    return counts[maxIndex] > 0 ? days[maxIndex] : 'N/A'
  }, [entries])

  // ─── Activity calendar (last 49 days = 7 weeks) ───
  const activityCalendar = useMemo(() => {
    const daysMap: Record<string, boolean> = {}
    entries.forEach((e) => {
      daysMap[e.entry_date] = true
    })

    const result: { date: string; active: boolean; label: string }[] = []
    const today = new Date()
    for (let i = 48; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      result.push({
        date: dateStr,
        active: daysMap[dateStr] || false,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      })
    }
    return result
  }, [entries])

  // ─── Loading ───
  if (loading || streakLoading) {
    return (
      <div className="min-h-screen p-6 md:p-10 flex items-center justify-center">
        <div className="text-center">
          <Loader className="text-brand-blue animate-spin mx-auto mb-4" size={40} />
          <p className="text-gray-600 font-body">Loading your growth journey...</p>
        </div>
      </div>
    )
  }

  const maxMoodCount = Math.max(...moodStats.map(([, c]) => c), 1)
  const maxTypeCount = Math.max(...typeStats.map(([, c]) => c), 1)
  const maxTagCount = Math.max(...topTags.map(([, c]) => c), 1)

  return (
    <div className="min-h-screen p-6 md:p-10">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="text-gold-500" size={20} />
          <span className="text-sm font-body text-gold-600 font-semibold uppercase tracking-wider">
            My Spiritual Journey
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-brand-blue mb-3">
          Your Walk With God
        </h1>
        <p className="text-gray-600 text-lg font-body max-w-2xl">
          Every step matters. Here is your faith journey in numbers — celebrating God's faithfulness through your dedication.
        </p>
      </div>

      {/* Walking with God Banner */}
      <div className="mb-6 bg-gradient-to-br from-brand-blue via-primary-700 to-primary-900 rounded-2xl p-5 md:p-6 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gold-500/20 rounded-xl flex items-center justify-center">
              <Heart className="text-gold-500" size={24} />
            </div>
            <div>
              <p className="text-gold-500 text-xs font-body uppercase tracking-wider font-semibold mb-1">
                Walking with God since
              </p>
              <p className="text-white text-xl md:text-2xl font-heading font-bold">
                {joinedDate}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl md:text-5xl font-heading font-bold text-gold-500 leading-none">
              {daysSinceJoined}
            </p>
            <p className="text-primary-200 text-xs font-body uppercase tracking-wider mt-1">
              Days in faith
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MAIN STATS GRID
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Streak */}
        <div className={`bg-gradient-to-br ${milestone.color} rounded-2xl p-4 text-white shadow-md`}>
          <div className="flex items-center justify-between mb-2">
            <Flame className="text-white/90" size={18} />
            <span className="text-2xl">{milestone.emoji}</span>
          </div>
          <p className="text-3xl font-heading font-bold leading-none">{currentStreak}</p>
          <p className="text-white/90 text-xs font-body mt-1">Current Streak</p>
        </div>

        {/* Journal Entries */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl p-4 text-white shadow-md">
          <div className="flex items-center justify-between mb-2">
            <NotebookPen className="text-white/90" size={18} />
          </div>
          <p className="text-3xl font-heading font-bold leading-none">{totalEntries}</p>
          <p className="text-white/90 text-xs font-body mt-1">Journal Entries</p>
        </div>

        {/* Favorites */}
        <div className="bg-gradient-to-br from-yellow-400 to-amber-600 rounded-2xl p-4 text-white shadow-md">
          <div className="flex items-center justify-between mb-2">
            <Star className="text-white/90" size={18} />
          </div>
          <p className="text-3xl font-heading font-bold leading-none">{favoritesCount}</p>
          <p className="text-white/90 text-xs font-body mt-1">Favorites</p>
        </div>

        {/* Badges */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-700 rounded-2xl p-4 text-white shadow-md">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="text-white/90" size={18} />
          </div>
          <p className="text-3xl font-heading font-bold leading-none">
            {earnedCount}
            <span className="text-lg text-white/70">/{totalBadges}</span>
          </p>
          <p className="text-white/90 text-xs font-body mt-1">Badges Earned</p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          ACTIVITY CALENDAR — Last 49 days
          ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="text-brand-blue" size={18} />
            <h3 className="text-lg font-heading font-bold text-brand-blue">
              Activity Last 7 Weeks
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-body text-gray-500">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded bg-gray-100" />
              <div className="w-3 h-3 rounded bg-brand-blue/30" />
              <div className="w-3 h-3 rounded bg-brand-blue/60" />
              <div className="w-3 h-3 rounded bg-brand-blue" />
            </div>
            <span>More</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {activityCalendar.map((day) => (
            <div
              key={day.date}
              title={`${day.label} — ${day.active ? 'Journaled ✓' : 'No entry'}`}
              className={`aspect-square rounded transition-all hover:scale-110 cursor-pointer ${
                day.active
                  ? 'bg-brand-blue hover:bg-brand-gold'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500 font-body mt-3 text-center">
          Each square = one day. Blue = you journaled. Hover for details.
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          INSIGHTS GRID — Mood + Type + Tags
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Moods */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-heading font-bold text-brand-blue mb-4 flex items-center gap-2">
            💭 How You've Felt
          </h3>
          {moodStats.length === 0 ? (
            <p className="text-gray-500 font-body text-sm text-center py-4">
              Start journaling to see your mood patterns
            </p>
          ) : (
            <div className="space-y-2">
              {moodStats.map(([mood, count]) => (
                <div key={mood}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-body capitalize text-gray-700">
                      {MOOD_EMOJIS[mood] || '📝'} {mood}
                    </span>
                    <span className="text-xs font-bold text-brand-blue">{count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-brand-blue to-blue-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(count / maxMoodCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Entry Types */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-heading font-bold text-brand-blue mb-4 flex items-center gap-2">
            📝 Your Entry Types
          </h3>
          {typeStats.length === 0 ? (
            <p className="text-gray-500 font-body text-sm text-center py-4">
              Your entry types will show here
            </p>
          ) : (
            <div className="space-y-2">
              {typeStats.map(([type, count]) => (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-body capitalize text-gray-700">
                      {TYPE_EMOJIS[type] || '📝'} {type}
                    </span>
                    <span className="text-xs font-bold text-brand-blue">{count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-gold-500 to-yellow-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(count / maxTypeCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Tags */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-heading font-bold text-brand-blue mb-4 flex items-center gap-2">
            🏷️ Your Top Topics
          </h3>
          {topTags.length === 0 ? (
            <p className="text-gray-500 font-body text-sm text-center py-4">
              Add tags to entries to see topics here
            </p>
          ) : (
            <div className="space-y-2">
              {topTags.map(([tag, count]) => (
                <div key={tag}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-body text-gray-700">
                      #{tag}
                    </span>
                    <span className="text-xs font-bold text-brand-blue">{count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(count / maxTagCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          GROWTH HIGHLIGHTS
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Longest Streak */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <Trophy className="text-gold-500 mb-2" size={20} />
          <p className="text-xs font-body text-gray-500 uppercase tracking-wider mb-1">
            Longest Streak
          </p>
          <p className="text-3xl font-heading font-bold text-brand-blue">
            {longestStreak}
            <span className="text-lg text-gray-400 font-body ml-1">days</span>
          </p>
        </div>

        {/* Most Active Day */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <Calendar className="text-brand-blue mb-2" size={20} />
          <p className="text-xs font-body text-gray-500 uppercase tracking-wider mb-1">
            Most Active Day
          </p>
          <p className="text-3xl font-heading font-bold text-brand-blue">
            {mostActiveDay}
          </p>
        </div>

        {/* Badge Completion */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <Sparkles className="text-purple-500 mb-2" size={20} />
          <p className="text-xs font-body text-gray-500 uppercase tracking-wider mb-1">
            Badge Collection
          </p>
          <p className="text-3xl font-heading font-bold text-brand-blue">
            {completionPercent}%
          </p>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-blue to-brand-gold h-full rounded-full"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Next Milestone */}
      {nextMilestone && (
        <div className="bg-gradient-to-br from-gold-50 to-yellow-50 rounded-2xl p-5 border border-gold-200 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs font-body text-gold-700 uppercase tracking-wider font-bold mb-1">
                🎯 Next Goal
              </p>
              <p className="text-lg font-heading font-bold text-brand-blue">
                {nextMilestone.daysLeft} more day{nextMilestone.daysLeft === 1 ? '' : 's'} to reach{' '}
                {nextMilestone.target}-day streak!
              </p>
              <p className="text-sm font-body text-gray-600 mt-1">
                Keep journaling daily to unlock the next milestone badge.
              </p>
            </div>
            <Link
              to="/journal/new"
              className="flex items-center gap-2 bg-brand-blue text-white font-body font-bold px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-all shadow-md"
            >
              Journal Now
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* Scripture Footer */}
      <div className="p-6 bg-gradient-to-br from-brand-blue to-primary-900 rounded-2xl text-center">
        <BookOpen className="text-gold-500 mx-auto mb-3" size={24} />
        <p className="text-gold-500 font-scripture text-lg italic mb-2">
          "But the path of the just is as the shining light, that shineth more and more unto the perfect day."
        </p>
        <p className="text-white font-body text-sm opacity-80">
          — Proverbs 4:18 (KJV)
        </p>
      </div>

    </div>
  )
}

export default MyGrowth
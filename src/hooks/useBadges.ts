// src/hooks/useBadges.ts
// ═══════════════════════════════════════════════════════════
// BADGES HOOK
// Fetches user's earned badges + auto-checks for new ones
// ═══════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from './useAuth'

// ─── Badge catalog (matches SQL badge_codes) ───
export interface BadgeDefinition {
  code: string
  name: string
  description: string
  emoji: string
  category: 'streak' | 'journal' | 'devotional'
  color: string // Tailwind gradient
  requirement: string
}

export const BADGE_CATALOG: BadgeDefinition[] = [
  // Streak badges
  {
    code: 'streak_first_step',
    name: 'First Step',
    description: 'Started your spiritual streak',
    emoji: '🌱',
    category: 'streak',
    color: 'from-green-400 to-emerald-600',
    requirement: '1 day streak',
  },
  {
    code: 'streak_faithful_week',
    name: 'Faithful Week',
    description: 'Journaled for 7 consecutive days',
    emoji: '🌟',
    category: 'streak',
    color: 'from-yellow-400 to-orange-500',
    requirement: '7 day streak',
  },
  {
    code: 'streak_consistent',
    name: 'Consistent',
    description: 'Two full weeks of faithfulness',
    emoji: '⚡',
    category: 'streak',
    color: 'from-blue-500 to-indigo-600',
    requirement: '14 day streak',
  },
  {
    code: 'streak_on_fire',
    name: 'On Fire',
    description: '30 days of unbroken devotion',
    emoji: '🔥',
    category: 'streak',
    color: 'from-orange-500 to-red-600',
    requirement: '30 day streak',
  },
  {
    code: 'streak_centurion',
    name: 'Centurion',
    description: '100 days of spiritual discipline',
    emoji: '🏆',
    category: 'streak',
    color: 'from-purple-500 to-pink-600',
    requirement: '100 day streak',
  },
  {
    code: 'streak_year_of_faith',
    name: 'Year of Faith',
    description: 'A full year of walking with God',
    emoji: '👑',
    category: 'streak',
    color: 'from-yellow-400 to-amber-600',
    requirement: '365 day streak',
  },
  // Journal badges
  {
    code: 'journal_first_words',
    name: 'First Words',
    description: 'Wrote your first journal entry',
    emoji: '✍️',
    category: 'journal',
    color: 'from-teal-400 to-cyan-600',
    requirement: '1 journal entry',
  },
  {
    code: 'journal_storyteller',
    name: 'Storyteller',
    description: 'Documented 10 spiritual moments',
    emoji: '📖',
    category: 'journal',
    color: 'from-indigo-400 to-purple-600',
    requirement: '10 journal entries',
  },
  {
    code: 'journal_chronicler',
    name: 'Chronicler',
    description: 'Recorded 50 chapters of your journey',
    emoji: '📚',
    category: 'journal',
    color: 'from-pink-500 to-rose-600',
    requirement: '50 journal entries',
  },
  {
    code: 'journal_scribe',
    name: 'Scribe',
    description: 'A century of personal scriptures',
    emoji: '📜',
    category: 'journal',
    color: 'from-amber-500 to-yellow-600',
    requirement: '100 journal entries',
  },
  // Devotional badges
  {
    code: 'devotional_eager_reader',
    name: 'Eager Reader',
    description: 'Engaged with your first devotional',
    emoji: '👀',
    category: 'devotional',
    color: 'from-sky-400 to-blue-600',
    requirement: 'Favorite 1 devotional',
  },
  {
    code: 'devotional_devotee',
    name: 'Devotional Devotee',
    description: 'Built your collection of favorites',
    emoji: '⭐',
    category: 'devotional',
    color: 'from-violet-500 to-purple-700',
    requirement: 'Favorite 5 devotionals',
  },
]

export interface EarnedBadge {
  badge_code: string
  earned_at: string
}

export const useBadges = () => {
  const { user } = useAuth()
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([])
  const [newBadges, setNewBadges] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // ─── Fetch earned badges ───
  const fetchBadges = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select('badge_code, earned_at')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false })

      if (error) throw error
      setEarnedBadges(data || [])
    } catch (err) {
      console.error('Error fetching badges:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  // ─── Check for new badges (call this after user actions) ───
  const checkForNewBadges = useCallback(async () => {
    if (!user) return []

    try {
      const { data, error } = await supabase.rpc('check_and_award_badges', {
        user_uuid: user.id,
      })

      if (error) {
        console.error('Error checking badges:', error)
        return []
      }

      if (data && data.length > 0 && data[0].new_badges?.length > 0) {
        const newlyEarned = data[0].new_badges
        setNewBadges(newlyEarned)
        await fetchBadges() // Refresh badge list
        return newlyEarned
      }

      return []
    } catch (err) {
      console.error('Error checking badges:', err)
      return []
    }
  }, [user, fetchBadges])

  // ─── Clear new badges notification ───
  const clearNewBadges = () => setNewBadges([])

  useEffect(() => {
    fetchBadges()
    // Auto-check for badges when hook loads
    if (user) {
      checkForNewBadges()
    }
  }, [user, fetchBadges, checkForNewBadges])

  // ─── Helpers ───
  const earnedCodes = new Set(earnedBadges.map((b) => b.badge_code))

  const getBadgeStatus = (code: string) => earnedCodes.has(code)

  const getBadgeDefinition = (code: string) =>
    BADGE_CATALOG.find((b) => b.code === code)

  const earnedCount = earnedBadges.length
  const totalCount = BADGE_CATALOG.length
  const completionPercent = Math.round((earnedCount / totalCount) * 100)

  return {
    earnedBadges,
    newBadges,
    loading,
    checkForNewBadges,
    clearNewBadges,
    getBadgeStatus,
    getBadgeDefinition,
    earnedCount,
    totalCount,
    completionPercent,
    BADGE_CATALOG,
  }
}
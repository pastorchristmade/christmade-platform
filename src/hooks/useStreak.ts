// src/hooks/useStreak.ts
// ═══════════════════════════════════════════════════════════
// JOURNAL STREAK HOOK
// Returns current streak, longest streak, and journal stats
// ═══════════════════════════════════════════════════════════

import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from './useAuth'

interface StreakData {
  currentStreak: number
  longestStreak: number
  totalEntries: number
  lastEntryDate: string | null
  journaledToday: boolean
  loading: boolean
}

export const useStreak = () => {
  const { user } = useAuth()
  const [data, setData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    totalEntries: 0,
    lastEntryDate: null,
    journaledToday: false,
    loading: true,
  })

  useEffect(() => {
    const fetchStreak = async () => {
      if (!user) {
        setData((prev) => ({ ...prev, loading: false }))
        return
      }

      try {
        const { data: result, error } = await supabase.rpc(
          'get_journal_streak',
          { user_uuid: user.id }
        )

        if (error) {
          console.error('Error fetching streak:', error)
          setData((prev) => ({ ...prev, loading: false }))
          return
        }

        if (result && result.length > 0) {
          const row = result[0]
          setData({
            currentStreak: row.current_streak || 0,
            longestStreak: row.longest_streak || 0,
            totalEntries: row.total_entries || 0,
            lastEntryDate: row.last_entry_date || null,
            journaledToday: row.journaled_today || false,
            loading: false,
          })
        } else {
          setData((prev) => ({ ...prev, loading: false }))
        }
      } catch (err) {
        console.error('Error fetching streak:', err)
        setData((prev) => ({ ...prev, loading: false }))
      }
    }

    fetchStreak()
  }, [user])

  // ─── Helper: Get milestone info ───
  const getMilestone = (streak: number) => {
    if (streak >= 365) return { emoji: '👑', label: 'Year of Faith', color: 'from-yellow-400 to-amber-600' }
    if (streak >= 100) return { emoji: '🏆', label: 'Centurion', color: 'from-purple-500 to-pink-600' }
    if (streak >= 30) return { emoji: '🔥', label: 'On Fire', color: 'from-orange-500 to-red-600' }
    if (streak >= 14) return { emoji: '⚡', label: 'Consistent', color: 'from-blue-500 to-indigo-600' }
    if (streak >= 7) return { emoji: '🌟', label: 'Faithful Week', color: 'from-yellow-400 to-orange-500' }
    if (streak >= 3) return { emoji: '🌱', label: 'Growing', color: 'from-green-400 to-emerald-600' }
    if (streak >= 1) return { emoji: '✨', label: 'Started', color: 'from-blue-400 to-blue-600' }
    return { emoji: '🙏', label: 'Begin Today', color: 'from-gray-400 to-gray-600' }
  }

  // ─── Helper: Days until next milestone ───
  const getNextMilestone = (streak: number) => {
    const milestones = [3, 7, 14, 30, 100, 365]
    const next = milestones.find((m) => m > streak)
    if (!next) return null
    return {
      target: next,
      daysLeft: next - streak,
    }
  }

  return {
    ...data,
    milestone: getMilestone(data.currentStreak),
    nextMilestone: getNextMilestone(data.currentStreak),
  }
}
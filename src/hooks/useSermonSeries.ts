// src/hooks/useSermonSeries.ts
// ═══════════════════════════════════════════════════════════
// SERMON SERIES HOOK
// Manages CRUD for sermon series
// ═══════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from './useAuth'

export interface SermonSeries {
  id: string
  user_id: string
  name: string
  description: string | null
  color: string
  total_parts: number
  created_at: string
  updated_at: string
  sermon_count?: number
}

export const SERIES_COLORS = [
  { value: 'from-blue-500 to-blue-700', label: 'Blue' },
  { value: 'from-purple-500 to-purple-700', label: 'Purple' },
  { value: 'from-green-500 to-green-700', label: 'Green' },
  { value: 'from-red-500 to-red-700', label: 'Red' },
  { value: 'from-yellow-500 to-orange-600', label: 'Gold' },
  { value: 'from-pink-500 to-rose-700', label: 'Pink' },
  { value: 'from-teal-500 to-cyan-700', label: 'Teal' },
  { value: 'from-indigo-500 to-purple-700', label: 'Indigo' },
]

export const useSermonSeries = () => {
  const { user } = useAuth()
  const [series, setSeries] = useState<SermonSeries[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSeries = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      // Fetch series
      const { data: seriesData, error: seriesError } = await supabase
        .from('sermon_series')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (seriesError) throw seriesError

      // Count sermons per series
      const { data: sermonCounts } = await supabase
        .from('sermons')
        .select('series_id')
        .eq('user_id', user.id)
        .not('series_id', 'is', null)

      const countMap: Record<string, number> = {}
      sermonCounts?.forEach((s) => {
        if (s.series_id) {
          countMap[s.series_id] = (countMap[s.series_id] || 0) + 1
        }
      })

      const seriesWithCounts = (seriesData || []).map((s) => ({
        ...s,
        sermon_count: countMap[s.id] || 0,
      }))

      setSeries(seriesWithCounts)
    } catch (err: any) {
      console.error('Error fetching series:', err)
      setError(err.message || 'Failed to load series')
    } finally {
      setLoading(false)
    }
  }, [user])

  const createSeries = async (
    name: string,
    description: string,
    color: string,
    totalParts: number
  ) => {
    if (!user) throw new Error('Not logged in')

    const { data, error } = await supabase
      .from('sermon_series')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description.trim() || null,
        color,
        total_parts: totalParts,
      })
      .select()
      .single()

    if (error) throw error
    await fetchSeries()
    return data
  }

  const updateSeries = async (
    id: string,
    updates: Partial<Pick<SermonSeries, 'name' | 'description' | 'color' | 'total_parts'>>
  ) => {
    const { error } = await supabase
      .from('sermon_series')
      .update(updates)
      .eq('id', id)

    if (error) throw error
    await fetchSeries()
  }

  const deleteSeries = async (id: string) => {
    const { error } = await supabase
      .from('sermon_series')
      .delete()
      .eq('id', id)

    if (error) throw error
    await fetchSeries()
  }

  useEffect(() => {
    fetchSeries()
  }, [fetchSeries])

  return {
    series,
    loading,
    error,
    fetchSeries,
    createSeries,
    updateSeries,
    deleteSeries,
  }
}
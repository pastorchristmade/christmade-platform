import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from './useAuth'

interface UserProfile {
  plan: 'free' | 'pro' | 'church'
  organization_name: string | null
  organization_logo_url: string | null
  custom_footer: string | null
  is_admin: boolean
}

export function useUserPlan() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Wait for auth to finish loading first
    if (authLoading) return

    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    fetchProfile()
  }, [user, authLoading])

  const fetchProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('plan, organization_name, organization_logo_url, custom_footer, is_admin')
        .eq('user_id', user.id)
        .single()

      if (error) {
        // If no profile exists, create one with free plan
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: insertError } = await supabase
            .from('user_profiles')
            .insert([{ user_id: user.id, plan: 'free', is_admin: false }])
            .select('plan, organization_name, organization_logo_url, custom_footer, is_admin')
            .single()

          if (insertError) throw insertError
          setProfile(newProfile)
        } else {
          throw error
        }
      } else {
        setProfile(data)
      }
    } catch (err) {
      console.error('Error fetching user profile:', err)
      setProfile({ 
        plan: 'free', 
        organization_name: null, 
        organization_logo_url: null,
        custom_footer: null,
        is_admin: false
      })
    } finally {
      setLoading(false)
    }
  }

  // Combined loading state - true if either auth or plan is loading
  const isLoading = authLoading || loading

  return {
    plan: profile?.plan || 'free',
    organizationName: profile?.organization_name || null,
    organizationLogo: profile?.organization_logo_url || null,
    customFooter: profile?.custom_footer || null,
    isAdmin: profile?.is_admin || false,
    isFree: profile?.plan === 'free',
    isPro: profile?.plan === 'pro',
    isChurch: profile?.plan === 'church',
    isPaid: profile?.plan === 'pro' || profile?.plan === 'church',
    loading: isLoading,
    refetch: fetchProfile,
  }
}
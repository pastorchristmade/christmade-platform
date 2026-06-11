import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from './useAuth'

interface UserProfile {
  plan: 'free' | 'pro' | 'church'
  organization_name: string | null
  organization_logo_url: string | null
  custom_footer: string | null
}

export function useUserPlan() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('plan, organization_name, organization_logo_url, custom_footer')
        .eq('user_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: insertError } = await supabase
            .from('user_profiles')
            .insert([{ user_id: user.id, plan: 'free' }])
            .select('plan, organization_name, organization_logo_url, custom_footer')
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
        custom_footer: null 
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    plan: profile?.plan || 'free',
    organizationName: profile?.organization_name || null,
    organizationLogo: profile?.organization_logo_url || null,
    customFooter: profile?.custom_footer || null,
    isFree: profile?.plan === 'free',
    isPro: profile?.plan === 'pro',
    isChurch: profile?.plan === 'church',
    isPaid: profile?.plan === 'pro' || profile?.plan === 'church',
    loading,
    refetch: fetchProfile,
  }
}
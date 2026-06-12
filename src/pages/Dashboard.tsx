import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  PenTool,
  NotebookPen,
  ArrowRight,
  Sparkles,
  Tag,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabase'

const apps = [
  {
    name: 'Bible App',
    description:
      'Read, study, and meditate on the King James Version of the Holy Bible.',
    href: '/bible',
    icon: BookOpen,
    color: 'from-blue-500 to-blue-700',
    status: 'Coming Soon',
  },
  {
    name: 'Sermon Architect',
    description:
      'Build powerful, scripture-rooted sermons with intelligent tools.',
    href: '/sermon',
    icon: PenTool,
    color: 'from-purple-500 to-purple-700',
    status: 'Available',
  },
  {
    name: 'Devotional Journal',
    description:
      'Daily devotionals, prayer journaling, and spiritual growth tracking.',
    href: '/journal',
    icon: NotebookPen,
    color: 'from-green-500 to-green-700',
    status: 'Available',
  },
]

// ─── Type for today's devotional ───
interface TodayDevotional {
  id: string
  title: string
  scripture_reference: string
  scripture_text: string
  topic: string | null
  publish_date: string
}

function Dashboard() {
  const { user } = useAuth()
  const userName = user?.user_metadata?.full_name || 'Beloved'
  const firstName = userName.split(' ')[0]

  // ─── Today's devotional state ───
  const [todayDevotional, setTodayDevotional] = useState<TodayDevotional | null>(
    null
  )
  const [loadingDevotional, setLoadingDevotional] = useState(true)

  // ─── Fetch today's devotional ───
  useEffect(() => {
    const fetchTodayDevotional = async () => {
      try {
        // Get today's date in YYYY-MM-DD format (local time)
        const today = new Date()
        const yyyy = today.getFullYear()
        const mm = String(today.getMonth() + 1).padStart(2, '0')
        const dd = String(today.getDate()).padStart(2, '0')
        const todayStr = `${yyyy}-${mm}-${dd}`

        // Try today first — fallback to latest published if not found
        const { data: todayData } = await supabase
          .from('devotionals')
          .select(
            'id, title, scripture_reference, scripture_text, topic, publish_date'
          )
          .eq('status', 'published')
          .eq('publish_date', todayStr)
          .maybeSingle()

        if (todayData) {
          setTodayDevotional(todayData)
        } else {
          // Fallback: latest published devotional (most recent publish_date)
          const { data: latestData } = await supabase
            .from('devotionals')
            .select(
              'id, title, scripture_reference, scripture_text, topic, publish_date'
            )
            .eq('status', 'published')
            .lte('publish_date', todayStr)
            .order('publish_date', { ascending: false })
            .limit(1)
            .maybeSingle()

          if (latestData) setTodayDevotional(latestData)
        }
      } catch (err) {
        console.error('Error fetching today devotional:', err)
      } finally {
        setLoadingDevotional(false)
      }
    }

    fetchTodayDevotional()
  }, [])

  // ─── Check if devotional is for today (for "NEW" badge) ───
  const isToday = (() => {
    if (!todayDevotional) return false
    const today = new Date().toISOString().split('T')[0]
    return todayDevotional.publish_date === today
  })()

  // Greeting based on time of day
  const hour = new Date().getHours()
  let greeting = 'Welcome'
  if (hour < 12) greeting = 'Good morning'
  else if (hour < 17) greeting = 'Good afternoon'
  else greeting = 'Good evening'

  // Calculate stats
  const availableApps = apps.filter((a) => a.status === 'Available').length
  const comingSoonApps = apps.filter((a) => a.status === 'Coming Soon').length

  return (
    <div className="min-h-screen p-10">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="text-gold-500" size={20} />
          <span className="text-sm font-body text-gold-600 font-semibold uppercase tracking-wider">
            {greeting}
          </span>
        </div>
        <h1 className="text-5xl font-heading font-bold text-brand-blue mb-3">
          {greeting}, {firstName}!
        </h1>
        <p className="text-gray-600 text-lg font-body max-w-2xl">
          Welcome back to Christmade Platform — your complete ecosystem for
          spiritual growth, biblical study, and Kingdom-focused ministry tools.
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          TODAY'S DEVOTIONAL BANNER
          Only shows when a published devotional exists
          ═══════════════════════════════════════════════════════════ */}
      {!loadingDevotional && todayDevotional && (
        <Link
          to={`/devotional/${todayDevotional.id}`}
          className="block mb-8 group"
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-brand-blue via-blue-900 to-primary-900 rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-l-4 border-brand-gold">
            {/* Decorative sparkles */}
            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
              <Sparkles className="w-24 h-24 text-brand-gold" />
            </div>

            {/* Top label + NEW badge */}
            <div className="flex items-center gap-3 mb-3 relative z-10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-gold animate-pulse" />
                <span className="text-brand-gold font-bold uppercase tracking-wider text-xs sm:text-sm">
                  Today's Devotional
                </span>
              </div>
              {isToday && (
                <span className="px-3 py-1 bg-brand-gold text-brand-blue text-xs font-bold rounded-full uppercase tracking-wider animate-pulse">
                  New
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-3 relative z-10">
              {todayDevotional.title}
            </h2>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 mb-4 relative z-10">
              <div className="flex items-center gap-2 text-blue-100 text-sm">
                <BookOpen className="w-4 h-4 text-brand-gold" />
                <span className="font-medium">
                  {todayDevotional.scripture_reference}
                </span>
              </div>
              {todayDevotional.topic && (
                <div className="flex items-center gap-2 text-blue-100 text-sm">
                  <Tag className="w-4 h-4 text-brand-gold" />
                  <span className="px-2 py-0.5 bg-white/10 rounded-full">
                    {todayDevotional.topic}
                  </span>
                </div>
              )}
            </div>

            {/* Scripture preview */}
            <p className="text-blue-50 font-scripture italic text-base sm:text-lg leading-relaxed mb-6 relative z-10 line-clamp-2">
              "{todayDevotional.scripture_text}"
            </p>

            {/* CTA */}
            <div className="flex items-center justify-between relative z-10">
              <span className="text-blue-200 text-sm hidden sm:block">
                Take a moment to be refreshed today
              </span>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-gold text-brand-blue rounded-xl font-bold text-sm group-hover:bg-yellow-300 transition-colors shadow-lg">
                Read Today's Devotional
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-body mb-1">Available Apps</p>
          <p className="text-3xl font-heading font-bold text-brand-blue">
            {availableApps}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-body mb-1">Coming Soon</p>
          <p className="text-3xl font-heading font-bold text-brand-blue">
            {comingSoonApps}
          </p>
        </div>
        <div className="bg-brand-blue p-6 rounded-2xl shadow-sm text-white">
          <p className="text-primary-200 text-sm font-body mb-1">Your Plan</p>
          <p className="text-3xl font-heading font-bold text-gold-500">Free</p>
        </div>
      </div>

      {/* Apps Section */}
      <div>
        <h2 className="text-2xl font-heading font-bold text-brand-blue mb-6">
          Christmade Apps
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => {
            const Icon = app.icon
            return (
              <Link
                key={app.name}
                to={app.href}
                className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-gold-300 transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="text-white" size={28} />
                </div>

                <span
                  className={`inline-block text-xs font-body font-semibold px-3 py-1 rounded-full mb-3 ${
                    app.status === 'Available'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gold-100 text-gold-700'
                  }`}
                >
                  {app.status}
                </span>

                <h3 className="text-xl font-heading font-bold text-brand-blue mb-2">
                  {app.name}
                </h3>

                <p className="text-gray-600 text-sm font-body mb-4">
                  {app.description}
                </p>

                <div className="flex items-center text-brand-blue font-body font-semibold text-sm group-hover:text-gold-600 transition-colors">
                  Open App
                  <ArrowRight
                    size={16}
                    className="ml-2 group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Scripture Footer */}
      <div className="mt-12 p-8 bg-gradient-to-br from-brand-blue to-primary-900 rounded-2xl text-center">
        <p className="text-gold-500 font-scripture text-xl italic mb-2">
          "And let us consider one another to provoke unto love and to good
          works"
        </p>
        <p className="text-white font-body text-sm opacity-80">
          — Hebrews 10:24 (KJV)
        </p>
      </div>
    </div>
  )
}

export default Dashboard
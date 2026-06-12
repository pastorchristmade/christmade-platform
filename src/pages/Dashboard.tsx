import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  PenTool,
  NotebookPen,
  ArrowRight,
  Sparkles,
  Tag,
  Flame,
  Trophy,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useStreak } from '../hooks/useStreak'
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
  const {
    currentStreak,
    longestStreak,
    totalEntries,
    journaledToday,
    milestone,
    nextMilestone,
    loading: streakLoading,
  } = useStreak()

  const userName = user?.user_metadata?.full_name || 'Beloved'
  const firstName = userName.split(' ')[0]

  const [todayDevotional, setTodayDevotional] = useState<TodayDevotional | null>(
    null
  )
  const [loadingDevotional, setLoadingDevotional] = useState(true)

  useEffect(() => {
    const fetchTodayDevotional = async () => {
      try {
        const today = new Date()
        const yyyy = today.getFullYear()
        const mm = String(today.getMonth() + 1).padStart(2, '0')
        const dd = String(today.getDate()).padStart(2, '0')
        const todayStr = `${yyyy}-${mm}-${dd}`

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

  const isToday = (() => {
    if (!todayDevotional) return false
    const today = new Date().toISOString().split('T')[0]
    return todayDevotional.publish_date === today
  })()

  const hour = new Date().getHours()
  let greeting = 'Welcome'
  if (hour < 12) greeting = 'Good morning'
  else if (hour < 17) greeting = 'Good afternoon'
  else greeting = 'Good evening'

  const availableApps = apps.filter((a) => a.status === 'Available').length
  const comingSoonApps = apps.filter((a) => a.status === 'Coming Soon').length

  return (
    <div className="min-h-screen p-10">
      {/* Welcome Header */}
      <div className="mb-6">
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
          COMPACT CARDS ROW — Devotional + Streak side by side
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* TODAY'S DEVOTIONAL — Compact (takes 2 columns) */}
        {!loadingDevotional && todayDevotional && (
          <Link
            to={`/devotional/${todayDevotional.id}`}
            className="block group lg:col-span-2"
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-blue via-blue-900 to-primary-900 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-brand-gold h-full">
              <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="w-20 h-20 text-brand-gold" />
              </div>

              <div className="flex items-center gap-2 mb-2 relative z-10">
                <Sparkles className="w-4 h-4 text-brand-gold animate-pulse" />
                <span className="text-brand-gold font-bold uppercase tracking-wider text-xs">
                  Today's Devotional
                </span>
                {isToday && (
                  <span className="px-2 py-0.5 bg-brand-gold text-brand-blue text-[10px] font-bold rounded-full uppercase tracking-wider animate-pulse">
                    New
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-heading font-bold text-white mb-2 relative z-10 line-clamp-1">
                {todayDevotional.title}
              </h2>

              <div className="flex flex-wrap items-center gap-3 mb-2 relative z-10">
                <div className="flex items-center gap-1.5 text-blue-100 text-xs">
                  <BookOpen className="w-3.5 h-3.5 text-brand-gold" />
                  <span className="font-medium">
                    {todayDevotional.scripture_reference}
                  </span>
                </div>
                {todayDevotional.topic && (
                  <div className="flex items-center gap-1.5 text-blue-100 text-xs">
                    <Tag className="w-3.5 h-3.5 text-brand-gold" />
                    <span className="px-2 py-0.5 bg-white/10 rounded-full">
                      {todayDevotional.topic}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-blue-50 font-scripture italic text-sm leading-relaxed mb-3 relative z-10 line-clamp-2">
                "{todayDevotional.scripture_text}"
              </p>

              <div className="flex items-center justify-end relative z-10">
                <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-gold text-brand-blue rounded-lg font-bold text-xs group-hover:bg-yellow-300 transition-colors shadow-md">
                  Read Now
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* STREAK CARD — Compact (1 column) */}
        {!streakLoading && (
          <Link to="/journal" className="block group">
            <div
              className={`relative overflow-hidden bg-gradient-to-br ${milestone.color} rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 h-full`}
            >
              <div className="absolute -top-2 -right-2 opacity-15 group-hover:opacity-25 transition-opacity">
                <Flame className="w-24 h-24 text-white" />
              </div>

              <div className="relative z-10 h-full flex flex-col justify-between">
                {/* Top: Label + emoji */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-white" />
                    <span className="text-white/90 font-bold uppercase tracking-wider text-xs">
                      Streak
                    </span>
                  </div>
                  <span className="text-3xl">{milestone.emoji}</span>
                </div>

                {/* Middle: Number */}
                <div className="mb-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-heading font-bold text-white">
                      {currentStreak}
                    </span>
                    <span className="text-white/90 font-body text-sm">
                      day{currentStreak === 1 ? '' : 's'}
                    </span>
                  </div>
                  <p className="text-white/80 text-xs font-body mt-0.5">
                    {currentStreak === 0
                      ? 'Begin today 🙏'
                      : journaledToday
                      ? "You're on fire today 🔥"
                      : 'Journal today to keep it!'}
                  </p>
                </div>

                {/* Bottom: Mini stats + progress */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1 text-white/90 text-xs">
                      <Trophy className="w-3 h-3" />
                      <span className="font-bold">{longestStreak}</span>
                      <span className="text-white/70">best</span>
                    </div>
                    <div className="text-white/40">•</div>
                    <div className="text-white/90 text-xs">
                      <span className="font-bold">{totalEntries}</span>
                      <span className="text-white/70 ml-1">entries</span>
                    </div>
                  </div>

                  {nextMilestone && (
                    <div>
                      <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-white h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              (currentStreak / nextMilestone.target) * 100
                            }%`,
                          }}
                        />
                      </div>
                      <p className="text-white/80 text-[10px] font-body mt-1">
                        {nextMilestone.daysLeft} more to{' '}
                        {nextMilestone.target} 🎯
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        )}
      </div>

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
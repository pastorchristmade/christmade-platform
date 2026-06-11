import { Link } from 'react-router-dom'
import { BookOpen, PenTool, NotebookPen, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const apps = [
  {
    name: 'Bible App',
    description: 'Read, study, and meditate on the King James Version of the Holy Bible.',
    href: '/bible',
    icon: BookOpen,
    color: 'from-blue-500 to-blue-700',
    status: 'Available',
  },
  {
    name: 'Sermon Architect',
    description: 'Build powerful, scripture-rooted sermons with intelligent tools.',
    href: '/sermon',
    icon: PenTool,
    color: 'from-purple-500 to-purple-700',
    status: 'Coming Soon',
  },
  {
    name: 'Devotional Journal',
    description: 'Daily devotionals, prayer journaling, and spiritual growth tracking.',
    href: '/journal',
    icon: NotebookPen,
    color: 'from-green-500 to-green-700',
    status: 'Coming Soon',
  },
]

function Dashboard() {
  const { user } = useAuth()
  const userName = user?.user_metadata?.full_name || 'Beloved'
  const firstName = userName.split(' ')[0]
  
  // Greeting based on time of day
  const hour = new Date().getHours()
  let greeting = 'Welcome'
  if (hour < 12) greeting = 'Good morning'
  else if (hour < 17) greeting = 'Good afternoon'
  else greeting = 'Good evening'

  return (
    <div className="min-h-screen p-10">
      
      {/* Welcome Header */}
      <div className="mb-10">
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
          Welcome back to Christmade Platform — your complete ecosystem for spiritual growth, 
          biblical study, and Kingdom-focused ministry tools.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-body mb-1">Available Apps</p>
          <p className="text-3xl font-heading font-bold text-brand-blue">1</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-body mb-1">Coming Soon</p>
          <p className="text-3xl font-heading font-bold text-brand-blue">2</p>
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
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="text-white" size={28} />
                </div>

                <span className={`inline-block text-xs font-body font-semibold px-3 py-1 rounded-full mb-3 ${
                  app.status === 'Available'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gold-100 text-gold-700'
                }`}>
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
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Scripture Footer */}
      <div className="mt-12 p-8 bg-gradient-to-br from-brand-blue to-primary-900 rounded-2xl text-center">
        <p className="text-gold-500 font-scripture text-xl italic mb-2">
          "And let us consider one another to provoke unto love and to good works"
        </p>
        <p className="text-white font-body text-sm opacity-80">
          — Hebrews 10:24 (KJV)
        </p>
      </div>

    </div>
  )
}

export default Dashboard
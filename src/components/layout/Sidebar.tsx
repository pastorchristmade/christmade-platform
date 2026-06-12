import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  PenTool,
  NotebookPen,
  Sparkles,
  TrendingUp,
  LogOut,
  User,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useUserPlan } from '../../hooks/useUserPlan'
import { supabase } from '../../services/supabase'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Bible App', href: '/bible', icon: BookOpen },
  { name: 'Sermon Architect', href: '/sermon', icon: PenTool },
  { name: 'Devotional Journal', href: '/journal', icon: NotebookPen },
  { name: 'Daily Devotional', href: '/devotionals', icon: Sparkles },
  { name: 'My Growth', href: '/my-growth', icon: TrendingUp },
]

function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isAdmin } = useUserPlan()

  const userName = user?.user_metadata?.full_name || 'Beloved'
  const userEmail = user?.email || ''
  const userInitial = userName.charAt(0).toUpperCase()
  const avatarUrl = user?.user_metadata?.avatar_url || null

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-brand-blue text-white flex flex-col">
      
      {/* Logo Section */}
      <div className="p-6 border-b border-primary-700">
        <Link to="/">
          <h1 className="text-2xl font-heading font-bold text-gold-500">
            Christmade
          </h1>
          <p className="text-xs text-primary-200 mt-1 font-body">
            Tools That Build the Kingdom
          </p>
        </Link>
      </div>

      {/* USER PROFILE — AT TOP */}
      <div className="p-4 border-b border-primary-700">
        
        {/* User Info Card */}
        <div className="flex items-center gap-3 px-3 py-3 mb-3 bg-primary-700 rounded-lg">
          
          {/* Avatar */}
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={userName}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-gold-500"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center flex-shrink-0">
              <span className="text-brand-blue font-bold text-lg font-heading">
                {userInitial}
              </span>
            </div>
          )}
          
          {/* Name + Email */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-sm font-body font-semibold text-white truncate">
                {userName}
              </p>
              {isAdmin && (
                <ShieldCheck className="text-gold-500 flex-shrink-0" size={14} />
              )}
            </div>
            <p className="text-xs font-body text-primary-200 truncate">
              {userEmail}
            </p>
          </div>
        </div>

        {/* Profile Button */}
        <Link
          to="/profile"
          className={`
            flex items-center gap-3 px-4 py-2.5 w-full rounded-lg transition-colors font-body text-sm mb-1
            ${location.pathname === '/profile' 
              ? 'bg-gold-500 text-brand-blue font-semibold' 
              : 'text-primary-100 hover:bg-primary-700'
            }
          `}
        >
          <User size={18} />
          My Profile
        </Link>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 w-full text-primary-100 hover:bg-red-600 hover:text-white rounded-lg transition-colors font-body text-sm"
        >
          <LogOut size={18} />
          Sign Out
        </button>

      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 mt-2">
        <p className="text-xs font-body text-primary-300 uppercase tracking-wider px-4 mb-2">
          Apps
        </p>
        {navigation.map((item) => {
          const isActive =
            location.pathname === item.href ||
            (item.href === '/devotionals' && location.pathname.startsWith('/devotional')) ||
            (item.href !== '/dashboard' && item.href !== '/devotionals' && item.href !== '/my-growth' && location.pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg font-body transition-all duration-200
                ${isActive 
                  ? 'bg-gold-500 text-brand-blue font-semibold shadow-lg' 
                  : 'text-primary-100 hover:bg-primary-700'
                }
              `}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          )
        })}

        {/* Admin Section - Only visible to admins */}
        {isAdmin && (
          <>
            <div className="pt-4 mt-4 border-t border-primary-700">
              <p className="text-xs font-body text-gold-500 uppercase tracking-wider px-4 mb-2 flex items-center gap-2">
                <ShieldCheck size={12} />
                Admin
              </p>
              <Link
                to="/admin/devotionals"
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg font-body transition-all duration-200
                  ${location.pathname.startsWith('/admin/devotionals')
                    ? 'bg-gold-500 text-brand-blue font-semibold shadow-lg' 
                    : 'text-primary-100 hover:bg-primary-700'
                  }
                `}
              >
                <ShieldCheck size={20} />
                Manage Devotionals
              </Link>
            </div>
          </>
        )}
      </nav>

      {/* Footer Scripture */}
      <div className="p-4 border-t border-primary-700">
        <p className="text-xs font-scripture italic text-primary-200 text-center">
          "Tools That Build the Kingdom"
        </p>
      </div>

    </aside>
  )
}

export default Sidebar
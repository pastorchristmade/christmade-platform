import { useAuth } from '../hooks/useAuth'
import { User, Mail, Calendar, Sparkles } from 'lucide-react'

function Profile() {
  const { user } = useAuth()

  const userName = user?.user_metadata?.full_name || 'Beloved'
  const userEmail = user?.email || ''
  const userInitial = userName.charAt(0).toUpperCase()
  const joinedDate = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'Unknown'

  return (
    <div className="min-h-screen p-10">
      
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="text-gold-500" size={20} />
          <span className="text-sm font-body text-gold-600 font-semibold uppercase tracking-wider">
            My Profile
          </span>
        </div>
        <h1 className="text-5xl font-heading font-bold text-brand-blue mb-3">
          {userName}
        </h1>
        <p className="text-gray-600 text-lg font-body">
          Manage your Christmade account
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl">
        
        {/* Big Avatar */}
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-blue to-primary-900 flex items-center justify-center">
            <span className="text-gold-500 font-bold text-4xl font-heading">
              {userInitial}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-heading font-bold text-brand-blue">
              {userName}
            </h2>
            <p className="text-gray-600 font-body">{userEmail}</p>
            <span className="inline-block mt-2 bg-gold-100 text-gold-700 text-xs font-body font-semibold px-3 py-1 rounded-full">
              Free Plan
            </span>
          </div>
        </div>

        {/* Account Details */}
        <div className="space-y-4">
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <User className="text-brand-blue" size={20} />
            </div>
            <div>
              <p className="text-xs font-body text-gray-500 uppercase tracking-wider mb-1">Full Name</p>
              <p className="text-gray-900 font-body font-semibold">{userName}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Mail className="text-brand-blue" size={20} />
            </div>
            <div>
              <p className="text-xs font-body text-gray-500 uppercase tracking-wider mb-1">Email Address</p>
              <p className="text-gray-900 font-body font-semibold">{userEmail}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Calendar className="text-brand-blue" size={20} />
            </div>
            <div>
              <p className="text-xs font-body text-gray-500 uppercase tracking-wider mb-1">Member Since</p>
              <p className="text-gray-900 font-body font-semibold">{joinedDate}</p>
            </div>
          </div>

        </div>

      </div>

      {/* Scripture */}
      <div className="mt-8 p-6 bg-gradient-to-br from-brand-blue to-primary-900 rounded-2xl max-w-2xl">
        <p className="text-gold-500 font-scripture text-lg italic">
          "But ye are a chosen generation, a royal priesthood, an holy nation, a peculiar people..."
        </p>
        <p className="text-white font-body text-sm opacity-80 mt-2">
          — 1 Peter 2:9 (KJV)
        </p>
      </div>

    </div>
  )
}

export default Profile
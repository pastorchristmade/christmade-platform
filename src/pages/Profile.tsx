import { useState, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabase'
import { User, Mail, Calendar, Sparkles, Camera, Loader, Trash2, Pencil, Check, X } from 'lucide-react'
import BadgesSection from '../components/BadgesSection'

function Profile() {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const [savingName, setSavingName] = useState(false)

  const userName = user?.user_metadata?.full_name || 'Beloved'
  const userEmail = user?.email || ''
  const userInitial = userName.charAt(0).toUpperCase()
  const avatarUrl = user?.user_metadata?.avatar_url || null

  const joinedDate = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    : 'Unknown'

  const handleEditName = () => {
    setNewName(userName)
    setEditingName(true)
    setError('')
    setSuccess('')
  }

  const handleCancelEdit = () => {
    setEditingName(false)
    setNewName('')
  }

  const handleSaveName = async () => {
    if (!newName.trim()) {
      setError('Name cannot be empty')
      return
    }
    if (newName.trim() === userName) {
      setEditingName(false)
      return
    }

    setSavingName(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: newName.trim() }
      })
      if (error) throw error
      setSuccess('Name updated!')
      setEditingName(false)
      setTimeout(() => window.location.reload(), 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to update name')
    } finally {
      setSavingName(false)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setError('')
    setSuccess('')

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, etc.)')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB')
      return
    }

    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      if (avatarUrl) {
        const oldPath = avatarUrl.split('/avatars/')[1]
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath])
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { cacheControl: '3600', upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      })

      if (updateError) throw updateError
      setSuccess('Profile picture updated!')
      setTimeout(() => window.location.reload(), 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to upload picture')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!user || !avatarUrl) return
    if (!window.confirm('Remove your profile picture?')) return

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const oldPath = avatarUrl.split('/avatars/')[1]
      if (oldPath) {
        await supabase.storage.from('avatars').remove([oldPath])
      }
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: null }
      })
      if (updateError) throw updateError
      setSuccess('Profile picture removed!')
      setTimeout(() => window.location.reload(), 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to remove picture')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      
      {/* Compact Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="text-gold-500" size={16} />
          <span className="text-xs font-body text-gold-600 font-semibold uppercase tracking-wider">
            My Profile
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-brand-blue">
          {userName}
        </h1>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-sm font-body">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-lg text-sm font-body">
          {success}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          2-COLUMN LAYOUT — Profile + Badges side-by-side
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        
        {/* LEFT: Compact Profile Card (takes 2/5 width on desktop) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            
            {/* Avatar + Name (centered) */}
            <div className="text-center mb-4 pb-4 border-b border-gray-100">
              <div className="relative inline-block mb-3">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={userName}
                    className="w-20 h-20 rounded-full object-cover border-4 border-gold-500"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-blue to-primary-900 flex items-center justify-center border-4 border-gold-500">
                    <span className="text-gold-500 font-bold text-3xl font-heading">
                      {userInitial}
                    </span>
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Loader className="text-white animate-spin" size={20} />
                  </div>
                )}
              </div>

              <h2 className="text-lg font-heading font-bold text-brand-blue mb-1">
                {userName}
              </h2>
              <p className="text-xs text-gray-500 font-body mb-2 truncate">{userEmail}</p>
              <span className="inline-block bg-gold-100 text-gold-700 text-[10px] font-body font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Free Plan
              </span>

              {/* Avatar buttons */}
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                <button
                  onClick={handleUploadClick}
                  disabled={uploading}
                  className="flex items-center gap-1.5 bg-brand-blue text-white font-body font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  <Camera size={12} />
                  {avatarUrl ? 'Change' : 'Upload'}
                </button>

                {avatarUrl && (
                  <button
                    onClick={handleRemoveAvatar}
                    disabled={uploading}
                    className="flex items-center gap-1.5 bg-red-50 text-red-600 font-body font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Account Details — Compact */}
            <div className="space-y-3">
              
              {/* Name with edit */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <User className="text-brand-blue" size={14} />
                  <p className="text-[10px] font-body text-gray-500 uppercase tracking-wider font-semibold">Full Name</p>
                </div>
                
                {editingName ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      autoFocus
                      className="flex-1 px-2 py-1.5 border border-brand-blue rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-blue font-body text-sm"
                      placeholder="Enter your name"
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={savingName}
                      className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      {savingName ? <Loader className="animate-spin" size={14} /> : <Check size={14} />}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={savingName}
                      className="p-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-gray-900 font-body font-semibold text-sm truncate">{userName}</p>
                    <button
                      onClick={handleEditName}
                      className="flex items-center gap-1 text-brand-blue hover:text-gold-600 text-xs font-body font-semibold transition-colors ml-2"
                    >
                      <Pencil size={11} />
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="text-brand-blue" size={14} />
                  <p className="text-[10px] font-body text-gray-500 uppercase tracking-wider font-semibold">Email</p>
                </div>
                <p className="text-gray-900 font-body font-semibold text-sm truncate">{userEmail}</p>
              </div>

              {/* Member Since */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="text-brand-blue" size={14} />
                  <p className="text-[10px] font-body text-gray-500 uppercase tracking-wider font-semibold">Member Since</p>
                </div>
                <p className="text-gray-900 font-body font-semibold text-sm">{joinedDate}</p>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT: Badges Section (takes 3/5 width on desktop) */}
        <div className="lg:col-span-3">
          <BadgesSection />
        </div>

      </div>

      {/* Scripture Footer — Compact */}
      <div className="p-5 bg-gradient-to-br from-brand-blue to-primary-900 rounded-2xl">
        <p className="text-gold-500 font-scripture text-base md:text-lg italic text-center">
          "But ye are a chosen generation, a royal priesthood, an holy nation, a peculiar people..."
        </p>
        <p className="text-white font-body text-xs opacity-80 mt-1 text-center">
          — 1 Peter 2:9 (KJV)
        </p>
      </div>

    </div>
  )
}

export default Profile
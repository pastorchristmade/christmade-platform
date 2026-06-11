import { useState, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabase'
import { User, Mail, Calendar, Sparkles, Camera, Loader, Trash2, Pencil, Check, X } from 'lucide-react'

function Profile() {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Name editing states
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
        month: 'long', 
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

      setSuccess('Name updated successfully!')
      setEditingName(false)
      
      setTimeout(() => {
        window.location.reload()
      }, 1500)

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
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      })

      if (updateError) throw updateError

      setSuccess('Profile picture updated!')
      
      setTimeout(() => {
        window.location.reload()
      }, 1500)

    } catch (err: any) {
      setError(err.message || 'Failed to upload picture')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!user || !avatarUrl) return
    
    const confirmed = window.confirm('Remove your profile picture?')
    if (!confirmed) return

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
      
      setTimeout(() => {
        window.location.reload()
      }, 1500)

    } catch (err: any) {
      setError(err.message || 'Failed to remove picture')
    } finally {
      setUploading(false)
    }
  }

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

      {/* Status Messages */}
      {error && (
        <div className="mb-6 max-w-2xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-body">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 max-w-2xl bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-body">
          {success}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl">
        
        {/* Avatar Section */}
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
          
          <div className="relative">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={userName}
                className="w-24 h-24 rounded-full object-cover border-4 border-gold-500"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-blue to-primary-900 flex items-center justify-center border-4 border-gold-500">
                <span className="text-gold-500 font-bold text-4xl font-heading">
                  {userInitial}
                </span>
              </div>
            )}

            {uploading && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <Loader className="text-white animate-spin" size={24} />
              </div>
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-heading font-bold text-brand-blue">
              {userName}
            </h2>
            <p className="text-gray-600 font-body">{userEmail}</p>
            <span className="inline-block mt-2 bg-gold-100 text-gold-700 text-xs font-body font-semibold px-3 py-1 rounded-full">
              Free Plan
            </span>

            <div className="flex flex-wrap gap-2 mt-4">
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
                className="flex items-center gap-2 bg-brand-blue text-white font-body font-semibold text-sm px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <Camera size={16} />
                {avatarUrl ? 'Change Picture' : 'Upload Picture'}
              </button>

              {avatarUrl && (
                <button
                  onClick={handleRemoveAvatar}
                  disabled={uploading}
                  className="flex items-center gap-2 bg-red-50 text-red-600 font-body font-semibold text-sm px-4 py-2 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              )}
            </div>

            <p className="text-xs text-gray-500 font-body mt-2">
              JPG, PNG up to 2MB
            </p>
          </div>
        </div>

        {/* Account Details */}
        <div className="space-y-4">
          
          {/* Full Name with Edit */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <User className="text-brand-blue" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-body text-gray-500 uppercase tracking-wider mb-1">Full Name</p>
              
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    autoFocus
                    className="flex-1 px-3 py-2 border border-brand-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue font-body"
                    placeholder="Enter your name"
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={savingName}
                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                    aria-label="Save"
                  >
                    {savingName ? <Loader className="animate-spin" size={18} /> : <Check size={18} />}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={savingName}
                    className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    aria-label="Cancel"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-gray-900 font-body font-semibold">{userName}</p>
                  <button
                    onClick={handleEditName}
                    className="flex items-center gap-1 text-brand-blue hover:text-gold-600 text-sm font-body font-semibold transition-colors"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Mail className="text-brand-blue" size={20} />
            </div>
            <div>
              <p className="text-xs font-body text-gray-500 uppercase tracking-wider mb-1">Email Address</p>
              <p className="text-gray-900 font-body font-semibold">{userEmail}</p>
            </div>
          </div>

          {/* Member Since */}
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
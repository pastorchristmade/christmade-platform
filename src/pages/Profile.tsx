import { useState, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabase'
import { User, Mail, Calendar, Sparkles, Camera, Loader, Trash2 } from 'lucide-react'

function Profile() {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setError('')
    setSuccess('')

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, etc.)')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB')
      return
    }

    setUploading(true)

    try {
      // Create unique filename: userId/timestamp-filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      // Delete old avatar if exists
      if (avatarUrl) {
        const oldPath = avatarUrl.split('/avatars/')[1]
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath])
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      })

      if (updateError) throw updateError

      setSuccess('Profile picture updated! Refresh to see changes everywhere.')
      
      // Refresh after 1.5 seconds to show new avatar
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
      // Delete from storage
      const oldPath = avatarUrl.split('/avatars/')[1]
      if (oldPath) {
        await supabase.storage.from('avatars').remove([oldPath])
      }

      // Update user metadata
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
          
          {/* Avatar Display */}
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

            {/* Loading Overlay */}
            {uploading && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <Loader className="text-white animate-spin" size={24} />
              </div>
            )}
          </div>

          {/* User Info & Actions */}
          <div className="flex-1">
            <h2 className="text-2xl font-heading font-bold text-brand-blue">
              {userName}
            </h2>
            <p className="text-gray-600 font-body">{userEmail}</p>
            <span className="inline-block mt-2 bg-gold-100 text-gold-700 text-xs font-body font-semibold px-3 py-1 rounded-full">
              Free Plan
            </span>

            {/* Upload Buttons */}
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
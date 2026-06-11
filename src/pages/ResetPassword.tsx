import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { Lock, Sparkles, ArrowRight, Eye, EyeOff } from 'lucide-react'

function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setSuccess('Password updated successfully! Redirecting to login...')
      
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue via-primary-700 to-primary-900 flex items-center justify-center p-6">
      
      <div className="w-full max-w-md">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="text-4xl font-heading font-bold text-gold-500 mb-2">
              Christmade
            </h1>
          </Link>
          <p className="text-primary-100 font-body">
            Create a new password
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="text-gold-500" size={20} />
            <span className="text-sm font-body text-gold-600 font-semibold uppercase tracking-wider">
              New Password
            </span>
          </div>

          <h2 className="text-3xl font-heading font-bold text-brand-blue mb-2">
            Set New Password
          </h2>
          <p className="text-gray-600 font-body mb-6">
            Choose a strong password for your Christmade account.
          </p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm font-body">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm font-body">
              {success}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            
            {/* New Password */}
            <div>
              <label className="block text-sm font-body font-semibold text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent font-body"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-blue transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-body font-semibold text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent font-body"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-blue text-white font-bold py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                'Updating password...'
              ) : (
                <>
                  Update Password
                  <ArrowRight size={20} />
                </>
              )}
            </button>

          </form>

        </div>

        {/* Footer Scripture */}
        <p className="text-center text-primary-200 font-scripture italic mt-6 text-sm">
          "Behold, I make all things new." — Revelation 21:5
        </p>

      </div>
    </div>
  )
}

export default ResetPassword
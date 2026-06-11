import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { Mail, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setSuccess('Password reset email sent! Check your inbox (and spam folder).')
      setEmail('')
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
            Forgot your password?
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="text-gold-500" size={20} />
            <span className="text-sm font-body text-gold-600 font-semibold uppercase tracking-wider">
              Reset Password
            </span>
          </div>

          <h2 className="text-3xl font-heading font-bold text-brand-blue mb-2">
            No worries!
          </h2>
          <p className="text-gray-600 font-body mb-6">
            Enter your email and we'll send you a link to reset your password.
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

          <form onSubmit={handleResetPassword} className="space-y-4">
            
            {/* Email */}
            <div>
              <label className="block text-sm font-body font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
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
                'Sending email...'
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight size={20} />
                </>
              )}
            </button>

          </form>

          {/* Back to Login Link */}
          <Link 
            to="/login" 
            className="flex items-center justify-center gap-2 text-gray-600 font-body text-sm mt-6 hover:text-brand-blue transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>

        </div>

        {/* Footer Scripture */}
        <p className="text-center text-primary-200 font-scripture italic mt-6 text-sm">
          "He healeth the broken in heart, and bindeth up their wounds." — Psalm 147:3
        </p>

      </div>
    </div>
  )
}

export default ForgotPassword
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { Mail, Lock, Sparkles, ArrowRight } from 'lucide-react'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      if (data.user) {
        navigate('/dashboard')
      }
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
            Welcome back, beloved
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="text-gold-500" size={20} />
            <span className="text-sm font-body text-gold-600 font-semibold uppercase tracking-wider">
              Sign In
            </span>
          </div>

          <h2 className="text-3xl font-heading font-bold text-brand-blue mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600 font-body mb-6">
            Continue your Kingdom journey.
          </p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm font-body">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
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

            {/* Password */}
            <div>
              <label className="block text-sm font-body font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
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
                'Signing in...'
              ) : (
                <>
                  Sign In
                  <ArrowRight size={20} />
                </>
              )}
            </button>

          </form>

          {/* Register Link */}
          <p className="text-center text-gray-600 font-body text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-blue font-semibold hover:text-gold-600 transition-colors">
              Create one
            </Link>
          </p>

        </div>

        {/* Footer Scripture */}
        <p className="text-center text-primary-200 font-scripture italic mt-6 text-sm">
          "I am the way, the truth, and the life." — John 14:6
        </p>

      </div>
    </div>
  )
}

export default Login
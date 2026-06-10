import { Link } from 'react-router-dom'
import { BookOpen, PenTool, NotebookPen, ArrowRight, Sparkles, Heart, Shield, Zap } from 'lucide-react'

function Landing() {
  return (
    <div className="min-h-screen bg-white">

      {/* Navigation Bar */}
      <nav className="bg-brand-blue text-white py-4 px-8 flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gold-500">
            Christmade
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className="text-white hover:text-gold-500 font-body transition-colors">
            Features
          </a>
          <a href="#apps" className="text-white hover:text-gold-500 font-body transition-colors">
            Apps
          </a>
          <Link 
            to="/dashboard" 
            className="bg-gold-500 text-brand-blue font-bold px-5 py-2 rounded-lg hover:bg-gold-400 transition-colors"
          >
            Enter Platform
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-blue via-primary-700 to-primary-900 text-white py-24 px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="text-gold-500" size={20} />
            <span className="text-sm font-body text-gold-500 font-semibold uppercase tracking-widest">
              Built for the Body of Christ
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl font-heading font-bold mb-6 leading-tight">
            Tools That Build <br />
            the <span className="text-gold-500">Kingdom</span>
          </h1>

          <p className="text-xl md:text-2xl text-primary-100 font-body max-w-3xl mx-auto mb-10 leading-relaxed">
            Christmade is your complete ecosystem for spiritual growth, biblical study, 
            and Kingdom-focused ministry. One platform. Infinite impact.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/dashboard"
              className="bg-gold-500 text-brand-blue font-bold px-8 py-4 rounded-xl hover:bg-gold-400 transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              Enter Platform
              <ArrowRight size={20} />
            </Link>
            <a 
              href="#features"
              className="border-2 border-gold-500 text-gold-500 font-bold px-8 py-4 rounded-xl hover:bg-gold-500 hover:text-brand-blue transition-all duration-300"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-8 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-body text-gold-600 font-semibold uppercase tracking-widest">
              Why Christmade
            </span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-brand-blue mt-3">
              Made for Believers. Built for Excellence.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-5">
                <Heart className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-heading font-bold text-brand-blue mb-3">
                Christ-Centered
              </h3>
              <p className="text-gray-600 font-body">
                Every feature is designed to draw you closer to Christ and equip you for Kingdom service.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mb-5">
                <Shield className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-heading font-bold text-brand-blue mb-3">
                Trusted & Secure
              </h3>
              <p className="text-gray-600 font-body">
                Your data, prayers, and sermons are protected with industry-grade security.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center mb-5">
                <Zap className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-heading font-bold text-brand-blue mb-3">
                Fast & Beautiful
              </h3>
              <p className="text-gray-600 font-body">
                Lightning-fast performance with a stunning design that honors the work you do.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Apps Section */}
      <section id="apps" className="py-24 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-body text-gold-600 font-semibold uppercase tracking-widest">
              Our Apps
            </span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-brand-blue mt-3">
              A Growing Ecosystem of Kingdom Tools
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* App 1 */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-8 rounded-2xl text-white">
              <BookOpen size={40} className="mb-4" />
              <h3 className="text-2xl font-heading font-bold mb-2">Bible App</h3>
              <p className="font-body opacity-90 mb-4">
                Read, study, and meditate on the King James Version of the Holy Bible.
              </p>
              <span className="inline-block bg-white/20 text-white text-xs font-body font-semibold px-3 py-1 rounded-full">
                Available
              </span>
            </div>

            {/* App 2 */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-8 rounded-2xl text-white">
              <PenTool size={40} className="mb-4" />
              <h3 className="text-2xl font-heading font-bold mb-2">Sermon Architect</h3>
              <p className="font-body opacity-90 mb-4">
                Build powerful, scripture-rooted sermons with intelligent tools.
              </p>
              <span className="inline-block bg-white/20 text-white text-xs font-body font-semibold px-3 py-1 rounded-full">
                Coming Soon
              </span>
            </div>

            {/* App 3 */}
            <div className="bg-gradient-to-br from-green-500 to-green-700 p-8 rounded-2xl text-white">
              <NotebookPen size={40} className="mb-4" />
              <h3 className="text-2xl font-heading font-bold mb-2">Devotional Journal</h3>
              <p className="font-body opacity-90 mb-4">
                Daily devotionals, prayer journaling, and spiritual growth tracking.
              </p>
              <span className="inline-block bg-white/20 text-white text-xs font-body font-semibold px-3 py-1 rounded-full">
                Coming Soon
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8 bg-gradient-to-br from-brand-blue to-primary-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Ready to Build the Kingdom?
          </h2>
          <p className="text-xl text-primary-100 font-body mb-10">
            Join believers and ministry leaders using Christmade to grow, study, and serve.
          </p>
          <Link 
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-gold-500 text-brand-blue font-bold px-8 py-4 rounded-xl hover:bg-gold-400 transition-all duration-300 hover:scale-105"
          >
            Enter Platform
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark text-white py-12 px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-heading font-bold text-gold-500 mb-2">
            Christmade
          </h3>
          <p className="text-gray-400 font-body mb-6">
            Tools That Build the Kingdom
          </p>
          <p className="text-gray-500 text-sm font-body">
            © {new Date().getFullYear()} Christmade. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  )
}

export default Landing
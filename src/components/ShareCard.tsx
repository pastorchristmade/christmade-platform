import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import {
  Download,
  X,
  Loader,
  Check,
  Link as LinkIcon,
  MessageCircle,
  Mail,
  Share2,
  Send,
} from 'lucide-react'

interface ShareCardProps {
  isOpen: boolean
  onClose: () => void
  title: string
  scripture: string
  reference: string
  topic?: string
  type?: 'devotional' | 'journal' | 'streak' | 'badge'
  shareUrl?: string
}

const ShareCard = ({
  isOpen,
  onClose,
  title,
  scripture,
  reference,
  topic,
  type = 'devotional',
  shareUrl,
}: ShareCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const fullShareUrl = shareUrl || window.location.href
  const shareMessage = `"${scripture}" — ${reference}\n\nI just read "${title}" on Christmade. Check it out:\n${fullShareUrl}`
  const shortMessage = `Check out "${title}" on Christmade 🙏`

  const handleDownload = async () => {
    if (!cardRef.current) return
    setDownloading(true)

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true,
      })

      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `christmade-${type}-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        setDownloaded(true)
        setTimeout(() => setDownloaded(false), 2000)
      }, 'image/png')
    } catch (err) {
      console.error('Error generating image:', err)
      alert('Could not generate image. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullShareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('Link: ' + fullShareUrl)
    }
  }

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`
    window.open(url, '_blank')
  }

  const handleTwitter = () => {
    const text = `"${scripture}" — ${reference}\n\nFrom "${title}" on @christmade`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(fullShareUrl)}`
    window.open(url, '_blank')
  }

  const handleFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullShareUrl)}&quote=${encodeURIComponent(shortMessage)}`
    window.open(url, '_blank')
  }

  const handleEmail = () => {
    const subject = `${title} — Christmade Devotional`
    const body = shareMessage
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const handleNativeShare = async () => {
    if (!navigator.share) {
      handleCopyLink()
      return
    }

    try {
      await navigator.share({
        title: `${title} — Christmade`,
        text: `"${scripture}" — ${reference}`,
        url: fullShareUrl,
      })
    } catch {
      // User cancelled
    }
  }

  const getTypeLabel = () => {
    switch (type) {
      case 'devotional': return '✨ Daily Devotional'
      case 'journal': return '📔 Journal Entry'
      case 'streak': return '🔥 Spiritual Streak'
      case 'badge': return '🏆 Achievement'
      default: return '✨ Christmade'
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full my-4 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-heading font-bold text-brand-blue">
            Share This Devotional
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Preview Card */}
        <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200">
          <div
            ref={cardRef}
            className="relative bg-gradient-to-br from-brand-blue via-blue-900 to-primary-900 rounded-2xl p-6 aspect-[4/5] flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="absolute top-3 right-3 opacity-20">
              <div className="text-4xl">✨</div>
            </div>
            <div className="absolute bottom-3 left-3 opacity-10">
              <div className="text-6xl">📖</div>
            </div>

            <div className="relative z-10 text-center mb-4">
              <p className="text-gold-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-0.5">
                Christmade
              </p>
              <p className="text-blue-200 text-[8px] italic">
                Tools That Build the Kingdom
              </p>
            </div>

            <div className="relative z-10 text-center mb-3">
              <span className="inline-block px-2 py-0.5 bg-gold-500/20 border border-gold-500/40 text-gold-400 text-[10px] font-bold rounded-full">
                {getTypeLabel()}
              </span>
            </div>

            <div className="relative z-10 flex-1 flex flex-col justify-center text-center">
              <div className="mb-4">
                <div className="text-3xl text-gold-500 mb-1 leading-none">"</div>
                <p
                  className="text-white text-sm leading-relaxed mb-2 italic"
                  style={{ fontFamily: 'Lora, Georgia, serif' }}
                >
                  {scripture}
                </p>
                <p className="text-gold-500 font-bold text-xs">
                  — {reference}
                </p>
              </div>

              <div className="w-12 h-0.5 bg-gold-500/40 mx-auto mb-4"></div>

              <div>
                <h2
                  className="text-white text-lg font-bold mb-1 leading-tight"
                  style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                >
                  {title}
                </h2>
                {topic && (
                  <p className="text-blue-300 text-[10px] uppercase tracking-wider font-semibold">
                    {topic}
                  </p>
                )}
              </div>
            </div>

            <div className="relative z-10 text-center mt-4 pt-2 border-t border-white/10">
              <p className="text-blue-200 text-[8px] font-semibold">
                christmade-platform.netlify.app
              </p>
            </div>
          </div>
        </div>

        {/* Share Options */}
        <div className="p-4 space-y-3">
          
          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-between gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-4 py-3 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                <LinkIcon className="text-brand-blue" size={16} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-body font-semibold text-brand-blue">
                  {copied ? 'Link Copied!' : 'Copy Link'}
                </p>
                <p className="text-xs text-gray-500 truncate font-body">
                  {fullShareUrl}
                </p>
              </div>
            </div>
            {copied ? (
              <Check className="text-green-500 flex-shrink-0" size={18} />
            ) : (
              <span className="text-xs text-gray-400 font-body">Tap</span>
            )}
          </button>

          {/* Social Share Buttons */}
          <div>
            <p className="text-xs font-body text-gray-500 uppercase tracking-wider font-semibold mb-2">
              Share to
            </p>
            <div className="grid grid-cols-4 gap-2">
              
              {/* WhatsApp */}
              <button
                onClick={handleWhatsApp}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors"
              >
                <MessageCircle className="text-green-600" size={22} />
                <span className="text-[10px] font-body font-semibold text-gray-700">
                  WhatsApp
                </span>
              </button>

              {/* Twitter — using Send icon */}
              <button
                onClick={handleTwitter}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-sky-50 hover:bg-sky-100 transition-colors"
              >
                <Send className="text-sky-600" size={22} />
                <span className="text-[10px] font-body font-semibold text-gray-700">
                  Twitter
                </span>
              </button>

              {/* Facebook — using Share2 icon */}
              <button
                onClick={handleFacebook}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <Share2 className="text-blue-600" size={22} />
                <span className="text-[10px] font-body font-semibold text-gray-700">
                  Facebook
                </span>
              </button>

              {/* Email */}
              <button
                onClick={handleEmail}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                <Mail className="text-purple-600" size={22} />
                <span className="text-[10px] font-body font-semibold text-gray-700">
                  Email
                </span>
              </button>
            </div>
          </div>

          {/* Native Share + Download */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            
            <button
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-2 bg-brand-blue text-white font-body font-bold px-4 py-2.5 rounded-xl hover:bg-primary-700 transition-all text-sm"
            >
              <Share2 size={16} />
              More Options
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center justify-center gap-2 bg-white border-2 border-brand-blue text-brand-blue font-body font-bold px-4 py-2.5 rounded-xl hover:bg-blue-50 transition-all text-sm disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <Loader className="animate-spin" size={16} />
                  Saving...
                </>
              ) : downloaded ? (
                <>
                  <Check size={16} />
                  Saved!
                </>
              ) : (
                <>
                  <Download size={16} />
                  Save Image
                </>
              )}
            </button>
          </div>

          <p className="text-center text-[11px] text-gray-500 font-body pt-1 leading-relaxed">
            🙌 Every share invites someone closer to God's Word.
          </p>
        </div>

      </div>
    </div>
  )
}

export default ShareCard
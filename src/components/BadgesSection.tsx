// src/components/BadgesSection.tsx
// ═══════════════════════════════════════════════════════════
// BADGES SECTION
// Displays user's earned + locked badges with progress
// ═══════════════════════════════════════════════════════════

import { useBadges } from '../hooks/useBadges'
import { Trophy, Lock, Sparkles, Loader } from 'lucide-react'

const BadgesSection = () => {
  const {
    loading,
    earnedCount,
    totalCount,
    completionPercent,
    getBadgeStatus,
    BADGE_CATALOG,
  } = useBadges()

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <Loader className="text-brand-blue animate-spin" size={32} />
        </div>
      </div>
    )
  }

  // Group badges by category
  const streakBadges = BADGE_CATALOG.filter((b) => b.category === 'streak')
  const journalBadges = BADGE_CATALOG.filter((b) => b.category === 'journal')
  const devotionalBadges = BADGE_CATALOG.filter(
    (b) => b.category === 'devotional'
  )

  const renderBadgeCard = (badge: typeof BADGE_CATALOG[0]) => {
    const isEarned = getBadgeStatus(badge.code)

    return (
      <div
        key={badge.code}
        className={`relative rounded-2xl p-4 text-center transition-all duration-300 hover:scale-105 ${
          isEarned
            ? `bg-gradient-to-br ${badge.color} shadow-lg`
            : 'bg-gray-100 grayscale opacity-60'
        }`}
        title={badge.description}
      >
        {/* Lock icon for locked badges */}
        {!isEarned && (
          <div className="absolute top-2 right-2 bg-white/80 rounded-full p-1">
            <Lock className="w-3 h-3 text-gray-500" />
          </div>
        )}

        {/* Sparkle for earned badges */}
        {isEarned && (
          <div className="absolute -top-1 -right-1">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
        )}

        {/* Emoji */}
        <div className="text-4xl mb-2">{badge.emoji}</div>

        {/* Name */}
        <p
          className={`font-bold text-xs uppercase tracking-wider mb-1 ${
            isEarned ? 'text-white' : 'text-gray-600'
          }`}
        >
          {badge.name}
        </p>

        {/* Requirement */}
        <p
          className={`text-[10px] font-body ${
            isEarned ? 'text-white/80' : 'text-gray-500'
          }`}
        >
          {badge.requirement}
        </p>
      </div>
    )
  }

  const renderCategory = (
    title: string,
    icon: string,
    badges: typeof BADGE_CATALOG
  ) => {
    const earnedInCategory = badges.filter((b) => getBadgeStatus(b.code)).length

    return (
      <div className="mb-8 last:mb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <h3 className="text-lg font-heading font-bold text-brand-blue">
              {title}
            </h3>
          </div>
          <span className="text-sm font-body text-gray-500">
            {earnedInCategory} / {badges.length} earned
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {badges.map(renderBadgeCard)}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="text-gold-500" size={20} />
          <span className="text-sm font-body text-gold-600 font-semibold uppercase tracking-wider">
            Achievements
          </span>
        </div>
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-brand-blue">
              Badge Collection
            </h2>
            <p className="text-gray-600 font-body text-sm mt-1">
              Earn badges as you grow in your walk with God
            </p>
          </div>

          {/* Progress stats */}
          <div className="text-right">
            <p className="text-3xl font-heading font-bold text-brand-blue">
              {earnedCount}
              <span className="text-gray-400 text-xl"> / {totalCount}</span>
            </p>
            <p className="text-xs font-body text-gray-500 uppercase tracking-wider">
              Badges Earned
            </p>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-body text-gray-500">
              Collection Progress
            </span>
            <span className="text-xs font-bold text-brand-blue">
              {completionPercent}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-blue to-brand-gold h-full rounded-full transition-all duration-700"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badge categories */}
      {renderCategory('Streak Badges', '🔥', streakBadges)}
      {renderCategory('Journal Badges', '📔', journalBadges)}
      {renderCategory('Devotional Badges', '📖', devotionalBadges)}

      {/* Encouragement footer */}
      {earnedCount < totalCount && (
        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-600 font-body text-sm">
            {earnedCount === 0
              ? '✨ Start journaling and reading devotionals to earn your first badge!'
              : `🎯 ${totalCount - earnedCount} more badge${
                  totalCount - earnedCount === 1 ? '' : 's'
                } to collect. Keep going!`}
          </p>
        </div>
      )}

      {earnedCount === totalCount && (
        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-2xl mb-1">👑</p>
          <p className="text-brand-blue font-heading font-bold">
            All badges collected!
          </p>
          <p className="text-gray-600 font-body text-sm mt-1">
            You are a true Kingdom warrior. Glory to God! 🙌
          </p>
        </div>
      )}
    </div>
  )
}

export default BadgesSection
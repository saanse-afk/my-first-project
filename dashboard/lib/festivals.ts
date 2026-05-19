import type { Festival } from '@/types'

/**
 * Get upcoming festivals within the next N days.
 */
export function getUpcomingFestivals(festivals: Festival[], daysAhead = 21): Festival[] {
  const now = new Date()
  const future = new Date(now)
  future.setDate(future.getDate() + daysAhead)

  return festivals
    .filter((f) => {
      const festDate = new Date(f.date)
      return festDate >= now && festDate <= future
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

/**
 * Get festivals where we should start posting NOW (i.e., festival date is within
 * days_before_to_post from today)
 */
export function getActionableFestivals(festivals: Festival[]): Festival[] {
  const now = new Date()
  return festivals.filter((f) => {
    const festDate = new Date(f.date)
    const daysUntil = Math.ceil(
      (festDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysUntil >= 0 && daysUntil <= f.days_before_to_post
  })
}

export function getDaysUntilFestival(festival: Festival): number {
  const now = new Date()
  const festDate = new Date(festival.date)
  return Math.ceil((festDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function getFestivalStatus(festival: Festival): 'urgent' | 'upcoming' | 'future' | 'past' {
  const days = getDaysUntilFestival(festival)
  if (days < 0) return 'past'
  if (days <= 7) return 'urgent'
  if (days <= festival.days_before_to_post) return 'upcoming'
  return 'future'
}

export const DEITY_COLORS: Record<string, string> = {
  Krishna: '#F59E0B',
  'Krishna/Vishnu': '#F59E0B',
  Vishnu: '#F59E0B',
  Shiva: '#6366F1',
  Durga: '#DC2626',
  Saraswati: '#F59E0B',
  Rama: '#10B981',
  Hanuman: '#F97316',
  Ganesha: '#EC4899',
  Surya: '#EAB308',
  Vyasa: '#8B5CF6',
  General: '#6B7280',
}

export function getDeityColor(deity: string | null): string {
  if (!deity) return DEITY_COLORS.General
  return DEITY_COLORS[deity] || DEITY_COLORS.General
}

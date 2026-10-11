// Mirrors the `Stats` struct in wrapped/src/lib.rs.
// Rust's Option<T> arrives as `T | null`.

export interface PersonCount {
  name: string
  count: number
}

export interface Stats {
  totalMessages: number
  firstDate: string | null // "2024-03-12"
  lastDate: string | null
  leaderboard: PersonCount[]
  busiestHour: { hour: number; count: number } | null
  media: PersonCount[]
  topEmojis: { emoji: string; count: number }[]
  mostActiveDay: { date: string; count: number } | null
  longestStreak: { days: number; start: string | null; end: string | null }
  nightOwl: PersonCount | null
  fastestReplier: { name: string; typicalMinutes: number /* median */; replies: number } | null
}

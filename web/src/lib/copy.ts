// The cheeky one-liners for each slide.
import type { Stats } from './types'

export function topSenderQuip(stats: Stats) {
  const [top, second] = stats.leaderboard
  if (!second) return 'A whole chat, all by yourself. Iconic.'
  const share = top.count / stats.totalMessages
  if (share > 0.5) return `More than everyone else combined. Does ${top.name} sleep?`
  if (share > 0.3) return `${Math.round(share * 100)}% of the entire chat. Does ${top.name} sleep?`
  return `Does ${top.name} even sleep?`
}

export function hourQuip(hour: number) {
  if (hour < 5) return 'Nothing good happens at this hour. And yet.'
  if (hour < 9) return 'Early birds. Honestly suspicious.'
  if (hour < 17) return "Shouldn't you all be working?"
  if (hour < 21) return 'The after-work gist hits different.'
  return 'Bedtime? Never heard of her.'
}

const EMOJI_QUIPS: Record<string, string> = {
  '😂': "Everyone's a comedian, apparently.",
  '🤣': "Everyone's a comedian, apparently.",
  '💀': 'Dead. Every single day.',
  '😭': 'Crying, but make it daily.',
  '❤': 'Soft chat. We love to see it.',
  '🔥': 'Everything is fire, allegedly.',
  '🙏': 'A very blessed group chat.',
  '👀': 'Nosy. Respectfully.',
}

export const emojiQuip = (emoji: string) => EMOJI_QUIPS[emoji] ?? "Your chat's official mood."

export function streakQuip(days: number) {
  if (days < 7) return 'Short but sweet. Like a situationship.'
  if (days < 30) return 'Not one day off. Touch grass?'
  return "That's not a streak, that's a lifestyle."
}

export function replyQuip(minutes: number) {
  if (minutes < 2) return 'Phone permanently glued to hand.'
  if (minutes < 10) return 'Always online. Never "busy".'
  return 'Fastest of a slow bunch, to be fair.'
}

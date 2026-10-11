// Generates a fake Android export so people can try the app without their own
// chat. It goes through the real Rust parser, just like an uploaded file.

const PEOPLE = ['Samuel', 'Tobi', 'Amaka', 'Dayo']
// Samuel talks the most
const SENDER_WEIGHTS = [4, 2, 2, 2]

const LINES = [
  "Who's coming tonight?",
  "I'm outside",
  'Abeg send the location',
  'No way',
  'This group is too quiet',
  'Lmaooo',
  'Who finished the jollof?',
  'On my way',
  'Wait what happened',
  'Tobi you are always late',
  'We move',
  'Sleep is for the weak',
  'Can we focus please',
  "I'm not even joking",
  'Send pics',
  'Ok but hear me out',
  'Traffic is crazy',
  'Say less',
  'Who is bringing the speaker?',
  'Abeg',
]
const EMOJIS = ['😂', '😂', '😂', '😂', '🔥', '🔥', '🙌', '💀', '😭', '👀']

// Tiny seeded random number generator, so the demo is the same every time
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function makeDemoChat(): string {
  const random = seeded(42)
  const pick = <T,>(items: T[]) => items[Math.floor(random() * items.length)]
  const weighted = () => {
    let roll = random() * SENDER_WEIGHTS.reduce((a, b) => a + b)
    for (let i = 0; i < PEOPLE.length; i++) {
      roll -= SENDER_WEIGHTS[i]
      if (roll < 0) return PEOPLE[i]
    }
    return PEOPLE[0]
  }
  const pad = (n: number) => String(n).padStart(2, '0')

  const out = [
    '01/11/2024, 09:00 - Messages and calls are end-to-end encrypted. Only people in this chat can read, listen to, or share them. Learn more.',
    '01/11/2024, 09:00 - Samuel created group "Weekend Plans"',
  ]

  const write = (date: Date, minutes: number, sender: string) => {
    const roll = random()
    let text = pick(LINES)
    if (roll < (sender === 'Dayo' ? 0.25 : 0.04)) text = '<Media omitted>'
    else if (roll < 0.45) text += ` ${pick(EMOJIS)}`
    else if (roll < 0.5) text += `${pick(EMOJIS)}${pick(EMOJIS)}`
    else if (roll < 0.52) text += '\nAlso who has my charger'
    const stamp = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
    out.push(`${stamp}, ${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)} - ${sender}: ${text}`)
  }

  // A run of back-and-forth messages starting at `start` minutes past midnight
  const burst = (date: Date, start: number, length: number, end: number, cast?: string[]) => {
    let minutes = start
    let previous = ''
    for (let i = 0; i < length; i++) {
      let sender = cast ? pick(cast) : weighted()
      if (sender === previous && random() < 0.6) sender = cast ? pick(cast) : weighted()
      // Amaka replies almost instantly; everyone else takes a few minutes
      if (i > 0) minutes += sender === 'Amaka' ? Math.floor(random() * 2) : 2 + Math.floor(random() * 8)
      if (minutes >= end) break
      write(date, minutes, sender)
      previous = sender
    }
    return minutes
  }

  const first = new Date(2024, 10, 1)
  for (let day = 0; day < 80; day++) {
    // Every day for the first 6 weeks, then the streak breaks
    if (day > 42 && random() < 0.35) continue
    const date = new Date(first)
    date.setDate(first.getDate() + day)

    // Night owl: Tobi, mostly, between midnight and 4am
    if (random() < 0.4) burst(date, Math.floor(random() * 150), 3 + Math.floor(random() * 5), 240, ['Tobi', 'Tobi', 'Samuel'])

    const busyDay = day === 31 // one day where everything kicked off
    let minutes = 9 * 60 + Math.floor(random() * 120)
    while (minutes < 23 * 60) {
      const evening = minutes >= 20 * 60 && minutes < 22 * 60 // the chat comes alive after dinner
      const length = (2 + Math.floor(random() * 6)) * (evening ? 4 : 1) * (busyDay ? 4 : 1)
      minutes = burst(date, minutes, length, 24 * 60) + 45 + Math.floor(random() * 180)
    }
  }
  return out.join('\n')
}

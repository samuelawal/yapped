import { strFromU8, unzipSync } from 'fflate'
import init, { analyzeChat } from 'wrapped'
import type { Stats } from './types'

let ready: Promise<unknown> | null = null

/** Downloads and starts the WASM module once. Safe to call repeatedly. */
export function loadAnalyzer() {
  ready ??= init()
  return ready
}

export async function analyzeText(text: string): Promise<Stats> {
  await loadAnalyzer()
  return JSON.parse(analyzeChat(text)) as Stats
}

/** Reads a .txt export, or the chat inside an iPhone .zip export. */
export async function readChatFile(file: File): Promise<string> {
  const isZip = file.name.toLowerCase().endsWith('.zip') || file.type.includes('zip')
  if (!isZip) return file.text()

  const files = unzipSync(new Uint8Array(await file.arrayBuffer()), {
    filter: (entry) => entry.name.toLowerCase().endsWith('.txt'),
  })
  const names = Object.keys(files)
  const chatName = names.find((name) => name.endsWith('_chat.txt')) ?? names[0]
  if (!chatName) throw new Error("That zip doesn't have a chat .txt file in it.")
  return strFromU8(files[chatName])
}

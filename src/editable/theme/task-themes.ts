import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

export type TaskTheme = {
  kicker: string
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const DISPLAY_FONT = "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif"
const BODY_FONT = "'Inter', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"

const base = {
  dark: false,
  fontDisplay: DISPLAY_FONT,
  fontBody: BODY_FONT,
  bg: '#ffffff',
  surface: '#ffffff',
  raised: '#fafaf9',
  text: '#1a1a1a',
  muted: '#6b7280',
  line: '#e7e5e4',
  accent: '#e05a2b',
  accentSoft: '#fff7ed',
  onAccent: '#ffffff',
  glow: 'rgba(224,90,43,0.06)',
  radius: '1rem',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'DIY Guides', note: 'Step-by-step how-to articles and home improvement guides.' },
  listing: { ...base, kicker: 'Businesses', note: 'Find local contractors, suppliers, and home improvement pros.' },
  classified: { ...base, kicker: 'Marketplace', note: 'Tools, materials, and services ready for your next project.' },
  image: { ...base, kicker: 'Project Photos', note: 'A visual gallery of completed DIY builds and home transformations.' },
  sbm: { ...base, kicker: 'Resources', note: 'Curated links, tutorials, and references for the DIY community.' },
  pdf: { ...base, kicker: 'Guides & Plans', note: 'Downloadable project plans, blueprints, and how-to documents.' },
  profile: { ...base, kicker: 'Contributors', note: 'Discover DIY creators, tradespeople, and home improvement experts.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.article
}

export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': t.accent,
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}

'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Lock, Send } from 'lucide-react'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

type DraftPost = {
  id: string
  task: TaskKey
  title: string
  category: string
  summary: string
  url: string
  image: string
  body: string
  createdAt: string
}

const STORE_KEY = 'slot4:created-posts'

const saveDraft = (draft: DraftPost) => {
  try {
    const existing = JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]')
    const list = Array.isArray(existing) ? existing : []
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft, ...list].slice(0, 50)))
  } catch {
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft]))
  }
}

const fieldClass =
  'w-full rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-warm,#fff7ee)] px-4 py-3 text-sm font-medium text-[var(--slot4-page-text,#2f1d16)] outline-none transition placeholder:text-[var(--slot4-muted-text,#9a8478)] focus:border-[var(--slot4-accent,#e05a2b)] focus:bg-white'

export default function CreatePage() {
  const { session } = useEditableLocalAuthSession()
  const enabledTasks = useMemo(() => SITE_CONFIG.tasks.filter((t) => t.enabled), [])
  const [task, setTask] = useState<TaskKey>((enabledTasks[0]?.key || 'article') as TaskKey)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [summary, setSummary] = useState('')
  const [url, setUrl] = useState('')
  const [image, setImage] = useState('')
  const [body, setBody] = useState('')
  const [created, setCreated] = useState<DraftPost | null>(null)

  const activeTask = enabledTasks.find((t) => t.key === task) || enabledTasks[0]

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const draft: DraftPost = {
      id: `draft-${Date.now()}`,
      task,
      title: title.trim(),
      category: category.trim() || 'uncategorized',
      summary: summary.trim(),
      url: url.trim(),
      image: image.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    }
    saveDraft(draft)
    setCreated(draft)
    setTitle('')
    setCategory('')
    setSummary('')
    setUrl('')
    setImage('')
    setBody('')
  }

  /* ── Locked (not signed in) ── */
  if (!session) {
    return (
      <EditableSiteShell>
        <main className="min-h-screen bg-white text-[var(--slot4-page-text,#2f1d16)]">
          {/* Hero band */}
          <div className="border-b border-[var(--editable-border)] bg-[var(--slot4-warm,#fff7ee)] px-6 py-20 sm:py-24 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--slot4-accent,#e05a2b)]">
                {pagesContent.create.locked.badge}
              </span>
              <h1 className="mt-4 text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                {pagesContent.create.locked.title}
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[var(--slot4-muted-text,#7a6560)]">
                {pagesContent.create.locked.description}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent,#e05a2b)] px-7 py-3 text-sm font-bold text-white transition hover:opacity-90"
                >
                  Login <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-white px-7 py-3 text-sm font-bold transition hover:border-[var(--slot4-accent,#e05a2b)]"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>

          {/* Lock icon section */}
          <div className="flex flex-col items-center py-20 text-[var(--slot4-muted-text,#9a8478)]">
            <Lock className="h-16 w-16 opacity-30" />
            <p className="mt-4 text-sm font-medium">Sign in to access the publishing workspace.</p>
          </div>
        </main>
      </EditableSiteShell>
    )
  }

  /* ── Signed in — create form ── */
  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-white text-[var(--slot4-page-text,#2f1d16)]">
        {/* Page header */}
        <div className="border-b border-[var(--editable-border)] bg-[var(--slot4-warm,#fff7ee)] px-6 py-14 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--slot4-accent,#e05a2b)]">
              {pagesContent.create.hero.badge}
            </span>
            <h1 className="mt-3 text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              {pagesContent.create.hero.title}
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-[var(--slot4-muted-text,#7a6560)]">
              {pagesContent.create.hero.description}
            </p>
            {/* Signed-in pill */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-white px-4 py-1.5 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Signed in as {session.name}
            </div>
          </div>
        </div>

        {/* Form */}
        <section className="mx-auto max-w-3xl px-6 py-12 lg:px-8">
          {/* Task selector — inline pills, no cards */}
          {enabledTasks.length > 1 && (
            <div className="mb-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--slot4-muted-text,#9a8478)]">
                Post type
              </p>
              <div className="flex flex-wrap gap-2">
                {enabledTasks.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setTask(item.key)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      item.key === task
                        ? 'border-[var(--slot4-accent,#e05a2b)] bg-[var(--slot4-accent,#e05a2b)] text-white'
                        : 'border-[var(--editable-border)] bg-white hover:border-[var(--slot4-accent,#e05a2b)] hover:text-[var(--slot4-accent,#e05a2b)]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={submit} className="grid gap-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--slot4-muted-text,#9a8478)]">
                Title *
              </label>
              <input
                className={fieldClass}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`${activeTask?.label || 'Post'} title`}
                required
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--slot4-muted-text,#9a8478)]">
                  Category
                </label>
                <input
                  className={fieldClass}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. DIY, Home Improvement"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--slot4-muted-text,#9a8478)]">
                  Source URL
                </label>
                <input
                  className={fieldClass}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--slot4-muted-text,#9a8478)]">
                Featured image URL
              </label>
              <input
                className={fieldClass}
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--slot4-muted-text,#9a8478)]">
                Short summary *
              </label>
              <textarea
                className={`${fieldClass} min-h-[6rem] resize-y`}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="A brief description of your post"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--slot4-muted-text,#9a8478)]">
                Main content *
              </label>
              <textarea
                className={`${fieldClass} min-h-[14rem] resize-y`}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your full guide, description, or listing details here…"
                required
              />
            </div>

            {created ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                <p className="flex items-center gap-2 text-sm font-bold">
                  <CheckCircle2 className="h-5 w-5" />
                  {pagesContent.create.successTitle}
                </p>
                <p className="mt-1 text-sm opacity-75">{created.title}</p>
              </div>
            ) : null}

            <div className="pt-2">
              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent,#e05a2b)] px-8 text-sm font-bold text-white transition hover:opacity-90 sm:w-auto"
              >
                <Send className="h-4 w-4" />
                {pagesContent.create.submitLabel}
              </button>
            </div>
          </form>
        </section>
      </main>
    </EditableSiteShell>
  )
}

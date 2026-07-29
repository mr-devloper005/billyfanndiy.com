import Link from 'next/link'
import { ArrowRight, BadgeCheck, Flame } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { getEditablePostImage, postHref, toPlainText } from '@/editable/cards/PostCards'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-8'

/* ─── Helpers ─── */

function getExcerpt(post?: SitePost | null, limit = 130) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    (typeof post?.summary === 'string' && post.summary) ||
    (typeof content.body === 'string' && content.body) ||
    (typeof content.excerpt === 'string' && content.excerpt) ||
    ''
  const clean = toPlainText(raw)
  return clean.length > limit ? `${clean.slice(0, limit).trim()}…` : clean
}

function categoryOf(post?: SitePost | null): string {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || 'DIY'
}

function authorOf(post?: SitePost | null): string {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (
    (typeof content.authorName === 'string' && content.authorName) ||
    (typeof content.author === 'string' && content.author) ||
    'Contributor'
  )
}

function authorAvatarOf(post?: SitePost | null): string {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (typeof content.authorAvatar === 'string' && content.authorAvatar) || ''
}

function dateOf(post?: SitePost | null): string {
  const any = post as unknown as Record<string, unknown>
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const raw = any?.publishedAt || any?.createdAt || content.publishedAt || content.date || content.createdAt
  if (!raw || typeof raw !== 'string') return ''
  try {
    return new Date(raw).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

function hashStr(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const p of posts) {
    const key = p.slug || p.id || p.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(p)
  }
  return out
}

/* ─── Badge system — deterministic colours per category ─── */
const PALETTES = [
  { bg: '#ede9fe', text: '#7c3aed' },
  { bg: '#fce7f3', text: '#db2777' },
  { bg: '#d1fae5', text: '#059669' },
  { bg: '#dbeafe', text: '#1d4ed8' },
  { bg: '#fef3c7', text: '#d97706' },
  { bg: '#e0f2fe', text: '#0284c7' },
  { bg: '#fde2e4', text: '#be123c' },
  { bg: '#e0e7ff', text: '#4338ca' },
]

function badgeStyle(category: string) {
  return PALETTES[hashStr(category.toLowerCase()) % PALETTES.length]
}

function CategoryBadge({ category, className = '' }: { category: string; className?: string }) {
  const { bg, text } = badgeStyle(category)
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5 ${className}`}
      style={{ backgroundColor: bg, color: text }}
    >
      {category}
    </span>
  )
}

function AuthorAvatar({
  name,
  avatar,
  size = 'sm',
}: {
  name: string
  avatar?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const dims =
    size === 'lg'
      ? 'h-14 w-14 text-xl'
      : size === 'md'
      ? 'h-9 w-9 text-sm'
      : 'h-6 w-6 text-xs'
  const initial = name.charAt(0).toUpperCase()
  const { bg, text } = badgeStyle(name)
  if (avatar) {
    return (
      <img src={avatar} alt={name} className={`${dims} shrink-0 rounded-full object-cover`} />
    )
  }
  return (
    <span
      className={`${dims} inline-flex shrink-0 items-center justify-center rounded-full font-bold`}
      style={{ backgroundColor: bg, color: text }}
    >
      {initial}
    </span>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 1 — Editor's Pick (featured hero + hot-right-now rail)
   ═══════════════════════════════════════════════════════════════ */
export function EditableHomeHero({
  primaryTask,
  primaryRoute,
  posts,
  timeSections,
}: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((s) => s.posts)])
  const featured = pool[0]
  const sidebar = pool.slice(1, 7)

  if (!featured) return null

  const featImg = getEditablePostImage(featured)
  const featAuthor = authorOf(featured)
  const featAvatar = authorAvatarOf(featured)
  const featDate = dateOf(featured)

  return (
    <section className="bg-white py-12 sm:py-16">
      <div className={container}>
        {/* Section header */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            <span className="mr-3 text-[var(--slot4-accent)]">—</span>
            Editor&apos;s Pick
            <span className="ml-3 text-[var(--slot4-accent)]">—</span>
          </h2>
          <p className="mt-2 text-sm text-[var(--slot4-muted-text)]">
            Outstanding DIY guides from our contributors.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Featured card */}
          <Link
            href={postHref(primaryTask, featured, primaryRoute)}
            className="group relative block min-h-[460px] overflow-hidden rounded-2xl bg-black sm:min-h-[520px]"
          >
            <img
              src={featImg}
              alt={featured.title}
              className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-[1.03]"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            {/* TRENDING badge */}
            <span className="absolute left-4 top-4 rounded bg-[var(--slot4-accent)] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
              TRENDING
            </span>

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
              <div className="mb-3 flex items-center gap-2.5">
                <AuthorAvatar name={featAuthor} avatar={featAvatar} size="sm" />
                <span className="text-sm font-semibold text-white">{featAuthor}</span>
                {featDate && (
                  <span className="text-sm text-white/60">{featDate}</span>
                )}
              </div>
              <h3 className="text-2xl font-extrabold leading-snug text-white sm:text-3xl">
                {featured.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/75">
                {getExcerpt(featured, 160)}
              </p>
              <div className="mt-5 flex items-center gap-4">
                <span className="text-sm text-white/60">♥ 0 &nbsp; 💬 0</span>
                <span className="ml-auto inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-5 py-2 text-sm font-bold text-white transition group-hover:opacity-90">
                  Read Full Guide
                </span>
              </div>
            </div>
          </Link>

          {/* Hot Right Now sidebar */}
          <div>
            <div className="mb-5 flex items-center gap-2">
              <Flame className="h-5 w-5 text-[var(--slot4-accent)]" />
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-[var(--slot4-page-text)]">
                Hot Right Now
              </h3>
            </div>
            <div className="flex flex-col divide-y divide-[var(--editable-border)]">
              {sidebar.map((post, i) => {
                const cat = categoryOf(post)
                const auth = authorOf(post)
                const av = authorAvatarOf(post)
                return (
                  <Link
                    key={post.id || post.slug}
                    href={postHref(primaryTask, post, primaryRoute)}
                    className="group -mx-2 flex items-start gap-3.5 rounded-xl px-2 py-3.5 transition hover:bg-[var(--slot4-warm)]"
                  >
                    <span className="min-w-[2.25rem] text-center text-2xl font-black leading-none text-[var(--editable-border)]">
                      {String(i + 2).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <CategoryBadge category={cat} />
                      <h4 className="mt-1.5 line-clamp-2 text-sm font-bold leading-snug text-[var(--slot4-page-text)] group-hover:text-[var(--slot4-accent)]">
                        {post.title}
                      </h4>
                      <div className="mt-1.5 flex items-center gap-2">
                        <AuthorAvatar name={auth} avatar={av} size="sm" />
                        <span className="text-xs text-[var(--slot4-muted-text)]">{auth}</span>
                        <span className="text-xs text-[var(--slot4-muted-text)]">· ♥ 0</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 2 — Editor Verified (3 card grid)
   ═══════════════════════════════════════════════════════════════ */
export function EditableStoryRail({
  primaryTask,
  primaryRoute,
  posts,
  timeSections,
}: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((s) => s.posts)])
  const cards = pool.slice(1, 4)
  if (!cards.length) return null

  return (
    <section className="bg-[var(--slot4-warm)] py-12 sm:py-14">
      <div className={container}>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-[var(--slot4-accent)]" />
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-[var(--slot4-page-text)]">
              Editor Verified
            </h2>
          </div>
          <Link
            href="/article"
            className="text-sm font-semibold text-[var(--slot4-accent)] hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((post) => {
            const img = getEditablePostImage(post)
            const cat = categoryOf(post)
            const auth = authorOf(post)
            const av = authorAvatarOf(post)
            const dt = dateOf(post)
            return (
              <Link
                key={post.id || post.slug}
                href={postHref(primaryTask, post, primaryRoute)}
                className="group block overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(0,0,0,0.10)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--slot4-media-bg)]">
                  <CategoryBadge category={cat} className="absolute left-3 top-3 z-10" />
                  <img
                    src={img}
                    alt={post.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <h3 className="line-clamp-2 text-base font-bold leading-snug text-[var(--slot4-page-text)] group-hover:text-[var(--slot4-accent)]">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--slot4-muted-text)]">
                    {getExcerpt(post, 120)}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AuthorAvatar name={auth} avatar={av} size="sm" />
                      <span className="text-xs font-medium text-[var(--slot4-muted-text)]">
                        {auth}
                      </span>
                      {dt && (
                        <span className="text-xs text-[var(--slot4-muted-text)]">· {dt}</span>
                      )}
                    </div>
                    <span className="text-xs text-[var(--slot4-muted-text)]">♥ 0 · 💬 0</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/article"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-dark-bg)] px-8 py-3 text-sm font-bold text-white transition hover:opacity-90"
          >
            Discover More Top Content
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 3 — "Your project deserves to be built" CTA + Stats
   ═══════════════════════════════════════════════════════════════ */
export function EditableMagazineSplit(_props: HomeSectionProps) {
  return (
    <>
      {/* Hero CTA text */}
      <section className="overflow-hidden bg-white py-20 text-center">
        <div className={container}>
          <h2 className="text-5xl font-black leading-tight tracking-tight text-[var(--slot4-page-text)] sm:text-6xl">
            Your project{' '}
            <span
              className="font-black italic"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                backgroundImage: 'linear-gradient(135deg, var(--slot4-accent) 0%, #f97316 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              deserves
            </span>{' '}
            to be
            <br />
            built.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-[var(--slot4-muted-text)]">
            Join 50,000+ DIY creators on {SITE_CONFIG.name} where hands-on guides find their audience.
          </p>

          {/* Gradient separator */}
          <div
            className="mx-auto my-10 h-0.5 max-w-2xl"
            style={{
              background: 'linear-gradient(90deg, var(--slot4-accent) 0%, #a855f7 50%, #3b82f6 100%)',
            }}
          />

          {/* Platform card */}
          <div className="mx-auto max-w-xl rounded-2xl border border-[var(--editable-border)] bg-white p-8 text-left shadow-[0_8px_40px_rgba(0,0,0,0.07)]">
            <div className="mb-5 text-center">
              <h3 className="text-xl font-extrabold">DIY Creator Platform</h3>
              <p className="mt-1 text-sm text-[var(--slot4-accent)]">Share your expertise with the world</p>
            </div>

            <div className="rounded-xl border border-[var(--editable-border)] bg-[var(--slot4-warm)] p-5">
              <p className="text-sm italic leading-relaxed text-[var(--slot4-muted-text)]">
                &ldquo;Publishing my guides on {SITE_CONFIG.name} has exceeded all my expectations. The
                community is engaged and my projects have helped thousands of homeowners make real
                improvements.&rdquo;
              </p>
              <p className="mt-3 text-sm font-semibold text-[var(--slot4-accent)]">
                — DIY Contributor
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {['#7c3aed', '#059669', '#1d4ed8'].map((color, i) => (
                    <span
                      key={color}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white"
                      style={{ backgroundColor: color, zIndex: 3 - i }}
                    >
                      {['S', 'J', 'E'][i]}
                    </span>
                  ))}
                </div>
                <span className="text-sm text-[var(--slot4-muted-text)]">50K+ creators</span>
              </div>
              <Link
                href="/create"
                className="rounded-full bg-[var(--slot4-dark-bg)] px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
              >
                Start Creating
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section className="border-y border-[var(--editable-border)] bg-white">
        <div className={`py-8 ${container}`}>
          <div className="grid grid-cols-3 divide-x divide-[var(--editable-border)]">
            {[
              { value: '50K+', label: 'Active Creators' },
              { value: '500K+', label: 'Monthly Readers' },
              { value: '25K+', label: 'Guides Published' },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center px-4 py-4 text-center">
                <span className="text-3xl font-black text-[var(--slot4-accent)] sm:text-4xl">
                  {value}
                </span>
                <span className="mt-1 text-sm text-[var(--slot4-muted-text)]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 4 — Time Collections:
     a) Top Contributors spotlight
     b) "Hand Picked" dark carousel
     c) Latest Guides list
   ═══════════════════════════════════════════════════════════════ */
export function EditableTimeCollections({
  primaryTask,
  primaryRoute,
  posts,
  timeSections,
}: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((s) => s.posts)])

  /* ── a) Contributor spotlight ── */
  const contributorPosts = pool.slice(0, 8)
  const contributors = (() => {
    const seen = new Set<string>()
    const out: Array<{ name: string; avatar: string; bio: string; post: SitePost }> = []
    for (const p of contributorPosts) {
      const name = authorOf(p)
      if (seen.has(name) || name === 'Contributor') continue
      seen.add(name)
      out.push({ name, avatar: authorAvatarOf(p), bio: getExcerpt(p, 90), post: p })
    }
    return out.slice(0, 4)
  })()

  /* ── b) Hand-picked carousel ── */
  const carouselPosts = pool.slice(0, 10)

  /* ── c) Latest guides ── */
  const latestPosts = pool.slice(0, 8)

  const diyCategories = [
    'All Categories',
    'Woodworking',
    'Plumbing',
    'Landscaping',
    'Interior',
    'Electrical',
  ]

  return (
    <>
      {/* ── Contributor Spotlight ── */}
      {contributors.length >= 2 && (
        <section className="bg-[var(--slot4-warm)] py-14 sm:py-16">
          <div className={container}>
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Top Contributors
              </h2>
              <p className="mt-2 text-sm text-[var(--slot4-muted-text)]">
                Meet the creators sharing hands-on expertise
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {contributors.map(({ name, avatar, bio, post }) => (
                <Link
                  key={name}
                  href={postHref(primaryTask, post, primaryRoute)}
                  className="group flex flex-col items-center rounded-2xl border border-[var(--editable-border)] bg-white p-7 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(0,0,0,0.09)]"
                >
                  <AuthorAvatar name={name} avatar={avatar} size="lg" />
                  <h3 className="mt-4 text-base font-extrabold text-[var(--slot4-page-text)]">
                    {name}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[var(--slot4-muted-text)]">
                    {bio}
                  </p>
                  <span className="mt-4 rounded-full border border-[var(--editable-border)] px-4 py-1.5 text-xs font-semibold text-[var(--slot4-muted-text)] transition group-hover:border-[var(--slot4-accent)] group-hover:text-[var(--slot4-accent)]">
                    View Profile
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Hand Picked dark section ── */}
      <section
        className="overflow-hidden py-16 sm:py-20"
        style={{ backgroundColor: 'var(--slot4-dark-bg)' }}
      >
        <div className={container}>
          <div className="text-center">
            <span className="mb-6 inline-block rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/60">
              Top Picks
            </span>
            <h2 className="text-5xl font-black leading-none text-white sm:text-6xl lg:text-7xl">
              Hand{' '}
              <span
                style={{
                  backgroundImage: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Picked
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base text-white/70">
              Hand-selected quality DIY guides you shouldn&apos;t miss
            </p>
            <p className="mx-auto mt-2 max-w-lg text-sm text-white/50">
              Get inspired. Make an impact. Join the creators sharing projects that matter.
            </p>
          </div>

          {/* Category pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {diyCategories.map((cat) => (
              <Link
                key={cat}
                href={
                  cat === 'All Categories'
                    ? '/article'
                    : `/article?category=${encodeURIComponent(cat.toLowerCase())}`
                }
                className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white/80 transition hover:border-white hover:bg-white/10 hover:text-white"
              >
                {cat}
              </Link>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/create"
              className="rounded-full px-8 py-3 text-sm font-bold text-white transition hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, var(--slot4-accent) 0%, #f97316 100%)' }}
            >
              Start Creating
            </Link>
            <Link
              href="/article"
              className="rounded-full border border-white/30 px-8 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Explore Content
            </Link>
          </div>

          {/* Scrollable carousel */}
          {carouselPosts.length > 0 && (
            <div className="mt-12">
              <div className="editable-carousel -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {carouselPosts.map((post, i) => {
                  const img = getEditablePostImage(post)
                  const cat = categoryOf(post)
                  const auth = authorOf(post)
                  const dt = dateOf(post)
                  const isCenter = i === Math.floor(carouselPosts.length / 2)
                  return (
                    <Link
                      key={post.id || post.slug}
                      href={postHref(primaryTask, post, primaryRoute)}
                      className={`group block flex-none snap-center overflow-hidden rounded-2xl transition ${
                        isCenter
                          ? 'w-[300px] border-2 border-white/20 shadow-[0_24px_60px_rgba(0,0,0,0.5)] sm:w-[360px]'
                          : 'w-[260px] opacity-75 hover:opacity-100 sm:w-[320px]'
                      }`}
                      style={{ backgroundColor: '#1a1a2e' }}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={img}
                          alt={post.title}
                          className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-[1.04]"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a]/80 to-transparent" />
                        <CategoryBadge category={cat} className="absolute left-3 top-3 z-10" />
                      </div>
                      <div className="p-5">
                        <h3 className="line-clamp-2 text-base font-bold leading-snug text-white">
                          {post.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm text-white/60">
                          {getExcerpt(post, 100)}
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                          <AuthorAvatar name={auth} size="sm" />
                          <span className="text-xs text-white/60">{auth}</span>
                          {dt && <span className="text-xs text-white/40">· {dt}</span>}
                          <span className="ml-auto text-xs text-white/40">Read Post →</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* Dot indicators */}
              <div className="mt-5 flex justify-center gap-2">
                {Array.from({ length: Math.min(carouselPosts.length, 5) }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 rounded-full bg-white transition-all ${i === 0 ? 'w-6 opacity-100' : 'w-2 opacity-30'}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Latest Guides list ── */}
      <section className="bg-white py-14 sm:py-16">
        <div className={container}>
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Latest Guides</h2>
            <p className="mt-1 text-sm text-[var(--slot4-muted-text)]">
              Just published: See what&apos;s new from our creators
            </p>
          </div>

          <div className="flex flex-col divide-y divide-[var(--editable-border)]">
            {latestPosts.map((post) => {
              const img = getEditablePostImage(post)
              const cat = categoryOf(post)
              const auth = authorOf(post)
              const av = authorAvatarOf(post)
              const dt = dateOf(post)
              return (
                <Link
                  key={post.id || post.slug}
                  href={postHref(primaryTask, post, primaryRoute)}
                  className="group flex items-start gap-5 py-6"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold leading-snug text-[var(--slot4-page-text)] group-hover:text-[var(--slot4-accent)] sm:text-lg">
                      {post.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--slot4-muted-text)]">
                      {getExcerpt(post, 180)}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <AuthorAvatar name={auth} avatar={av} size="sm" />
                        <span className="text-xs font-medium text-[var(--slot4-muted-text)]">
                          {auth}
                        </span>
                        {dt && (
                          <span className="text-xs text-[var(--slot4-muted-text)]">· {dt}</span>
                        )}
                      </div>
                      <CategoryBadge category={cat} />
                      <span className="text-xs text-[var(--slot4-muted-text)]">6 min read</span>
                      <span className="text-xs text-[var(--slot4-muted-text)]">♥ 0</span>
                    </div>
                  </div>
                  <div className="hidden shrink-0 sm:block">
                    <img
                      src={img}
                      alt={post.title}
                      className="h-[90px] w-[150px] rounded-xl border border-[var(--editable-border)] object-cover transition duration-300 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/article"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] px-8 py-3 text-sm font-semibold text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]"
            >
              View All Guides <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 5 — CTA Band
   ═══════════════════════════════════════════════════════════════ */
export function EditableHomeCta() {
  return (
    <section className="bg-[var(--slot4-accent)] py-16">
      <div className={`text-center ${container}`}>
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          Ready to share your next project?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-white/90 sm:text-lg">
          Join thousands of DIY creators and home improvement enthusiasts on {SITE_CONFIG.name}.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/create"
            className="rounded-full bg-white px-8 py-3 text-sm font-bold text-[var(--slot4-accent)] transition hover:brightness-95"
          >
            Start Creating
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-white/60 px-8 py-3 text-sm font-bold text-white transition hover:bg-white/10"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  )
}

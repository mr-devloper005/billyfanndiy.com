import Link from 'next/link'
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, ChevronDown, Download, FileText, Globe, MapPin, Phone, Search, Star, UserRound } from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { dedupeUrls } from '@/editable/cards/PostCards'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'

export const revalidate = 3

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo)
  return dedupeUrls([...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])]).slice(0, 8)
}

const placeholder = '/placeholder.svg?height=900&width=1200'
const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const stripHtml = (value: string) => value
  .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/&quot;/gi, '"')
  .replace(/&#0?39;|&apos;/gi, "'")
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
const getSummary = (post: SitePost) => stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body))
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}
const cleanDomain = (value: string) => value.replace(/^https?:\/\//, '').replace(/\/$/, '')

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

const taskGrid: Record<TaskKey, string> = {
  article: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
  listing: 'grid gap-5 xl:grid-cols-2',
  classified: 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3',
  image: 'columns-1 gap-5 [column-fill:_balance] sm:columns-2 xl:columns-3',
  sbm: 'grid gap-5 md:grid-cols-2 xl:grid-cols-3',
  pdf: 'grid gap-5 md:grid-cols-2 xl:grid-cols-3',
  profile: 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

const cardBase = 'group block rounded-2xl border border-[var(--editable-border)] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(0,0,0,0.10)]'

/* ── Deterministic category badge colours ── */
const BADGE_PALETTES = [
  { bg: '#ede9fe', text: '#7c3aed' },
  { bg: '#fce7f3', text: '#db2777' },
  { bg: '#d1fae5', text: '#059669' },
  { bg: '#dbeafe', text: '#1d4ed8' },
  { bg: '#fef3c7', text: '#d97706' },
  { bg: '#e0f2fe', text: '#0284c7' },
  { bg: '#fde2e4', text: '#be123c' },
  { bg: '#e0e7ff', text: '#4338ca' },
]
function hashStr(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}
function CategoryBadge({ category, className = '' }: { category: string; className?: string }) {
  const palette = BADGE_PALETTES[hashStr(category.toLowerCase()) % BADGE_PALETTES.length]
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5 ${className}`}
      style={{ backgroundColor: palette.bg, color: palette.text }}
    >
      {category}
    </span>
  )
}

/* ── Star rating (kept for listing / business cards only) ── */
const ratingOf = (post: SitePost) => {
  const real = Number(getContent(post).rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  return Math.round((3.7 + (hashStr(post.slug || post.id || post.title || 'x') % 13) / 10) * 10) / 10
}
const reviewsOf = (post: SitePost) => {
  const real = Number(getContent(post).reviewCount ?? getContent(post).reviews)
  if (real > 0) return Math.floor(real)
  return 6 + (hashStr((post.slug || post.title || 'x') + 'r') % 480)
}
function RatingLine({ post, center = false }: { post: SitePost; center?: boolean }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className={`mt-2.5 flex items-center gap-2 ${center ? 'justify-center' : ''}`}>
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-4 w-4 ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
        ))}
      </span>
      <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
      <span className="text-sm text-[var(--slot4-muted-text)]">({reviewsOf(post)})</span>
    </div>
  )
}

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return <TaskArchiveView task={task} posts={posts} pagination={pagination} category={category} basePath={basePath || taskConfig?.route || `/${task}`} />
}

export function TaskArchiveView({ task, posts, pagination, category, basePath }: { task: TaskKey; posts: SitePost[]; pagination: SiteFeedPagination; category: string; basePath: string }) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const label = taskConfig?.label || task
  const categoryLabel = category === 'all' ? 'All categories' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-white text-[var(--slot4-page-text)]">

        {/* ── Archive header ── */}
        <header className="border-b border-[var(--editable-border)] bg-white">
          <div className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-18 lg:px-8">
            {/* Eyebrow */}
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--slot4-accent)]">
              <span>{theme.kicker}</span>
              <span className="h-1 w-1 rounded-full bg-[var(--slot4-accent)]" />
              <span className="text-[var(--slot4-muted-text)]">{label}</span>
            </div>

            {/* Title */}
            <h1 className="mt-5 max-w-3xl text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              {voice?.headline || `Browse ${label}`}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--slot4-muted-text)]">
              {voice?.description || theme.note}
            </p>

            {/* Topic chips */}
            {voice?.chips?.length ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {voice.chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-[var(--editable-border)] bg-[var(--slot4-warm)] px-4 py-1.5 text-xs font-medium text-[var(--slot4-muted-text)]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            ) : null}

            {/* Count + filter */}
            <div className="mt-10 flex flex-col gap-4 border-t border-[var(--editable-border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--slot4-muted-text)]">
                <span className="font-bold text-[var(--slot4-page-text)]">{posts.length}</span>{' '}
                {posts.length === 1 ? 'post' : 'posts'} · {categoryLabel}
              </p>
              <form action={basePath} className="flex items-center gap-2">
                <div className="relative">
                  <select
                    name="category"
                    defaultValue={category}
                    className="h-10 appearance-none rounded-full border border-[var(--editable-border)] bg-white pl-4 pr-10 text-sm font-medium text-[var(--slot4-page-text)] outline-none transition focus:border-[var(--slot4-accent)]"
                    aria-label={voice?.filterLabel || 'Filter category'}
                  >
                    <option value="all">All categories</option>
                    {CATEGORY_OPTIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--slot4-muted-text)]" />
                </div>
                <button className="inline-flex h-10 items-center rounded-full bg-[var(--slot4-accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90">
                  Apply
                </button>
              </form>
            </div>
          </div>
        </header>

        {/* ── Post grid ── */}
        <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-16 lg:px-8">
          {posts.length ? (
            <div className={taskGrid[task]}>
              {posts.map((post, index) => (
                <ArchivePostCard key={post.id || post.slug} post={post} task={task} basePath={basePath} index={index} />
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-md rounded-2xl border border-dashed border-[var(--editable-border)] bg-[var(--slot4-warm)] px-8 py-16 text-center">
              <Search className="mx-auto h-7 w-7 text-[var(--slot4-muted-text)]" />
              <h2 className="mt-5 text-xl font-bold">Nothing here yet</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--slot4-muted-text)]">
                Try another category or check back after new {label.toLowerCase()} are published.
              </p>
            </div>
          )}

          {/* ── Pagination ── */}
          {posts.length ? (
            <nav className="mt-14 flex items-center justify-center gap-3 text-sm">
              {pagination.hasPrevPage ? (
                <Link
                  href={pageHref(basePath, category, page - 1)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--editable-border)] px-5 py-2.5 font-medium transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]"
                >
                  ← Previous
                </Link>
              ) : null}
              <span className="rounded-full border border-[var(--editable-border)] bg-[var(--slot4-warm)] px-5 py-2.5 font-medium text-[var(--slot4-muted-text)]">
                Page {page} of {pagination.totalPages || 1}
              </span>
              {pagination.hasNextPage ? (
                <Link
                  href={pageHref(basePath, category, page + 1)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--editable-border)] px-5 py-2.5 font-medium transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]"
                >
                  Next →
                </Link>
              ) : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function ArchivePostCard({ post, task, basePath, index }: { post: SitePost; task: TaskKey; basePath: string; index: number }) {
  const href = `${basePath}/${post.slug}` || buildPostUrl(task, post.slug)
  if (task === 'listing') return <ListingArchiveCard post={post} href={href} />
  if (task === 'classified') return <ClassifiedArchiveCard post={post} href={href} />
  if (task === 'image') return <ImageArchiveCard post={post} href={href} index={index} />
  if (task === 'sbm') return <BookmarkArchiveCard post={post} href={href} index={index} />
  if (task === 'pdf') return <PdfArchiveCard post={post} href={href} />
  if (task === 'profile') return <ProfileArchiveCard post={post} href={href} />
  return <ArticleArchiveCard post={post} href={href} />
}

/* ── Article card — editorial magazine style ── */
function ArticleArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const image = getImage(post)
  const category = getCategory(post, 'Article')
  const author = asText(getContent(post).authorName) || asText(getContent(post).author) || 'Contributor'
  const summary = getSummary(post)
  return (
    <Link href={href} className={`${cardBase} overflow-hidden`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--slot4-warm)]">
        <CategoryBadge category={category} className="absolute left-3 top-3 z-10" />
        <img
          src={image}
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
      </div>
      <div className="p-5">
        <h2 className="line-clamp-2 text-base font-bold leading-snug tracking-tight text-[var(--slot4-page-text)] group-hover:text-[var(--slot4-accent)]">
          {post.title}
        </h2>
        {summary ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--slot4-muted-text)]">{summary}</p>
        ) : null}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--slot4-muted-text)]">{author}</span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--slot4-accent)]">
            Read <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

/* ── Listing card — kept business-focused ── */
function ListingArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const logo = getImages(post)[0]
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const website = getField(post, ['website', 'url'])
  return (
    <Link href={href} className={`${cardBase} flex items-center gap-5 p-5 sm:p-6`}>
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-warm)]">
        {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <BriefcaseBusiness className="h-8 w-8 text-[var(--slot4-muted-text)]" />}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base font-bold tracking-tight text-[var(--slot4-page-text)] group-hover:text-[var(--slot4-accent)]">{post.title}</h2>
        <RatingLine post={post} />
        <p className="mt-1.5 line-clamp-1 text-sm leading-6 text-[var(--slot4-muted-text)]">{getSummary(post)}</p>
        <div className="mt-2.5 flex flex-wrap gap-3 text-xs font-medium text-[var(--slot4-muted-text)]">
          {location ? <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3 text-[var(--slot4-accent)]" /> {location}</span> : null}
          {phone ? <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3 text-[var(--slot4-accent)]" /> {phone}</span> : null}
          {website ? <span className="inline-flex items-center gap-1"><Globe className="h-3 w-3 text-[var(--slot4-accent)]" /> Website</span> : null}
        </div>
      </div>
      <ArrowUpRight className="h-5 w-5 shrink-0 text-[var(--slot4-muted-text)] transition group-hover:text-[var(--slot4-accent)]" />
    </Link>
  )
}

function ClassifiedArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'type', 'availability'])
  return (
    <Link href={href} className={`${cardBase} flex flex-col p-6`}>
      <div className="flex items-start justify-between gap-4">
        <span className="text-2xl font-extrabold tracking-tight text-[var(--slot4-accent)]">{price || 'Open offer'}</span>
        {condition ? (
          <span className="rounded-full bg-[var(--slot4-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--slot4-accent)]">{condition}</span>
        ) : null}
      </div>
      <h2 className="mt-4 text-lg font-bold leading-snug tracking-tight group-hover:text-[var(--slot4-accent)]">{post.title}</h2>
      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-7 text-[var(--slot4-muted-text)]">{getSummary(post)}</p>
      <div className="mt-5 flex items-center justify-between border-t border-[var(--editable-border)] pt-4 text-xs font-medium text-[var(--slot4-muted-text)]">
        <span className="inline-flex items-center gap-1.5">{location ? <><MapPin className="h-3.5 w-3.5" /> {location}</> : 'Details inside'}</span>
        <ArrowUpRight className="h-4 w-4 text-[var(--slot4-accent)]" />
      </div>
    </Link>
  )
}

function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  return (
    <Link href={href} className="group mb-5 block break-inside-avoid overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-white transition duration-300 hover:-translate-y-1">
      <div className={`relative overflow-hidden ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80 transition group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h2 className="line-clamp-2 text-base font-bold leading-snug text-white">{post.title}</h2>
          <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-white/70">
            View image <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function BookmarkArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <Link href={href} className={`${cardBase} flex gap-4 p-5`}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
        <Globe className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--slot4-muted-text)]">Saved · {String(index + 1).padStart(2, '0')}</span>
        <h2 className="mt-1 text-base font-bold leading-snug tracking-tight group-hover:text-[var(--slot4-accent)]">{post.title}</h2>
        <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{getSummary(post)}</p>
        {website ? <p className="mt-2 truncate text-xs font-medium text-[var(--slot4-accent)]">{cleanDomain(website)}</p> : null}
      </div>
    </Link>
  )
}

function PdfArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const category = getCategory(post, 'Document')
  return (
    <Link href={href} className={`${cardBase} flex flex-col p-6`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
          <FileText className="h-5 w-5" />
        </div>
        <CategoryBadge category={category} />
      </div>
      <h2 className="mt-5 text-lg font-bold leading-snug tracking-tight group-hover:text-[var(--slot4-accent)]">{post.title}</h2>
      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-7 text-[var(--slot4-muted-text)]">{getSummary(post)}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--slot4-accent)]">
        Open document <Download className="h-4 w-4" />
      </span>
    </Link>
  )
}

function ProfileArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const avatar = getImages(post)[0]
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  return (
    <Link href={href} className={`${cardBase} flex flex-col items-center p-7 text-center`}>
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[var(--editable-border)] bg-[var(--slot4-warm)]">
        {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-9 w-9 text-[var(--slot4-muted-text)]" />}
      </div>
      <h2 className="mt-4 text-base font-bold tracking-tight group-hover:text-[var(--slot4-accent)]">{post.title}</h2>
      {role ? <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[var(--slot4-accent)]">{role}</p> : null}
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{getSummary(post)}</p>
    </Link>
  )
}

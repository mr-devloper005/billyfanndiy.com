import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, ArrowUpRight, Bookmark, Building2, Camera, CheckCircle2, Download, ExternalLink, FileText, Globe2, Mail, MapPin, Phone, Tag, UserRound } from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { dedupeUrls } from '@/editable/cards/PostCards'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'

export const revalidate = 3

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

/* ── Data helpers ── */
const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return dedupeUrls([...media, ...images, ...singleImages]).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const safeUrl = (value: string) => /^https?:\/\//i.test(value) ? value : '#'

const linkifyMarkdown = (value: string) => value
  .replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)

const linkifyText = (value: string) => linkifyMarkdown(value)
  .replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)

const hardenLinks = (html: string) => html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
  let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  if (!/\starget=/i.test(next)) next += ' target="_blank"'
  if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
  return `<a ${next}>`
})

const sanitizeHtml = (html: string) => hardenLinks(html
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'))

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const comparable = (value: string) => stripHtml(value).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  if (!lead) return ''
  const leadKey = comparable(lead)
  return leadKey && comparable(getBody(post)).includes(leadKey) ? '' : lead
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

/* ── Badge colours ── */
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
function CategoryBadge({ category }: { category: string }) {
  const p = BADGE_PALETTES[hashStr(category.toLowerCase()) % BADGE_PALETTES.length]
  return (
    <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: p.bg, color: p.text }}>
      {category}
    </span>
  )
}

export function TaskDetailView({ task, post, related, comments = [] }: { task: TaskKey; post: SitePost; related: SitePost[]; comments?: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-white text-[var(--slot4-page-text)]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

/* ── Shared UI ── */
function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  return (
    <Link
      href={taskConfig?.route || '/'}
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--editable-border)] px-4 py-1.5 text-sm font-medium text-[var(--slot4-muted-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]"
    >
      <ArrowLeft className="h-3.5 w-3.5" /> Back to {taskConfig?.label || 'posts'}
    </Link>
  )
}

function Divider() {
  return <div className="my-10 h-px bg-[var(--editable-border)]" />
}

function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content mt-8 max-w-none text-[var(--slot4-page-text)] ${compact ? 'text-[15px] leading-7' : 'text-[1.0625rem] leading-8'}`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function InfoGrid({ items }: { items: Array<[string, string, typeof MapPin]> }) {
  const visible = items.filter(([, value]) => value)
  if (!visible.length) return null
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2">
      {visible.map(([label, value, Icon]) => (
        <div key={label} className="rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-warm)] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--slot4-muted-text)]">
            <Icon className="h-4 w-4 text-[var(--slot4-accent)]" /> {label}
          </div>
          <p className="mt-2 break-words text-sm font-medium leading-6">{value}</p>
        </div>
      ))}
    </div>
  )
}

function ImageStrip({ images, label, large = false }: { images: string[]; label: string; large?: boolean }) {
  if (!images.length) return null
  return (
    <section className="mt-10">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--slot4-muted-text)]">{label}</p>
      <div className={`mt-4 grid gap-3 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => (
          <img key={`${image}-${index}`} src={image} alt="" className="aspect-[4/3] rounded-2xl border border-[var(--editable-border)] object-cover" />
        ))}
      </div>
    </section>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-white">
      <div className="flex items-center gap-2 p-4 text-sm font-semibold">
        <MapPin className="h-4 w-4 text-[var(--slot4-accent)]" /> {label || 'Map location'}
      </div>
      <iframe src={src} title="Map" loading="lazy" className="h-64 w-full border-0" />
    </div>
  )
}

function ContactAction({ website, phone, email, bare = false }: { website?: string; phone?: string; email?: string; bare?: boolean }) {
  if (!website && !phone && !email) return null
  const buttons = (
    <div className={`flex flex-wrap gap-2.5 ${bare ? 'justify-center' : ''}`}>
      {website ? (
        <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
          Website <ExternalLink className="h-4 w-4" />
        </Link>
      ) : null}
      {phone ? (
        <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]">
          <Phone className="h-4 w-4" /> Call
        </a>
      ) : null}
      {email ? (
        <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]">
          <Mail className="h-4 w-4" /> Email
        </a>
      ) : null}
    </div>
  )
  if (bare) return <div className="mt-6">{buttons}</div>
  return null
}

function BadgeLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--editable-border)] bg-[var(--slot4-warm)] px-4 py-3 text-sm">
      <span className="font-semibold uppercase tracking-wider text-[var(--slot4-muted-text)]">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  )
}

/* ── Article detail — editorial reading layout ── */
function ArticleDetail({ post, related, comments }: { post: SitePost; related: SitePost[]; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  const images = getImages(post)
  const category = categoryOf(post, 'Article')
  const author = asText(getContent(post).authorName) || asText(getContent(post).author) || 'Contributor'
  const authorInitial = author.charAt(0).toUpperCase()
  const PALETTES = BADGE_PALETTES
  const authorColor = PALETTES[hashStr(author.toLowerCase()) % PALETTES.length]

  return (
    <>
      {/* Hero band */}
      <div className="border-b border-[var(--editable-border)] bg-[var(--slot4-warm)] px-6 py-14 sm:py-18 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <BackLink task="article" />
          <div className="mt-8 flex items-center gap-3">
            <CategoryBadge category={category} />
          </div>
          <h1 className="mt-4 text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            {post.title}
          </h1>
          {leadText(post) ? (
            <p className="mt-5 text-lg leading-relaxed text-[var(--slot4-muted-text)]">{leadText(post)}</p>
          ) : null}

          {/* Author row */}
          <div className="mt-8 flex items-center gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: authorColor.text }}
            >
              {authorInitial}
            </span>
            <div>
              <p className="text-sm font-semibold">{author}</p>
              <p className="text-xs text-[var(--slot4-muted-text)]">{SITE_CONFIG.name} · 6 min read</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero image */}
      {images[0] ? (
        <div className="mx-auto max-w-4xl px-6 pt-10 lg:px-8">
          <img
            src={images[0]}
            alt=""
            className="aspect-[16/9] w-full rounded-2xl border border-[var(--editable-border)] object-cover"
          />
        </div>
      ) : null}

      {/* Body */}
      <article className="mx-auto max-w-3xl px-6 py-10 lg:px-8">
        <BodyContent post={post} />
        <Divider />
        <EditableArticleComments slug={post.slug} comments={comments} />
      </article>

      <RelatedStrip task="article" related={related} />
    </>
  )
}

/* ── Listing detail ── */
function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const logo = images[0]
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const mapSrc = mapSrcFor(post)
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-16 lg:px-8">
      <BackLink task="listing" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article className="min-w-0">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-warm)]">
              {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <Building2 className="h-10 w-10 text-[var(--slot4-muted-text)]" />}
            </div>
            <div className="min-w-0">
              <CategoryBadge category={getField(post, ['category']) || 'Business'} />
              <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{post.title}</h1>
            </div>
          </div>
          {leadText(post) ? <p className="mt-6 text-lg leading-relaxed text-[var(--slot4-muted-text)]">{leadText(post)}</p> : null}
          <InfoGrid items={[['Location', address, MapPin], ['Phone', phone, Phone], ['Email', email, Mail], ['Website', website, Globe2]]} />
          <Divider />
          <BodyContent post={post} />
          <ImageStrip images={images.slice(1)} label="Showcase" />
        </article>
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {mapSrc ? <MapBox src={mapSrc} label={address || post.title} /> : null}
          <ContactAction website={website} phone={phone} email={email} />
          <RelatedPanel task="listing" post={post} related={related} />
        </aside>
      </div>
    </section>
  )
}

/* ── Classified detail ── */
function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'availability', 'type'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  return (
    <>
      <section className="mx-auto grid max-w-[var(--editable-container)] gap-10 px-6 py-14 sm:py-16 lg:grid-cols-[340px_minmax(0,1fr)] lg:px-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BackLink task="classified" />
          <div className="mt-6 rounded-2xl border border-[var(--editable-border)] bg-white p-7 shadow-[0_8px_28px_rgba(0,0,0,0.08)]">
            <CategoryBadge category={getField(post, ['category']) || 'Classified'} />
            <h1 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight">{post.title}</h1>
            <p className="mt-5 text-4xl font-extrabold tracking-tight text-[var(--slot4-accent)]">{price || 'Open offer'}</p>
            <div className="mt-5 space-y-2">
              {condition ? <BadgeLine label="Condition" value={condition} /> : null}
              {location ? <BadgeLine label="Location" value={location} /> : null}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"><Phone className="h-4 w-4" /> Call now</a> : null}
              {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--slot4-accent)]"><Mail className="h-4 w-4" /> Email</a> : null}
            </div>
          </div>
        </aside>
        <article className="min-w-0">
          <ImageStrip images={images} label="Offer images" large />
          <BodyContent post={post} />
          <ContactAction website={website} phone={phone} email={email} />
        </article>
      </section>
      <RelatedStrip task="classified" related={related} />
    </>
  )
}

/* ── Image detail ── */
function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-16 lg:px-8">
        <BackLink task="image" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="columns-1 gap-5 [column-fill:_balance] sm:columns-2">
            {gallery.map((image, index) => (
              <figure key={`${image}-${index}`} className="mb-5 break-inside-avoid overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-white">
                <img src={image} alt="" className="w-full object-cover" />
              </figure>
            ))}
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] px-3.5 py-1.5 text-xs font-medium text-[var(--slot4-muted-text)]">
              <Camera className="h-3.5 w-3.5 text-[var(--slot4-accent)]" /> Image story
            </div>
            <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{post.title}</h1>
            {leadText(post) ? <p className="mt-4 text-base leading-relaxed text-[var(--slot4-muted-text)]">{leadText(post)}</p> : null}
            <BodyContent post={post} compact />
          </aside>
        </div>
      </section>
      <RelatedStrip task="image" related={related} />
    </>
  )
}

/* ── Bookmark detail ── */
function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <>
      <article className="mx-auto max-w-3xl px-6 py-14 sm:py-16">
        <BackLink task="sbm" />
        <div className="mt-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
          <Bookmark className="h-6 w-6" />
        </div>
        <div className="mt-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--slot4-accent)]">Saved resource</span>
        </div>
        <h1 className="mt-3 text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{post.title}</h1>
        {leadText(post) ? <p className="mt-5 text-lg leading-relaxed text-[var(--slot4-muted-text)]">{leadText(post)}</p> : null}
        {website ? (
          <Link href={website} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90">
            Open resource <ExternalLink className="h-4 w-4" />
          </Link>
        ) : null}
        <BodyContent post={post} />
      </article>
      <RelatedStrip task="sbm" related={related} />
    </>
  )
}

/* ── PDF detail ── */
function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-16 lg:px-8">
      <BackLink task="pdf" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="min-w-0">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
              <FileText className="h-8 w-8" />
            </div>
            <div className="min-w-0">
              <CategoryBadge category={categoryOf(post, 'Document')} />
              <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{post.title}</h1>
            </div>
          </div>
          <BodyContent post={post} />
          {fileUrl ? (
            <div className="mt-10 overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--editable-border)] p-4">
                <span className="text-sm font-semibold">Document preview</span>
                <Link href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90">
                  Download <Download className="h-4 w-4" />
                </Link>
              </div>
              <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[78vh] min-h-[520px] w-full bg-[var(--slot4-warm)]" />
              <div className="border-t border-[var(--editable-border)] p-4 text-sm text-[var(--slot4-muted-text)]">
                Can&apos;t see the document?{' '}
                <Link href={fileUrl} target="_blank" rel="noreferrer" className="font-semibold text-[var(--slot4-accent)] underline">Open in a new tab</Link>.
              </div>
            </div>
          ) : null}
        </article>
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {fileUrl ? (
            <div className="rounded-2xl border border-[var(--editable-border)] bg-white p-6">
              <p className="text-sm font-bold">Get this document</p>
              <p className="mt-2 text-sm leading-6 text-[var(--slot4-muted-text)]">Open or download the full file in a new tab.</p>
              <Link href={fileUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">
                Download <Download className="h-4 w-4" />
              </Link>
            </div>
          ) : null}
          <RelatedPanel task="pdf" post={post} related={related} />
        </aside>
      </div>
    </section>
  )
}

/* ── Profile detail ── */
function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-16 lg:px-8">
        <BackLink task="profile" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-[var(--editable-border)] bg-white p-8 text-center shadow-[0_8px_28px_rgba(0,0,0,0.08)]">
              <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-[var(--editable-border)] bg-[var(--slot4-warm)]">
                {images[0] ? <img src={images[0]} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-12 w-12 text-[var(--slot4-muted-text)]" />}
              </div>
              <h1 className="mt-5 text-xl font-extrabold tracking-tight">{post.title}</h1>
              {role ? <p className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--slot4-accent)]">{role}</p> : null}
              <ContactAction website={website} email={email} bare />
            </div>
          </aside>
          <article className="min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--slot4-accent)]">Profile</span>
            <BodyContent post={post} />
            <ImageStrip images={images.slice(1)} label="Gallery" />
          </article>
        </div>
      </section>
      <RelatedStrip task="profile" related={related} />
    </>
  )
}

/* ── Related sidebar panel ── */
function RelatedPanel({ task, post, related }: { task: TaskKey; post: SitePost; related: SitePost[] }) {
  const taskConfig = getTaskConfig(task)
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-warm)] p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--slot4-muted-text)]">About this post</p>
        <div className="mt-4 grid gap-2.5 text-sm text-[var(--slot4-muted-text)]">
          <p className="inline-flex items-center gap-2"><Tag className="h-4 w-4 text-[var(--slot4-accent)]" /> {taskConfig?.label || task}</p>
          <p className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--slot4-accent)]" /> {SITE_CONFIG.name}</p>
        </div>
      </div>
      {related.length ? (
        <div className="rounded-2xl border border-[var(--editable-border)] bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold">More like this</h2>
            <Link href={taskConfig?.route || '/'} className="text-xs font-semibold text-[var(--slot4-accent)]">View all</Link>
          </div>
          <div className="mt-4 grid gap-3">
            {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} />)}
          </div>
        </div>
      ) : null}
    </div>
  )
}

/* ── Related bottom strip ── */
function RelatedStrip({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  return (
    <section className="border-t border-[var(--editable-border)] bg-[var(--slot4-warm)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-16 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight">More {(taskConfig?.label || 'posts').toLowerCase()}</h2>
          <Link
            href={taskConfig?.route || '/'}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--slot4-accent)] hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} grid />)}
        </div>
      </div>
    </section>
  )
}

/* ── Related card ── */
function RelatedCard({ task, post, grid = false }: { task: TaskKey; post: SitePost; grid?: boolean }) {
  const image = getImages(post)[0]
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}`
  if (grid) {
    return (
      <Link href={href} className="group block overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.09)]">
        <div className="aspect-[16/10] overflow-hidden bg-[var(--slot4-warm)]">
          {image
            ? <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
            : <div className="flex h-full items-center justify-center"><FileText className="h-6 w-6 text-[var(--slot4-muted-text)]" /></div>}
        </div>
        <div className="p-4">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug group-hover:text-[var(--slot4-accent)]">{post.title}</h3>
          <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--slot4-muted-text)]">{stripHtml(summaryText(post))}</p>
        </div>
      </Link>
    )
  }
  return (
    <Link href={href} className="group flex gap-3 rounded-xl border border-[var(--editable-border)] p-3 transition hover:border-[var(--slot4-accent)]">
      {image && task !== 'sbm'
        ? <img src={image} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
        : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[var(--slot4-warm)]"><FileText className="h-4 w-4 text-[var(--slot4-muted-text)]" /></div>}
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug group-hover:text-[var(--slot4-accent)]">{post.title}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--slot4-muted-text)]">{stripHtml(summaryText(post))}</p>
      </div>
    </Link>
  )
}

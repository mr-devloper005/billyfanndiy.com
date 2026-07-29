'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search, UserPlus, LogIn, X, PlusCircle, Hammer } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()

  const navItems = useMemo(
    () => SITE_CONFIG.tasks.filter((t) => t.enabled && t.key !== 'listing').map((t) => ({ label: t.label, href: t.route })),
    []
  )

  const allNavItems = [
    ...navItems,
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[var(--editable-border)] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <nav className="mx-auto flex h-16 w-full max-w-[var(--editable-container)] items-center gap-4 px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <img
            src="/favicon.png?v=20260413"
            alt={SITE_CONFIG.name}
            className="h-9 w-9 object-contain"
          />
          <span className="hidden font-extrabold text-[17px] tracking-tight text-[var(--slot4-page-text)] md:block leading-none">
            {SITE_CONFIG.name}
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-0.5 lg:flex ml-4">
          <Link
            href="/"
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              pathname === '/'
                ? 'bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]'
                : 'text-[var(--slot4-muted-text)] hover:bg-[var(--slot4-warm)] hover:text-[var(--slot4-page-text)]'
            }`}
          >
            Home
          </Link>
          {allNavItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? 'bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]'
                    : 'text-[var(--slot4-muted-text)] hover:bg-[var(--slot4-warm)] hover:text-[var(--slot4-page-text)]'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search bar */}
        <form
          action="/search"
          className="hidden items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-warm)] px-4 py-2 transition focus-within:border-[var(--slot4-accent)] md:flex"
        >
          <Search className="h-4 w-4 shrink-0 text-[var(--slot4-muted-text)]" />
          <input
            name="q"
            type="search"
            placeholder="Search guides…"
            className="w-36 bg-transparent text-sm text-[var(--slot4-page-text)] outline-none placeholder:text-[var(--slot4-muted-text)]"
          />
          <span className="hidden items-center gap-0.5 rounded border border-[var(--editable-border)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--slot4-muted-text)] lg:flex">
            Ctrl K
          </span>
        </form>

        {/* Auth + Submit */}
        <div className="flex shrink-0 items-center gap-2">
          {session ? (
            <>
              {session.name && (
                <div className="hidden items-center gap-2 sm:flex">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: 'var(--slot4-accent)' }}
                  >
                    {session.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden text-sm font-medium text-[var(--slot4-page-text)] lg:block max-w-[120px] truncate">
                    {session.name}
                  </span>
                </div>
              )}
              <Link
                href="/create"
                className="hidden items-center gap-1.5 rounded-full bg-[var(--slot4-accent)] px-4 py-1.5 text-sm font-semibold text-white transition hover:opacity-90 sm:inline-flex"
              >
                <PlusCircle className="h-4 w-4" /> Create
              </Link>
              <button
                type="button"
                onClick={logout}
                className="hidden text-sm font-medium text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)] sm:block"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm font-medium text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)] sm:block"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="hidden items-center gap-1.5 rounded-full border border-[var(--slot4-accent)] px-4 py-1.5 text-sm font-semibold text-[var(--slot4-accent)] transition hover:bg-[var(--slot4-accent)] hover:text-white sm:inline-flex"
              >
                <UserPlus className="h-4 w-4" /> Sign Up
              </Link>
            </>
          )}

          {/* Submit Guide pill */}
          <Link
            href="/create"
            className="hidden items-center gap-1.5 rounded-full bg-[var(--slot4-dark-bg)] px-4 py-1.5 text-sm font-semibold text-white transition hover:opacity-90 md:inline-flex"
          >
            <Hammer className="h-4 w-4" /> Submit Guide
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-[var(--editable-border)] p-2 text-[var(--slot4-muted-text)] transition hover:bg-[var(--slot4-warm)] lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-[var(--editable-border)] bg-white px-4 py-5 lg:hidden">
          <form
            action="/search"
            className="mb-4 flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-warm)] px-4 py-2"
          >
            <Search className="h-4 w-4 text-[var(--slot4-muted-text)]" />
            <input
              name="q"
              type="search"
              placeholder="Search guides…"
              className="min-w-0 flex-1 bg-transparent text-sm text-[var(--slot4-page-text)] outline-none"
            />
          </form>

          <div className="grid gap-1">
            {[
              { label: 'Home', href: '/' },
              ...allNavItems,
              ...(session
                ? [{ label: 'Create Guide', href: '/create' }]
                : [{ label: 'Login', href: '/login' }, { label: 'Sign Up', href: '/signup' }]),
            ].map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                    active
                      ? 'bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]'
                      : 'text-[var(--slot4-muted-text)] hover:bg-[var(--slot4-warm)]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </header>
  )
}

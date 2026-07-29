import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const globalContent = {
  site: {
    name: slot4BrandConfig.siteName,
    tagline: 'DIY guides, home improvement & project ideas',
    domain: slot4BrandConfig.domain,
    baseUrl: slot4BrandConfig.baseUrl,
  },
  nav: {
    tagline: 'DIY guides & home improvement',
    primaryLinks: [
      { label: 'Articles', href: '/article' },
      { label: 'Listings', href: '/listing' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
    actions: {
      primary: { label: 'Submit Guide', href: '/create' },
      secondary: { label: 'Browse Guides', href: '/article' },
    },
  },
  footer: {
    tagline: 'DIY guides, home improvement tips, and project ideas',
    description: 'Your go-to resource for hands-on home improvement guides, tool reviews, local contractor listings, and DIY project inspiration.',
    columns: [
      {
        title: 'Explore',
        links: [
          { label: 'DIY Articles', href: '/article' },
          { label: 'Business Listings', href: '/listing' },
          { label: 'Search', href: '/search' },
        ],
      },
      {
        title: 'Site',
        links: [
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
          { label: 'Submit a Guide', href: '/create' },
        ],
      },
    ],
    bottomNote: 'Built for DIY enthusiasts and home improvement professionals.',
  },
  commonLabels: {
    readMore: 'Read guide',
    viewAll: 'View all',
    explore: 'Explore',
    latest: 'Latest',
    related: 'Related',
    published: 'Published',
  },
} as const

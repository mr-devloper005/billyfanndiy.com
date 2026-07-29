import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const pagesContent = {
  home: {
    metadata: {
      title: 'DIY guides, home improvement tips & local business listings',
      description: 'Discover step-by-step DIY guides, home improvement tutorials, tool reviews, and local contractor listings on BillyFann DIY.',
      openGraphTitle: 'DIY guides, home improvement tips & local business listings',
      openGraphDescription: 'Hands-on DIY project guides, home improvement articles, and a directory of local contractors and home services.',
      keywords: ['DIY guides', 'home improvement', 'how to', 'DIY projects', 'home repair', 'contractor listings', 'tools and materials'],
    },
    hero: {
      badge: "Editor's Pick",
      title: ["Top DIY Guides", "& Home Projects"],
      description: 'Explore the best DIY tutorials, home improvement tips, and local business listings — curated by our editorial team.',
      primaryCta: { label: 'Browse Guides', href: '/article' },
      secondaryCta: { label: 'Find Contractors', href: '/listing' },
      searchPlaceholder: 'Search DIY guides, projects, tips, and more…',
      focusLabel: 'Trending',
      featureCardBadge: 'Featured guide',
      featureCardTitle: 'Latest DIY projects inspire the homepage.',
      featureCardDescription: 'Our editors hand-pick the best new guides and home improvement tips every week.',
    },
    intro: {
      badge: 'About the platform',
      title: 'Built for homeowners, renovators, and hands-on creators.',
      paragraphs: [
        'BillyFann DIY brings together step-by-step project guides, home improvement articles, and a directory of local contractors — all in one place.',
        'Whether you are tackling a weekend woodworking project, planning a kitchen remodel, or looking for a trusted plumber, you will find what you need here.',
        'Our contributors share real-world experience so visitors can learn from people who have actually done the work.',
      ],
      sideBadge: 'At a glance',
      sidePoints: [
        'Step-by-step DIY project guides with photos and material lists.',
        'Local contractor and supplier directory with ratings.',
        'Community-driven content from real DIY enthusiasts.',
        'Updated daily with new guides and listings.',
      ],
      primaryLink: { label: 'Browse guides', href: '/article' },
      secondaryLink: { label: 'Find contractors', href: '/listing' },
    },
    cta: {
      badge: 'Start creating',
      title: 'Share your expertise with the DIY community.',
      description: 'Submit your how-to guides, project photos, and tips — and help thousands of homeowners tackle their next project.',
      primaryCta: { label: 'Submit a Guide', href: '/create' },
      secondaryCta: { label: 'Contact Us', href: '/contact' },
    },
    taskSection: {
      heading: 'Latest {label}',
      descriptionSuffix: 'Browse the newest posts in this section.',
    },
  },
  about: {
    badge: 'Our Story',
    title: 'Your trusted home for DIY guides and home improvement tips.',
    description: `${slot4BrandConfig.siteName} is a community platform connecting DIY enthusiasts, homeowners, and home improvement professionals through practical guides and a trusted local business directory.`,
    paragraphs: [
      'We believe that with the right guidance, anyone can tackle a home improvement project. Our contributors share step-by-step tutorials, real-world tips, and honest reviews so you can approach every project with confidence.',
      'Whether you are a first-time homeowner or a seasoned renovator, you will find practical advice that actually works — written by people who have done the work themselves.',
    ],
    values: [
      {
        title: 'Practical, hands-on guides',
        description: 'We prioritize clear instructions, real photos, and honest material lists so you can get the job done right.',
      },
      {
        title: 'Trusted local directory',
        description: 'Our contractor and supplier listings help you find vetted professionals in your area when a project is beyond DIY.',
      },
      {
        title: 'Community-driven knowledge',
        description: 'Our content comes from real homeowners, contractors, and DIY enthusiasts — not generic advice farms.',
      },
    ],
  },
  contact: {
    eyebrow: `Contact ${slot4BrandConfig.siteName}`,
    title: 'Have a question, project idea, or listing to submit?',
    description: 'Whether you want to submit a DIY guide, add your business to our directory, or just say hello — we would love to hear from you.',
    formTitle: 'Send us a message',
  },

  search: {
    metadata: {
      title: 'Search DIY guides and listings',
      description: 'Search for DIY guides, home improvement tips, contractor listings, and more.',
    },
    hero: {
      badge: 'Search the archive',
      title: 'Find the right guide for your next project.',
      description: 'Search for step-by-step DIY tutorials, home improvement tips, tool reviews, and local contractor listings.',
      placeholder: 'Search by keyword, project type, material, or skill level',
    },
    resultsTitle: 'Latest guides and listings',
  },
  create: {
    metadata: {
      title: 'Submit a DIY guide or listing',
      description: 'Share your DIY expertise with the community. Submit a how-to guide or add your business to our directory.',
    },
    locked: {
      badge: 'Creator access',
      title: 'Login to submit your guide or listing.',
      description: 'Create an account to publish step-by-step DIY guides, project write-ups, and business listings for the community.',
    },
    hero: {
      badge: 'Publishing workspace',
      title: 'Share your expertise with the DIY community.',
      description: 'Submit how-to guides, project write-ups, contractor listings, and home improvement tips.',
    },
    formTitle: 'Guide or listing details',
    submitLabel: 'Submit content',
    successTitle: 'Your submission was received — thank you!',
  },
  auth: {
    login: {
      metadataDescription: 'Login to your BillyFann DIY account.',
      badge: 'Member access',
      title: 'Welcome back to BillyFann DIY.',
      description: 'Login to submit guides, manage your listings, and connect with the DIY community.',
      formTitle: 'Login',
      submitLabel: 'Continue',
      noAccount: 'No account found. Create an account first, then log in.',
      success: 'Login successful. Redirecting…',
      createCta: 'Create an account',
    },
    signup: {
      metadataDescription: 'Create a BillyFann DIY account.',
      badge: 'Join the community',
      title: 'Start sharing your DIY expertise.',
      description: 'Create an account to publish guides, save your favorite projects, and connect with fellow DIY enthusiasts.',
      formTitle: 'Create account',
      submitLabel: 'Create account',
      passwordShort: 'Use at least 4 characters for your password.',
      success: 'Account created — welcome to the community!',
      loginCta: 'Login',
    },
  },
  detailPages: {
    article: {
      relatedTitle: 'Related guides',
      fallbackTitle: 'DIY guide details',
    },
    listing: {
      relatedTitle: 'Related listings',
      fallbackTitle: 'Business listing details',
    },
    image: {
      relatedTitle: 'Related projects',
      fallbackTitle: 'Project photos',
    },
    profile: {
      relatedTitle: 'More from this contributor',
      fallbackDescription: 'Contributor details will appear here once available.',
      visitButton: 'Visit Website',
    },
  },
} as const

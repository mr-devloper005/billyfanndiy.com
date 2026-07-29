import type { TaskKey } from '@/lib/site-config'

export type TaskPageVoice = {
  eyebrow: string
  headline: string
  description: string
  filterLabel: string
  secondaryNote: string
  chips: string[]
}

export const taskPageVoices = {
  article: {
    eyebrow: 'DIY Guides',
    headline: 'Step-by-step home improvement guides and how-to articles.',
    description: 'Browse tutorials, project walkthroughs, tool reviews, and practical tips from experienced DIY enthusiasts and home improvement professionals.',
    filterLabel: 'Filter by category',
    secondaryNote: 'Real projects. Honest advice. Written by people who have done the work.',
    chips: ['How-to guides', 'Project walkthroughs', 'Tool reviews', 'Beginner friendly'],
  },
  classified: {
    eyebrow: 'Marketplace',
    headline: 'Tools, materials, and services for your next project.',
    description: 'Find tools, building materials, and services posted by the DIY community. Great deals on what you need to get the job done.',
    filterLabel: 'Filter by type',
    secondaryNote: 'Quick-scan listings with prices, conditions, and contact details.',
    chips: ['Tools for sale', 'Materials', 'Services offered', 'Local deals'],
  },
  sbm: {
    eyebrow: 'Resources',
    headline: 'Curated links and references for the DIY community.',
    description: 'A hand-picked collection of useful tools, tutorials, suppliers, and reference materials bookmarked by fellow DIY enthusiasts.',
    filterLabel: 'Filter by topic',
    secondaryNote: 'Organised by topic so you can find useful resources fast.',
    chips: ['Tutorials', 'Suppliers', 'Tools', 'Reference links'],
  },
  profile: {
    eyebrow: 'Contributors',
    headline: 'DIY creators, contractors, and home improvement experts.',
    description: 'Discover the people behind the guides — homeowners, tradespeople, and renovation enthusiasts sharing their expertise with the community.',
    filterLabel: 'Filter contributors',
    secondaryNote: 'Real credentials, real projects, real advice.',
    chips: ['DIY enthusiasts', 'Contractors', 'Renovation pros', 'Community members'],
  },
  pdf: {
    eyebrow: 'Plans & Documents',
    headline: 'Downloadable project plans, blueprints, and how-to guides.',
    description: 'Access printable plans, material checklists, blueprint templates, and reference documents for your home improvement projects.',
    filterLabel: 'Filter document type',
    secondaryNote: 'Take the plans to the workshop or job site.',
    chips: ['Project plans', 'Blueprints', 'Checklists', 'Reference guides'],
  },
  listing: {
    eyebrow: 'Business Directory',
    headline: 'Local contractors, suppliers, and home improvement services.',
    description: 'Find vetted local businesses including general contractors, electricians, plumbers, landscapers, and building supply stores in your area.',
    filterLabel: 'Filter by trade',
    secondaryNote: 'Compare ratings, services, and contact details before you call.',
    chips: ['General contractors', 'Electricians', 'Plumbers', 'Landscapers', 'Suppliers'],
  },
  image: {
    eyebrow: 'Project Gallery',
    headline: 'Before-and-after photos and completed DIY project galleries.',
    description: 'Get inspired by real home transformations, DIY builds, and renovation projects shared by the community.',
    filterLabel: 'Filter by project type',
    secondaryNote: 'Real projects, real results — no staged stock photos.',
    chips: ['Renovations', 'Woodworking', 'Landscaping', 'Interior makeovers'],
  },
} satisfies Record<TaskKey, TaskPageVoice>

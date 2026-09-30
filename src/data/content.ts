/**
 * data/content.ts
 *
 * All site copy lives here. Fields marked PLACEHOLDER are believable stand-ins
 * and should be replaced with real details before the site is promoted.
 *
 * Inline emphasis: a word wrapped in *asterisks* (see Settlement Desk) is
 * meant to be rendered in italics by whichever view prints the string.
 */

export const site = {
    name: 'Thomas Lim',
    role: 'Technology Consultant',
    location: 'Singapore',
    coords: 'Remote',
    email: 'thomas.lim@pacificconsultinggroup.com.au',
    github: 'https://github.com/thomaspcg',
    company: 'https://www.pacificconsultinggroup.com',
    availability: 'Available for Projects Q1 2027',
    title: `
    <span class="line" style="--i: 0">
        <span class="line__in">Creating Software</span></span>
        <span class="line" style="--i: 1"><span class="line__in">with <em class="accent">Super</em></span></span>
        <span class="line" style="--i: 2"><span class="line__in">Intelligence</span>
    `
}

export type GlyphKind = 'ledger' | 'tiers' | 'graph' | 'form' | 'notes'

export interface Project {
    slug: string
    title: string
    year: number
    kind: string
    role: string
    stack: string[]
    glyph: GlyphKind
    featured: boolean
    summary: string
    intro: string
    problem: string
    approach: string[]
    outcome: string
    link?: string
}

export const projects: Project[] = [
    // PLACEHOLDER — replace with real work
    // {
    //     slug: 'settlement-desk',
    //     title: 'Settlement Desk',
    //     year: 2025,
    //     kind: 'Internal tool',
    //     role: 'Lead frontend engineer',
    //     stack: ['Vue 3', 'TypeScript', 'Vuetify', 'Web Workers'],
    //     glyph: 'ledger',
    //     featured: true,
    //     summary: 'An operations console for matching bank settlement files against the internal ledger.',
    //     intro: 'An operations console for matching bank settlement files against the internal ledger.',
    //     problem:
    //         'The ops team reconciled end-of-day files in spreadsheets, and mismatches surfaced days later during month-end close.',
    //     approach: [
    //         'Settlement files are parsed in a Web Worker so a 40,000-row file never blocks the UI.',
    //         "Matching rules are declared as data, and each row shows *why* it matched or didn't.",
    //         'A virtualised exceptions table is keyboard-first, because the team lives in it all day.',
    //     ],
    //     outcome: 'Month-end close went from three days of spreadsheet work to an afternoon of reviewing exceptions.',
    // },
    // {
    //     slug: 'tax-tiers',
    //     title: 'Tax Tiers',
    //     year: 2024,
    //     kind: 'Calculator',
    //     role: 'Designer & developer',
    //     stack: ['JavaScript', 'Intl.NumberFormat', 'HTML'],
    //     glyph: 'tiers',
    //     featured: true,
    //     summary: 'A Singapore resident income-tax calculator that shows which bracket each dollar lands in.',
    //     intro: 'A Singapore resident income-tax calculator that shows which bracket each dollar lands in.',
    //     problem: "Most people read IRAS's progressive table as a flat rate and overestimate what they owe.",
    //     approach: [
    //         'The twelve resident brackets from YA2024 are encoded as data (threshold, base tax, marginal rate), so each calculation is one lookup and one multiplication.',
    //         'Currency-masked inputs format as you type.',
    //         'The output separates tax payable from the effective rate.',
    //     ],
    //     outcome:
    //         'It runs entirely in the browser, and when the budget changes the bracket table is the only thing to edit.',
    // },
    // // PLACEHOLDER — replace with real work
    // {
    //     slug: 'pipeline-viewer',
    //     title: 'Pipeline Viewer',
    //     year: 2023,
    //     kind: 'Developer tool',
    //     role: 'Frontend engineer',
    //     stack: ['TypeScript', 'SVG', 'Dagre'],
    //     glyph: 'graph',
    //     featured: true,
    //     summary: 'A dependency graph for 300 nightly ETL jobs, built for the engineer paged at 3am.',
    //     intro: 'A dependency graph for 300 nightly ETL jobs, built for the engineer paged at 3am.',
    //     problem: 'When a nightly job failed, finding every downstream job it blocked meant grepping YAML.',
    //     approach: [
    //         'The job DAG is laid out once on the server as static JSON.',
    //         'Hovering a node traces its upstream and downstream paths.',
    //         'Failed and blocked jobs are colour-coded, and the rest fade back.',
    //     ],
    //     outcome: 'Triage starts from a picture instead of a log file.',
    // },
    // // PLACEHOLDER — replace with real work
    // {
    //     slug: 'fieldbook',
    //     title: 'Fieldbook',
    //     year: 2022,
    //     kind: 'Mobile web app',
    //     role: 'Full-stack engineer',
    //     stack: ['Vue', 'IndexedDB', 'Service Worker', 'Node'],
    //     glyph: 'form',
    //     featured: false,
    //     summary: 'Offline-first inspection forms for technicians working in plant rooms with no signal.',
    //     intro: 'Offline-first inspection forms for technicians working in plant rooms with no signal.',
    //     problem: 'Technicians lost submissions whenever connectivity dropped mid-form.',
    //     approach: [
    //         'Every keystroke is saved to IndexedDB.',
    //         'A sync queue retries with backoff and resolves conflicts per field.',
    //         'Forms are defined in JSON so supervisors can add a checklist without a release.',
    //     ],
    //     outcome: 'Lost submissions stopped being a support category.',
    // },
    {
        slug: 'production-scheduler',
        title: 'Production Scheduler',
        year: 2018,
        kind: 'Manufacturing Resource Planning (MRP II)',
        role: 'Architect',
        stack: ['NodeJS', 'Redis', 'MySQL', 'Informix'],
        glyph: 'notes',
        featured: true,
        summary: 'A manufacturing resource planning application that works.',
        intro: 'A manufacturing tool',
        problem: "A quick scratchpad shouldn't need a sign-up.",
        approach: [
            'Transform huge legacy excel into a modular manufacutring planning system.',
            'Three distinct modules that drive the planning, production and procurement processes.',
            'Automatic BOM explosion and plan generation',
        ],
        outcome: 'A small, durable tool, and an early lesson in treating stored HTML as untrusted.',
    },
]

export interface Capability {
    index: string
    title: string
    description: string
    items: string[]
}

export const capabilities: Capability[] = [
    {
        index: '01',
        title: 'Interface engineering',
        description: 'Component systems in Vue and TypeScript, accessible from the first commit and tested with a keyboard.',
        items: ['Vue 3 / Vuetify', 'TypeScript', 'Design systems', 'WCAG 2.2'],
    },
    {
        index: '02',
        title: 'Application logic',
        description:
            'Domain rules — tax, pricing, reconciliation — modelled as data, so the interface can explain every number.',
        items: ['Domain modelling', 'Calculation engines', 'Property-based tests'],
    },
    {
        index: '03',
        title: 'Data-heavy interfaces',
        description: 'Tables, timelines and graphs that stay responsive at tens of thousands of rows.',
        items: ['Virtualisation', 'Web Workers', 'Canvas & SVG'],
    },
    {
        index: '04',
        title: 'Delivery',
        description: 'Small, reviewable changes shipped continuously, with the documentation written alongside.',
        items: ['CI/CD', 'Performance budgets', 'Technical writing'],
    },
]

// PLACEHOLDER — replace with a real biography
export const about = {
    intro: "I'm Thomas, a technology consultant from Singapore. I've spent the last decade building the parts of products that other people have to trust: calculations, ledgers, the screens where an operator decides whether something is wrong.",
    body: 'I care about interfaces that explain themselves, code that the next person can read, and shipping in small pieces. Outside work I build small browser tools, mostly to understand a problem properly.',
    principles: [
        {
            title: 'Make the logic visible',
            text: 'If a number can surprise someone, the interface should show how it was reached.',
        },
        {
            title: 'Embrace boring foundations',
            text: 'Well-understood tools leave more attention for the actual problem.',
        },
        {
            title: 'Ship in small pieces',
            text: 'Small changes are easier to review, easier to revert, and arrive sooner.',
        },
    ],
    // PLACEHOLDER — replace with real experience
    experience: [
        { years: '2023 — Now', role: 'Senior Software Engineer', context: 'Payments infrastructure, Singapore' },
        { years: '2019 — 2023', role: 'Software Engineer', context: 'Logistics platform' },
        { years: '2016 — 2019', role: 'Web Developer', context: 'Digital studio' },
    ],
    toolkit: [
        { group: 'Languages', items: ['TypeScript', 'JavaScript', 'SQL', 'Python'] },
        { group: 'Frontend', items: ['Vue', 'Vuetify', 'Vite', 'Canvas/SVG'] },
        { group: 'Backend', items: ['Node', 'PostgreSQL', 'REST'] },
        { group: 'Practice', items: ['Testing', 'CI/CD', 'Accessibility'] },
    ],
}

export const heroLead = `I design and build applications with assistance from <span class="accent">Super</span> Intelligence.`;

export const colophon = `designed and reviewed by me. coded by claude agents. <div>typeset with <span class="accent">Caveat</span>, <span class="accent">JetBrains Mono Variable</span> & <span class="accent">Montserrat</span></div>`

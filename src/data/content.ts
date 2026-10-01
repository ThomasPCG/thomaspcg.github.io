/**
 * data/content.ts
 *
 * All site copy lives here. Fields marked PLACEHOLDER are believable stand-ins
 * and should be replaced with real details before the site is promoted.
 *
 * Inline emphasis: a word wrapped in *asterisks* (see Settlement Desk) is
 * meant to be rendered in italics by whichever view prints the string.
 */
export type GlyphKind = 'ledger' | 'tiers' | 'graph' | 'form' | 'notes';
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
    <div class="line">
        <div class="line__in">Build</div>
        <div class="line__in accent">Better</div>
        <div class="line__in">Software</div>    
    </div>
    `
}
export const heroLead = `I design and build <span class="accent">applications</span>`;

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
    // {
    //     slug: 'production-scheduler',
    //     title: 'Production Scheduler',
    //     year: 2018,
    //     kind: 'Manufacturing Resource Planning (MRP II)',
    //     role: 'Architect',
    //     stack: ['NodeJS', 'Redis', 'MySQL', 'Informix'],
    //     glyph: 'form',
    //     featured: true,
    //     summary: 'A manufacturing resource planning application that works.',
    //     problem: "A quick scratchpad shouldn't need a sign-up.",
    //     approach: [
    //         'Transform huge legacy excel into a modular manufacutring planning system.',
    //         'Three distinct modules that drive the planning, production and procurement processes.',
    //         'Automatic BOM explosion and plan generation',
    //     ],
    //     outcome: 'A small, durable tool, and an early lesson in treating stored HTML as untrusted.',
    // },
    {
        slug: 'scribble',
        title: 'Scribble',
        year: 2020,
        kind: 'Rich Text Notes',
        role: 'Developer',
        stack: ['Vue', 'Tiptap', 'localStorage'],
        glyph: 'notes',
        featured: true,
        summary: 'A rich-text notepad that keeps everything in the browser, with no account or server required. Useful for mental notes throughout the day without "saving" to the cloud or creating an account just to note my TODOs.',
        problem: "A quick scratchpad shouldn't need a sign-up.",
        approach: [
            'Rich text editor => Tiptap has modern support on Vue stack and is open source.',
            'Notes are saved on request and stored in browser\'s localStorage.',
            'Stored notes are validated on load, so a stale entry won\'t break the list.',
        ],
        outcome: 'A small, durable tool that works right on the browser.',
    },
]

export interface Capability {
    title: string
    description: string
    items: string[]
}

export const capabilities: Capability[] = [
    {
        title: 'Intelligence<br/>Engineering',
        description: 'Architecting context-aware AI systems through specialized skills design, robust retrieval-augmented generation (RAG), and seamless Model Context Protocol (MCP) integrations',
        items: ['Skills Design', 'Retrieval-Augmented Generation', 'Model Context Protocol'],
    },
    {
        title: "Solutions<br/>Consulting",
        description: "Partnering with stakeholders to define requirements, build rapid proofs of concept, and deliver tailored technical strategies for your organisation.",
        items: ["Requirements Gathering", "Proof of Concept (PoC)", "Technical Strategy"]
    },
    {
        title: 'Cloud<br/>Architect',
        description: 'Building resilient cloud environments through scalable cloud resource provisioning, advanced threat defense integration, and robust edge security routing.',
        items: ['Cloud Resources Management', 'Edge Security', 'Threat Defense'],
    },
    {
        title: 'Software<br/>Development',
        description: 'Architecting and building scalable web, mobile, and desktop applications powered by robust Node.js and Java backends.',
        items: ['Cross-Platform Apps', 'Node.js', 'Java'],
    },
    {
        title: 'UX<br/>Design',
        description: 'Crafting intuitive and accessible user interfaces, using modern frontend frameworks with strict type safety and scalable component libraries.',
        items: ['Vue Stack', 'ES2026', 'Design Systems'],
    },
    {
        title: 'Application<br/>Delivery',
        description: 'Shipping resilient features continuously through automated release pipelines, strict frontend performance budgets, and comprehensive technical docs.',
        items: ['CI/CD Pipelines', 'Performance Budgets', 'Technical Writing'],
    },
]

export const about = {
    intro: `I'm <span class="accent-light">Thomas</span>, a technology consultant from Singapore.`,
    body: `I've spent the last decade building software for startups, scale-ups, and established enterprises across the region, from early-stage products that needed to ship fast to large systems that needed to run reliably for years. Along the way I've worked across the full stack: designing APIs, building cloud-native platforms, and untangling legacy codebases that teams had learned to fear. What keeps me interested is the point where a business problem meets an engineering decision, and I care as much about whether a system solves the right problem as about whether it's built well.
    <div class="mt-8">Today, I work with founders and technology leaders as both a hands-on developer and an advisor. Some engagements start with a architecture review or a technical roadmap, and others have me embedded in a team writing code alongside them. I favour simple, maintainable solutions over clever ones, and I'm direct about trade-offs so that decisions about cost, speed, and risk are made with clear eyes. If you're building something new, modernising something old, or just need a second opinion from someone who has seen a lot of projects succeed and fail, I'd love to hear from you.</div>`,
    principles: [
        {
            title: 'Think clearly. Code cleanly.',
            text: 'Code is read far more often than it is written. Clear naming and simple structure keeps a codebase easy to maintain in the long run.',
        },
        {
            title: 'Embrace boring. Scale on solid ground.',
            text: 'Proven tools and well-understood patterns let teams spend their effort on the product, not on debugging the stack.',
        },
        {
            title: 'Ship small. Ship fast.',
            text: 'Small changes are easier to review, easier to revert, and arrive sooner.',
        },
    ],
    experience: [
        { years: '2017 — Now', role: 'Technology Consultant', context: 'Pacific Consulting Group' },
        { years: '2015 — 2016', role: 'Software Engineer', context: 'Accenture' },
    ],
    toolkit: [
        { group: 'Languages', items: ['Markdown', 'JS/TS', 'SQL', 'Java', 'Python'] },
        { group: 'Frontend', items: ['Vuetify', 'Tailwind', 'Material Design', 'd3'] },
        { group: 'Backend', items: ['Node', 'MySQL', 'Redis', 'pm2'] },
        { group: 'Process', items: ['Agile', 'CI/CD', 'Prompt Engineering'] },
    ],
}

export const colophon = `designed and reviewed by me. coded by claude agents. <div>typeset with <span class="accent">Caveat</span>, 
<span class="accent">JetBrains Mono</span> & <span class="accent">Montserrat</span></div>`

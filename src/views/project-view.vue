<script setup lang="ts">
    /**
     * Case study for /work/:slug. The slug is watched, so "Next project" swaps the
     * content in place; an unknown slug (reached by in-app navigation, where the
     * route guard does not run) renders the 404 view.
     */
    import { computed, defineAsyncComponent, onBeforeUnmount, ref, watch } from 'vue'
    import { useRoute } from 'vue-router'
    import ArrowIcon from '@/components/arrow-icon.vue'
    import CaseSection from '@/components/pages/case-section.vue'
    import Emphasis from '@/components/pages/emphasis.vue'
    import PageHeader from '@/components/pages/page-header.vue'
    import ProjectGlyph from '@/components/project-glyph.vue'
    import { projects } from '@/data/content'
    import NotFoundView from './not-found-view.vue'

    const route = useRoute()

    // Only follow the route while it is still a case study: the outgoing page
    // keeps its content while it fades out towards /work or the home page.
    const slug = ref(String(route.params.slug ?? ''))
    watch(
        () => (route.name === 'project' ? route.params.slug : undefined),
        next => {
            if (typeof next === 'string') slug.value = next
        },
    )

    const position = computed(() => projects.findIndex(p => p.slug === slug.value))
    const project = computed(() => projects[position.value])
    const next = computed(() => projects[(position.value + 1) % projects.length])

    const pad = (n: number) => String(n).padStart(2, '0')

    // A project can ship a live demo as components/projects/<slug>.vue. Each one is
    // its own lazy chunk, so the demo's code is only fetched on its case study.
    const demos = import.meta.glob('../components/projects/*.vue')
    const demo = computed(() => {
        const load = demos[`../components/projects/${slug.value}.vue`]
        return load ? defineAsyncComponent(load as () => Promise<{ default: object }>) : null
    })

    // The figure is 21:9 on desktop and 4:3 on phones; the glyph is drawn on a
    // matching sheet so it fills the plate either way.
    const phone = window.matchMedia('(max-width: 759.98px)')
    const narrow = ref(phone.matches)
    const onViewport = (e: MediaQueryListEvent) => { narrow.value = e.matches }
    phone.addEventListener('change', onViewport)
    onBeforeUnmount(() => phone.removeEventListener('change', onViewport))

    watch(
        project,
        p => {
            document.title = `${p ? p.title : 'Page not found'} by Thomas Lim`
        },
        { immediate: true },
    )
</script>

<template>
    <NotFoundView v-if="!project" />

    <article v-else class="case">
        <PageHeader class="case__header">
            <template #label>
                <RouterLink class="case__back link-u" to="/work">
                    <ArrowIcon dir="left" /> All work
                </RouterLink>
            </template>
            <template #meta>Case study</template>

            <span v-text="project.title"></span>

            <template #lead>
                <p class="t-lead">
                    <Emphasis :text="project.summary" />
                </p>
            </template>
        </PageHeader>

        <div class="wrap">
            <dl v-reveal class="meta grid-12">
                <div class="meta__cell">
                    <dt class="t-label">Year</dt>
                    <dd v-text="project.year"></dd>
                </div>
                <div class="meta__cell">
                    <dt class="t-label">Role</dt>
                    <dd v-text="project.role"></dd>
                </div>
                <div class="meta__cell">
                    <dt class="t-label">Type</dt>
                    <dd v-text="project.kind"></dd>
                </div>
                <div class="meta__cell">
                    <dt class="t-label">Stack</dt>
                    <dd>
                        <ul class="meta__stack">
                            <li v-for="item in project.stack" :key="item" v-text="item"></li>
                        </ul>
                    </dd>
                </div>
            </dl>
        </div>

        <div class="wrap">
            <!-- The live demo components/projects/<slug>.vue when there is one, else the glyph. -->
            <figure v-reveal class="figure">
                <div class="figure__plate" :class="{ 'figure__plate--live': demo }">
                    <component :is="demo" v-if="demo" :key="project.slug" />
                    <ProjectGlyph v-else :kind="project.glyph" :ratio="narrow ? 'tall' : 'wide'" :seed="project.slug" />
                </div>
                <figcaption class="figure__caption t-label" v-text="project.slug"></figcaption>
            </figure>
        </div>

        <div class="wrap case__body">
            <CaseSection class="case__sec--problem" label="The problem">
                <p class="case__problem">
                    <Emphasis :text="project.problem" />
                </p>
            </CaseSection>

            <CaseSection label="Approach">
                <ol class="steps">
                    <li v-for="(step, i) in project.approach" :key="step" v-reveal="i * 90" class="step">
                        <span class="step__idx t-label" v-text="pad(i + 1)"></span>
                        <p class="step__text">
                            <Emphasis :text="step" />
                        </p>
                    </li>
                </ol>
            </CaseSection>

            <CaseSection class="case__sec--outcome" label="Outcome">
                <blockquote class="pull">
                    <Emphasis :text="project.outcome" />
                </blockquote>
            </CaseSection>
        </div>

        <nav v-if="next" aria-label="Next project" class="wrap next">
            <RouterLink v-reveal class="next__link grid-12" :to="`/work/${next.slug}`">
                <span class="next__label t-label">Next project</span>
                <span class="next__main">
                    <span class="next__title t-h2" v-text="next.title"></span>
                    <span class="next__kind t-label">
                        <span v-text="next.kind"></span> · <span v-text="next.year"></span>
                    </span>
                </span>
                <span class="next__arrow">
                    <ArrowIcon dir="right" />
                </span>
            </RouterLink>
        </nav>
    </article>
</template>

<style scoped>

    /* The header hands over to the meta strip with a short gap. */
    .case__header {
        --ph-pb: clamp(40px, 5vw, 64px);
    }

    /* Back link in the header label row */
    .case__back {
        display: inline-flex;
        align-items: baseline;
        gap: 0.6em;
    }

    /* --------------------------------------------------------------- meta strip
   Four cells on the 12-col grid (cols 1, 4, 7, 10). Vertical hairlines sit in
   the gutters. */
    .meta {
        --gap: clamp(16px, 2vw, 32px);
        margin: 0;
        border-block: 1px solid var(--line);
    }

    .meta__cell {
        position: relative;
        grid-column: span 3;
        padding-block: 20px 22px;
    }

    .meta__cell+.meta__cell::before {
        content: '';
        position: absolute;
        inset: 0 auto 0 calc(var(--gap) / -2);
        width: 1px;
        background: var(--line);
    }

    .meta__cell dt {
        margin-bottom: 8px;
    }

    .meta__cell dd {
        margin: 0;
        font-size: 0.95rem;
        line-height: 1.5;
    }

    /* Same size, weight and colour as the Year, Role and Type values beside it. */
    .meta__stack {
        margin: 0;
        padding: 0;
        list-style: none;
    }

    /* Mobile: a spec table, label in the first column, value across the rest. */
    @media (max-width: 759.98px) {
        .meta__cell {
            grid-column: 1 / -1;
            display: grid;
            grid-template-columns: subgrid;
            align-items: baseline;
            padding-block: 16px;
        }

        .meta__cell+.meta__cell {
            border-top: 1px solid var(--line);
        }

        .meta__cell+.meta__cell::before {
            display: none;
        }

        .meta__cell dt {
            grid-column: 1;
            margin: 0;
        }

        .meta__cell dd {
            grid-column: 2 / -1;
        }
    }

    /* --------------------------------------------------------------- figure
   One outer frame. The glyph is drawn on a sheet of the same ratio and fills it. */
    .figure {
        margin-top: clamp(24px, 3vw, 40px);
    }

    .figure__plate {
        position: relative;
        aspect-ratio: 21 / 9;
        overflow: hidden;
        background: var(--bg-raise);
        border: 1px solid var(--line-strong);
    }

    .figure__plate> :deep(.glyph) {
        position: absolute;
        inset: 0;
    }

    /* A live demo sets its own height; the frame only gives it a floor. */
    .figure__plate--live {
        aspect-ratio: auto;
        min-height: clamp(360px, 50vw, 640px);
    }

    .figure__caption {
        margin-top: 14px;
    }

    @media (max-width: 759.98px) {
        .figure__plate:not(.figure__plate--live) {
            aspect-ratio: 4 / 3;
        }
    }

    /* ----------------------------------------------------------------- body
   Labels in cols 1-3, text from col 4. Each section tells its label where the
   body's capitals start (--cap) so the two share a cap line. */
    .case__body {
        margin-top: clamp(40px, 5vw, 72px);
    }

    .case__sec--problem {
        --cap: calc(clamp(1.2rem, 1.9vw, 1.6rem) * 0.4085);
    }

    .case__sec--outcome {
        --cap: calc(clamp(1.9rem, 3.6vw, 3.25rem) * 0.18);
    }

    .case__problem {
        --em-size: 1.1em;
        max-width: 36ch;
        font-size: clamp(1.2rem, 1.9vw, 1.6rem);
        font-weight: 300;
        line-height: 1.5;
    }

    .steps {
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .step {
        display: grid;
        grid-template-columns: clamp(40px, 5vw, 56px) minmax(0, 1fr);
        align-items: start;
        padding-block: 20px;
        border-top: 1px solid var(--line);
    }

    .step:first-child {
        padding-top: 0;
        border-top: 0;
    }

    .step:last-child {
        padding-bottom: 0;
    }

    /* Index capitals level with the text's: .4835em - .274rem at 1.05rem. */
    .step__idx {
        margin-top: 0.234rem;
        color: var(--fg-muted);
        transition: color 0.3s var(--ease);
    }

    .step:hover .step__idx {
        color: var(--accent);
    }

    .step__text {
        max-width: 56ch;
        color: var(--fg-muted);
        font-size: 1.05rem;
        line-height: 1.65;
    }

    /* The outcome is set large, as a pull-quote. */
    .pull {
        --em-size: 1em;
        margin: 0;
        font-family: var(--font-serif);
        font-size: clamp(1.9rem, 3.6vw, 3.25rem);
        line-height: 1.12;
        letter-spacing: -0.01em;
        text-wrap: balance;
    }

    /* ------------------------------------------------------------ next project
   Same columns as the body: label in 1-3, title from col 4, arrow at the end. */
    /* No padding of its own: the row's bottom padding runs straight into the footer hairline. */
    .next__link {
        --title: clamp(2.5rem, 7vw, 6.25rem);
        position: relative;
        isolation: isolate;
        align-items: start;
        padding-block: clamp(28px, 3.4vw, 44px) clamp(28px, 3.4vw, 44px);
        border-top: 1px solid var(--line-strong);
    }

    .next__link::before {
        content: '';
        position: absolute;
        inset: 0 -16px;
        z-index: -1;
        background: var(--bg-raise);
        opacity: 0;
        transition: opacity 0.3s var(--ease);
    }

    .next__link:hover::before,
    .next__link:focus-visible::before {
        opacity: 1;
    }

    /* Title cap top: .11em below the line box at line-height .98 (Instrument Serif). */
    .next__label {
        grid-column: 1 / span 3;
        margin-top: calc(var(--title) * 0.11 - 0.274rem);
        color: var(--fg);
    }

    .next__main {
        grid-column: 4 / span 8;
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-width: 0;
        transition: transform 0.4s var(--ease);
    }

    .next__title {
        display: block;
        font-size: var(--title);
        line-height: 0.98;
    }

    .next__kind {
        color: var(--fg-muted);
    }

    /* The arrow is centred on the title's capitals. */
    .next__arrow {
        --size: clamp(1.5rem, 3vw, 2.5rem);
        grid-column: 12;
        justify-self: end;
        margin-top: calc(var(--title) * 0.47 - var(--size) / 2);
        font-size: var(--size);
        line-height: 1;
        transition: transform 0.4s var(--ease);
    }

    .next__link:hover .next__main,
    .next__link:focus-visible .next__main,
    .next__link:hover .next__arrow,
    .next__link:focus-visible .next__arrow {
        transform: translateX(8px);
    }

    @media (max-width: 759.98px) {
        .next__label {
            grid-column: 1 / -1;
            margin: 0 0 20px;
        }

        .next__main {
            grid-column: 1 / span 3;
        }

        .next__arrow {
            grid-column: 4;
        }
    }
</style>

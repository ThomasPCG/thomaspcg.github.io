<script setup lang="ts">
    /**
     * Lead story of the selected-work section: one project set like a magazine
     * feature. A large schematic plate in cols 1-7 (16:10, hairline, caption);
     * big serif title, summary, meta and the call to action in cols 8-12.
     * The whole block is one link. On hover the text stays put, so the columns
     * keep their alignment: the plate's hairline brightens, the title gets an
     * underline and the call to action turns from muted to full and underlines.
     */
    import type { Project } from '@/data/content'
    import ArrowIcon from '@/components/arrow-icon.vue'
    import ProjectGlyph from '@/components/project-glyph.vue'

    defineProps<{ project: Project }>()
</script>

<template>
    <RouterLink v-reveal class="lead grid-12" :to="`/work/${project.slug}`">
        <figure class="lead__fig">
            <div class="lead__plate">
                <ProjectGlyph class="lead__glyph" :kind="project.glyph" :seed="project.slug" />
            </div>
            <figcaption class="lead__caption t-label" v-text="project.slug"></figcaption>
        </figure>

        <div class="lead__text">
            <div class="lead__top">
                <h3 class="lead__title" v-text="project.title"></h3>
                <p class="lead__summary t-lead" v-text="project.summary"></p>
            </div>

            <div class="lead__bottom">
                <dl class="lead__meta">
                    <div>
                        <dt class="t-label">Year</dt>
                        <dd v-text="project.year"></dd>
                    </div>
                    <div>
                        <dt class="t-label">Role</dt>
                        <dd v-text="project.role"></dd>
                    </div>
                    <div>
                        <dt class="t-label">Type</dt>
                        <dd v-text="project.kind"></dd>
                    </div>
                </dl>

                <span class="lead__cta link-u t-label">
                    Read case study
                    <ArrowIcon class="lead__arrow" dir="right" />
                </span>
            </div>
        </div>
    </RouterLink>
</template>

<style scoped>
    .lead {
        align-items: stretch;
        row-gap: 32px;
    }

    .lead:focus-visible {
        outline-offset: 10px;
    }

    /* ---------------------------------------------------------------- figure */
    .lead__fig {
        grid-column: 1 / span 7;
        display: flex;
        flex-direction: column;
        margin: 0;
    }

    .lead__plate {
        aspect-ratio: 16 / 10;
        padding: clamp(12px, 2vw, 28px);
        background: var(--bg-raise);
        border: 1px solid var(--line-strong);
        transition: border-color 0.4s var(--ease);
    }

    .lead__glyph {
        display: block;
        width: 100%;
        height: 100%;
    }

    /* Lift the drawing out of its half-tone at this size; the accent element,
   masks and faint guides keep their own values. */
    .lead__glyph :deep(:is(path, rect, circle):not(.hot, .faint, .mask, .hot-fill, .hot-solid)) {
        opacity: 0.8;
    }

    .lead__caption {
        margin-top: 14px;
    }

    /* ------------------------------------------------------------------ text */
    .lead__text {
        grid-column: 8 / -1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: clamp(40px, 5vw, 72px);
        padding-left: clamp(0px, 1.6vw, 28px);
    }

    .lead__title {
        margin: 0;
        font-family: var(--font-serif);
        font-size: clamp(2.75rem, 5.2vw, 5rem);
        font-weight: 400;
        line-height: 0.96;
        letter-spacing: -0.02em;
        text-wrap: balance;
        text-decoration: underline;
        text-decoration-color: transparent;
        text-decoration-thickness: 0.035em;
        text-underline-offset: 0.12em;
        transition: text-decoration-color 0.4s var(--ease);
    }

    .lead__summary {
        max-width: 32ch;
        margin: clamp(20px, 2vw, 28px) 0 0;
    }

    /* ------------------------------------------------------------------ meta */
    .lead__meta {
        margin: 0;
    }

    .lead__meta>div {
        display: grid;
        grid-template-columns: 5.5rem minmax(0, 1fr);
        align-items: baseline;
        gap: 16px;
        padding-block: 11px;
        border-top: 1px solid var(--line);
    }

    .lead__meta dt {
        margin: 0;
    }

    .lead__meta dd {
        margin: 0;
        font-size: 0.9375rem;
        color: var(--fg);
    }

    .lead__cta {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        margin-top: 24px;
        color: var(--fg-muted);
        transition:
            color 0.3s var(--ease),
            background-size 0.4s var(--ease);
    }

    .lead__arrow {
        transition: transform 0.4s var(--ease);
    }

    /* ----------------------------------------------------------------- hover */
    .lead:is(:hover, :focus-visible) .lead__plate {
        border-color: var(--fg);
    }

    .lead:is(:hover, :focus-visible) .lead__title {
        text-decoration-color: var(--fg);
    }

    .lead:is(:hover, :focus-visible) .lead__cta {
        background-size: 100% 1px;
        color: var(--fg);
    }

    .lead:is(:hover, :focus-visible) .lead__arrow {
        transform: translateX(4px);
    }

    /* ---------------------------------------------------------------- mobile */
    @media (max-width: 759.98px) {
        .lead {
            row-gap: 28px;
        }

        .lead__fig,
        .lead__text {
            grid-column: 1 / -1;
        }

        .lead__text {
            padding-left: 0;
            gap: 32px;
        }

        .lead__summary {
            max-width: 44ch;
        }
    }
</style>

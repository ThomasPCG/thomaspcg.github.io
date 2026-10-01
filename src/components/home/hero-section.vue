<script setup lang="ts">
    /**
     * Editorial front page, first screen.
     *
     * Composition: a meta strip and hairline on top, the headline set on the
     * 12-column grid (cols 1-9), and the dataflow lattice confined to a plate in
     * cols 8-12 between the meta rule and the foot rule. The plate clips hard at
     * its box and fades out over its left third, so nothing passes behind the
     * headline letters. Four corner crosshairs register it on the grid and the
     * caption hangs below it on clean ground. On mobile the plate becomes a
     * quiet backdrop behind the text, clipped to the hero.
     */
    import ArrowIcon from '@/components/arrow-icon.vue'
    import SystemCanvas from '@/components/system-canvas.vue'
    import { heroLead, site } from '@/data/content'
</script>

<template>
    <section aria-labelledby="hero-title" class="hero">
        <div class="wrap hero__inner">
            <div class="hero__meta grid-12 t-label">
                <div class="hero__meta-a d-flex flex-row ga-2">
                    <span v-text="site.role"></span> ·
                    <span v-text="site.location"></span> ·
                    <span v-text="site.coords"></span>
                </div>
                <div class="hero__meta-c">
                    Employee at
                    <a class="hero__ext link-u" :href="site.company" rel="noopener" target="_blank">
                        Pacific Consulting Group
                        <ArrowIcon dir="up-right" />
                    </a>
                </div>
            </div>

            <div class="hero__main grid-12">
                <h1 id="hero-title" class="hero__title t-display" v-html="site.title"></h1>

                <figure class="hero__fig">
                    <div aria-hidden="true" class="hero__plate">
                        <div class="hero__clip">
                            <div class="hero__canvas-in">
                                <SystemCanvas />
                            </div>
                        </div>
                    </div>
                </figure>
            </div>

            <div class="hero__foot grid-12">
                <p v-reveal class="hero__lead t-lead" v-html="heroLead"></p>

                <div v-reveal="120" class="hero__actions">
                    <v-btn class="hero__btn" to="/#work" variant="outlined">
                        Selected work
                        <ArrowIcon class="hero__btn-arrow" dir="down" />
                    </v-btn>
                    <RouterLink class="hero__about link-u t-label" to="/about">
                        About me
                        <ArrowIcon dir="right" />
                    </RouterLink>
                </div>

                <p v-reveal="240" class="hero__avail t-label">
                    <span aria-hidden="true" class="hero__dot" />
                    <span v-text="site.availability"></span>
                </p>
            </div>
        </div>
    </section>
</template>

<style scoped>
    .hero {
        /* Same gap as .grid-12, so the calc() below lands on real column lines. */
        --g: clamp(16px, 2vw, 32px);
        --inner: min(100%, var(--maxw));
        position: relative;
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        min-height: 100svh;
        padding-top: var(--header-h);
        overflow: hidden;
        overflow: clip;
    }

    .hero__inner {
        position: relative;
        z-index: 1;
        display: flex;
        flex: 1 0 auto;
        flex-direction: column;
    }

    /* ------------------------------------------------------------- meta strip */
    .hero__meta {
        position: relative;
        padding-block: 20px;
        animation: fade-in 1.2s var(--ease) 0.1s both;
    }

    .hero__meta p {
        margin: 0;
    }

    .hero__meta-a {
        grid-column: 1 / span 5;
        color: var(--fg);
    }

    .hero__meta-b {
        /* Shares its left edge with the lattice plate. */
        grid-column: 6 / span 3;
        white-space: nowrap;
    }

    .hero__meta-c {
        grid-column: 11 / -1;
        justify-self: end;
        white-space: nowrap;
        text-align: right;
        color: var(--fg-muted);
    }

    /* Always underlined (link-u only draws on hover) plus the up-right arrow,
       so it reads as an external link at rest. */
    .hero__ext {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: var(--fg);
        background-size: 100% 1px;
        transition: background-size 0.4s var(--ease), color 0.3s var(--ease);
    }

    /* The rule draws in from the left, like the section heads further down. */
    .hero__meta::after {
        content: '';
        position: absolute;
        inset: auto 0 0;
        height: 1px;
        background: var(--line-strong);
        transform-origin: 0 50%;
        animation: rule-in 1.4s var(--ease) 0.2s both;
    }

    /* ------------------------------------------------------------- headline */
    .hero__main {
        flex: 1 0 auto;
        padding-top: clamp(24px, 3vw, 28px);
        padding-bottom: clamp(32px, 4.5vw, 64px);
    }

    .hero__title {
        position: relative;
        z-index: 1;
        grid-column: 1 / span 9;
        grid-row: 1;
        align-self: end;
        /* Bigger than the global display size, capped by viewport height so the
     foot row stays on the first screen of short windows. */
        font-size: clamp(3.25rem, min(11.5vw, 18svh), 9.5rem);
        line-height: 0.88;
    }

    /* Each line is a clipping window; the text rises into it. The padding gives
   ascenders, descenders and italic overhang room inside the clip. */
    /* The title is injected with v-html, so its elements never receive the
   scoped data-v attribute. :deep() keeps the selectors from requiring it. */
    .hero__title :deep(.line) {
        display: block;
        padding: 0.14em 0.12em 0.16em 0;
        margin: -0.14em -0.12em -0.16em 0;
        overflow: hidden;
    }

    .hero__title :deep(.line__in) {
        --i: 0;
        display: block;
        animation: rise 1.2s var(--ease) calc(0.25s + var(--i) * 0.13s) both;
    }

    /* The markup carries no per-line index, so stagger by position. */
    .hero__title :deep(.line__in:nth-child(2)) {
        --i: 1;
    }

    .hero__title :deep(.line__in:nth-child(3)) {
        --i: 2;
    }

    .hero__title :deep(.accent) {
        /* The one place the accent lands in the headline. */
        display: inline-block;
    }

    /* ---------------------------------------------------------------- figure */
    .hero__fig {
        grid-column: 8 / -1;
        grid-row: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        margin: 0;
        pointer-events: none;
    }

    /* The plate: no frame rectangle, only registration crosshairs on its corners.
   The clip layer is the hard boundary for the canvas and fades out to the left
   so the lattice never runs behind the headline. */
    .hero__plate {
        position: relative;
        flex: 1;
        min-height: 160px;
    }

    .hero__clip {
        position: absolute;
        inset: 0;
        overflow: hidden;
        overflow: clip;
        -webkit-mask-image: linear-gradient(90deg,
                transparent 0%,
                transparent 14%,
                rgba(0, 0, 0, 0.55) 28%,
                #000 42%);
        mask-image: linear-gradient(90deg,
                transparent 0%,
                transparent 14%,
                rgba(0, 0, 0, 0.55) 28%,
                #000 42%);
    }

    .hero__canvas-in {
        position: absolute;
        inset: 0;
        opacity: var(--canvas-o, 1);
        animation: canvas-in 2.2s var(--ease) 0.3s both;
    }

    .tick {
        position: absolute;
        width: 17px;
        height: 17px;
        background:
            linear-gradient(var(--line-strong), var(--line-strong)) 50% 0 / 1px 100% no-repeat,
            linear-gradient(var(--line-strong), var(--line-strong)) 0 50% / 100% 1px no-repeat;
        animation: fade-in 1.6s var(--ease) 1s both;
    }

    /* 17px marks with the crosshair on the middle pixel, which lands on the plate's corner. */
    .tick--tl {
        top: -8px;
        left: -8px;
    }

    .tick--tr {
        top: -8px;
        right: -8px;
    }

    .tick--bl {
        bottom: -8px;
        left: -8px;
    }

    .tick--br {
        right: -8px;
        bottom: -8px;
    }

    /* Hangs below the plate's bottom-left corner, sharing its left edge. */
    .hero__caption {
        margin-top: 20px;
        color: var(--fg-muted);
        animation: fade-in 1.2s var(--ease) 1.1s both;
    }

    .hero__caption-n {
        color: var(--fg);
    }

    /* ------------------------------------------------------------------ foot */
    .hero__foot {
        align-items: start;
        padding-block: clamp(28px, 3vw, 40px) clamp(32px, 4vw, 56px);
        border-top: 1px solid var(--line);
    }

    .hero__lead {
        grid-column: 1 / span 5;
        max-width: 46ch;
        margin: 0;
    }

    .hero__actions {
        grid-column: 6 / span 4;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 16px 28px;
    }

    .hero__btn-arrow {
        margin-left: 14px;
        transition: transform 0.4s var(--ease);
    }

    .hero__btn:is(:hover, :focus-visible) .hero__btn-arrow {
        transform: translateY(3px);
    }

    .hero__about {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding-bottom: 0.3em;
        transition: color 0.3s var(--ease);
    }

    .hero__about:is(:hover, :focus-visible) {
        color: var(--fg);
    }

    .hero__avail {
        grid-column: 10 / -1;
        justify-self: end;
        display: flex;
        align-items: center;
        gap: 12px;
        min-height: 48px;
        margin: 0;
        text-align: right;
    }

    .hero__dot {
        position: relative;
        flex: none;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--accent);
    }

    .hero__dot::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: var(--accent);
        animation: ping 3.2s var(--ease) infinite;
    }

    /* --------------------------------------------------------------- motion */
    @keyframes rise {
        from {
            transform: translateY(125%);
        }

        to {
            transform: none;
        }
    }

    @keyframes fade-in {
        from {
            opacity: 0;
        }
    }

    @keyframes rule-in {
        from {
            transform: scaleX(0);
        }
    }

    @keyframes canvas-in {
        from {
            opacity: 0;
        }
    }

    @keyframes ping {
        0% {
            opacity: 0.55;
            transform: scale(1);
        }

        70%,
        100% {
            opacity: 0;
            transform: scale(3.4);
        }
    }

    @media (prefers-reduced-motion: reduce) {

        .hero__canvas-in,
        .hero__meta,
        .hero__meta::after,
        .hero__title :deep(.line__in),
        .tick,
        .hero__caption {
            animation: none;
        }

        .hero__dot::after {
            display: none;
        }
    }

    /* ---------------------------------------------------------------- tablet */
    @media (max-width: 1099.98px) {
        .hero__meta-c {
            display: none;
        }
    }

    @media (max-width: 999.98px) {
        .hero__lead {
            grid-column: 1 / span 8;
        }

        .hero__actions {
            grid-column: 1 / span 7;
            grid-row: 2;
            margin-top: 32px;
        }

        .hero__avail {
            grid-column: 8 / -1;
            grid-row: 2;
            margin-top: 32px;
        }
    }

    /* ---------------------------------------------------------------- mobile
   The plate becomes a backdrop behind the type: clipped to the hero, masked to
   a soft ellipse around the headline, and held at a quiet but perceptible
   strength. The crosshairs are dropped, the caption stays. */
    @media (max-width: 759.98px) {
        .hero__plate {
            position: absolute;
            z-index: -1;
            inset: 0;
            min-height: 0;
        }

        .hero__clip {
            -webkit-mask-image: radial-gradient(ellipse 95% 34% at 60% 32%,
                    #000 0%,
                    #000 30%,
                    rgba(0, 0, 0, 0.55) 65%,
                    transparent 100%);
            mask-image: radial-gradient(ellipse 95% 34% at 60% 32%,
                    #000 0%,
                    #000 30%,
                    rgba(0, 0, 0, 0.55) 65%,
                    transparent 100%);
        }

        .hero__canvas-in {
            --canvas-o: 0.85;
        }

        .tick {
            display: none;
        }

        .hero__meta {
            padding-block: 16px;
            row-gap: 2px;
        }

        .hero__meta-a,
        .hero__meta-b {
            grid-column: 1 / -1;
        }

        .hero__meta-c {
            display: none;
        }

        .hero__main {
            align-content: end;
            padding-bottom: 32px;
        }

        .hero__title {
            grid-column: 1 / -1;
            font-size: clamp(3rem, 16vw, 6.5rem);
        }

        .hero__fig {
            grid-column: 1 / -1;
            grid-row: 2;
            margin-top: 28px;
        }

        .hero__caption {
            margin-top: 0;
        }

        .hero__lead,
        .hero__actions,
        .hero__avail {
            grid-column: 1 / -1;
            grid-row: auto;
        }

        .hero__actions,
        .hero__avail {
            margin-top: 28px;
        }

        .hero__avail {
            justify-self: start;
            min-height: 0;
            text-align: left;
        }
    }
</style>

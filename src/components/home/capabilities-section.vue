<script setup lang="ts">
    /**
     * Four capabilities on the 12-column grid (3 cols each on desktop, 6 on
     * tablet, full width on mobile). Cards are subgrids of three shared rows
     * (title, description, items), so titles, descriptions and lists line up
     * across columns no matter how the text wraps.
     */
    import SectionHead from '@/components/section-head.vue'
    import { capabilities } from '@/data/content'
</script>

<template>
    <section class="caps">
        <!-- The anchor starts a little above the rule, so `/#capabilities` leaves air under the header. -->
        <div id="capabilities" class="wrap caps__anchor">
            <SectionHead title="Skills">
                My <span class="accent">Skills</span>
            </SectionHead>

            <ul class="caps__grid grid-12">
                <li v-for="(cap, i) in capabilities" :key="cap.title" v-reveal="i * 100" class="cap">
                    <h3 class="cap__title t-h3" v-html="cap.title"></h3>
                    <p class="cap__desc" v-text="cap.description"></p>
                    <ul class="cap__items t-mono">
                        <li v-for="item in cap.items" :key="item" v-text="item"></li>
                    </ul>
                </li>
            </ul>
        </div>
    </section>
</template>

<style scoped>
    .caps {
        /* The work section above supplies the top spacing; the footer adds its own after this. */
        padding-bottom: clamp(72px, 10vw, 140px);
    }

    .caps__anchor {
        padding-top: 28px;
        margin-top: -28px;
    }

    .caps__grid {
        margin: 0;
        padding: 0;
        list-style: none;
        /* Vertical rhythm comes from each card's padding so subgrid rows stay tight. */
        row-gap: 0;
    }

    /* ------------------------------------------------------------------ card
   The head above draws the only rule, so the columns start bare. On tablet the
   second pair and on mobile every card after the first get their own hairline. */
    .cap {
        grid-column: span 4;
        grid-row: span 3;
        display: grid;
        grid-template-rows: subgrid;
        row-gap: 0;
    }

    /* Space between card rows lives on the cards, not the grid's row-gap, which the
       subgrid would pass down and stretch the title/description/list spacing. */
    .cap:nth-child(-n + 3) {
        padding-bottom: clamp(56px, 7vw, 96px);
    }

    .cap__title {
        margin: 0;
    }

    .cap__desc {
        margin: 16px 0 0;
        max-width: 38ch;
        font-size: 0.9375rem;
        line-height: 1.6;
        color: var(--fg-muted);
    }

    .cap__items {
        margin: 28px 0 0;
        padding: 0;
        list-style: none;
        color: var(--fg-muted);
        align-self: start;
    }

    .cap__items li {
        padding-block: 9px;
        border-top: 1px solid var(--line);
        transition:
            color 0.3s var(--ease),
            border-color 0.3s var(--ease);
    }

    .cap:hover .cap__items li {
        color: var(--fg);
        border-top-color: var(--line-strong);
    }

    @media (max-width: 1099.98px) {
        .cap {
            grid-column: span 6;
        }

        .cap:nth-child(-n + 3) {
            padding-bottom: 0;
        }

        .cap:nth-child(-n + 2) {
            padding-bottom: clamp(48px, 7vw, 72px);
        }

        .cap:nth-child(n + 3) {
            padding-top: clamp(32px, 5vw, 44px);
            border-top: 1px solid var(--line-strong);
        }
    }

    /* Mobile: one column of plain blocks, no shared rows and no dead space between them. */
    @media (max-width: 759.98px) {

        /* :nth-child(n) matches the specificity of the row-spacing rules above. */
        .cap:nth-child(n) {
            grid-column: span 4;
            grid-row: auto;
            display: block;
            padding-block: 28px;
            border-top: 1px solid var(--line-strong);
        }

        .cap:first-child {
            padding-top: 0;
            border-top: 0;
        }

        .cap:last-child {
            padding-bottom: 0;
        }

        .cap__items {
            margin-top: 20px;
        }

        .cap__items li {
            padding-block: 8px;
        }
    }
</style>

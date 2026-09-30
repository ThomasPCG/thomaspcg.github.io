<script setup lang="ts">
    /** About: intro, principles, experience and toolkit, in the same rhythm as the front page. */
    import ArrowIcon from '@/components/ArrowIcon.vue'
    import Emphasis from '@/components/pages/Emphasis.vue'
    import PageHeader from '@/components/pages/PageHeader.vue'
    import RuleRow from '@/components/pages/RuleRow.vue'
    import SectionHead from '@/components/SectionHead.vue'
    import { about, site } from '@/data/content'

    const pad = (n: number) => String(n).padStart(2, '0')
</script>

<template>
    <div class="about">
        <PageHeader label="About" :meta="site.location">
            {{ site.name }}
            <template #lead>
                <p class="t-lead">
                    <Emphasis :text="about.intro" />
                </p>
                <p class="about__body t-lead">
                    <Emphasis :text="about.body" />
                </p>
            </template>
            <template #aside>
                <dl class="facts">
                    <div class="facts__row">
                        <dt class="t-label">Role</dt>
                        <dd>{{ site.role }}</dd>
                    </div>
                    <div class="facts__row">
                        <dt class="t-label">Based in</dt>
                        <dd>{{ site.location }}</dd>
                    </div>
                    <div class="facts__row">
                        <dt class="t-label">Status</dt>
                        <dd><span class="facts__dot" aria-hidden="true" />{{ site.availability }}</dd>
                    </div>
                    <div class="facts__row">
                        <dt class="t-label">Elsewhere</dt>
                        <dd>
                            <div class="d-flex ga-2 flex-column">
                                <a class="link-u" :href="site.github" rel="noopener" target="_blank">GitHub
                                    <ArrowIcon dir="up-right" />
                                </a>
                                <a class="link-u" :href="site.company" rel="noopener" target="_blank">PCG
                                    <ArrowIcon dir="up-right" />
                                </a>
                            </div>
                        </dd>
                    </div>
                </dl>
            </template>
        </PageHeader>

        <section class="wrap about__section">
            <SectionHead index="01" title="Principles" meta="How I work" />
            <ol class="table">
                <RuleRow v-for="(item, i) in about.principles" :key="item.title">
                    <template #a>
                        <div v-text="pad(i + 1)"></div>
                    </template>
                    <template #b>
                        <h3 class="t-h3" v-text="item.title"></h3>
                    </template>
                    <template #c>
                        <div v-text="item.text"></div>
                    </template>
                </RuleRow>
            </ol>
        </section>

        <section class="wrap about__section">
            <SectionHead index="02" title="Experience" meta="Most recent first" />
            <ol class="table">
                <RuleRow v-for="job in about.experience" :key="job.years">
                    <template #a>{{ job.years }}</template>
                    <template #b>
                        <h3 class="t-h3">{{ job.role }}</h3>
                    </template>
                    <template #c>{{ job.context }}</template>
                </RuleRow>
            </ol>
        </section>

        <section class="wrap about__section about__section--last">
            <SectionHead index="03" title="Toolkit" meta="Day to day" />
            <ul class="toolkit">
                <li v-for="(group, i) in about.toolkit" :key="group.group" v-reveal="i * 90"
                    class="toolkit__row grid-12">
                    <h3 class="toolkit__name t-label">{{ group.group }}</h3>
                    <ul class="toolkit__items t-mono">
                        <li v-for="item in group.items" :key="item">{{ item }}</li>
                    </ul>
                </li>
            </ul>
        </section>
    </div>
</template>

<style scoped>

    /* The second paragraph is set exactly like the lead: same size, weight and
   measure, one column. */
    .about__body {
        margin-top: 1em;
    }

    /* --------------------------------------------------------- facts (aside) */
    .facts {
        margin: 0;
        border-top: 1px solid var(--line);
    }

    .facts__row {
        display: grid;
        grid-template-columns: 1fr;
        gap: 4px;
        padding-block: 12px 14px;
        border-bottom: 1px solid var(--line);
    }

    .facts dd {
        margin: 0;
        font-size: 0.95rem;
        line-height: 1.45;
    }

    .facts__dot {
        display: inline-block;
        width: 6px;
        height: 6px;
        margin-right: 10px;
        vertical-align: 0.1em;
        background: var(--accent);
        border-radius: 50%;
    }

    @media (max-width: 999.98px) {
        .facts {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            column-gap: clamp(16px, 2vw, 32px);
        }
    }

    /* -------------------------------------------------------------- sections
   The header's bottom padding is the gap before the first section, so only
   later sections add space of their own. */
    .about__section+.about__section {
        margin-top: clamp(56px, 6.5vw, 88px);
    }

    .about__section--last {
        padding-bottom: clamp(56px, 6vw, 88px);
    }

    .table {
        margin: 0;
        padding: 0;
        list-style: none;
    }

    /* --------------------------------------------------------------- toolkit
   Name in cols 1-3, items from col 4, like the tables above. The first row has
   no rule of its own: the section head draws it. */
    .toolkit {
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .toolkit__row {
        align-items: start;
        padding-block: 18px;
        border-top: 1px solid var(--line);
    }

    .toolkit__row:first-child {
        padding-top: 0;
        border-top: 0;
    }

    .toolkit__name {
        grid-column: 1 / span 3;
        margin: 0;
        padding-top: 0.13rem;
        color: var(--fg-muted);
    }

    .toolkit__items {
        grid-column: 4 / -1;
        display: flex;
        flex-wrap: wrap;
        gap: 4px clamp(20px, 3vw, 40px);
        margin: 0;
        padding: 0;
        list-style: none;
        font-size: clamp(0.875rem, 1.1vw, 1rem);
        line-height: 1.6;
        color: var(--fg);
    }

    @media (max-width: 759.98px) {

        .toolkit__name,
        .toolkit__items {
            grid-column: 1 / -1;
        }

        .toolkit__name {
            margin-bottom: 8px;
        }
    }
</style>

<script setup lang="ts">
    /** Work index: every project in the editorial table. */
    import PageHeader from '@/components/pages/PageHeader.vue'
    import WorkList from '@/components/WorkList.vue'
    import { projects } from '@/data/content'

    const currentYear = new Date().getFullYear()

    const years = projects.map(p => p.year)
    const span = `${Math.min(...years)} — ${currentYear}`
    const count = `${String(projects.length).padStart(2, '0')} entries`
</script>

<template>
    <div class="work-page">
        <PageHeader label="Index" :meta="count">
            Work, <em>{{ span }}</em>
            <template #lead>
                <p class="t-lead measure">
                    Selected projects from product teams and personal tools. Each entry has a short case study.
                </p>
            </template>
        </PageHeader>

        <section aria-label="All projects" class="wrap work-page__list">
            <WorkList :projects="projects" show-all ruled />
        </section>
    </div>
</template>

<style scoped>

    /* The footer draws its own hairline, so the table's closing rule and the gap
   below it go: the last row's own padding is the only air before the footer. */
    .work-page__list :deep(.work-list__item:last-child) {
        border-bottom: 0;
    }
</style>

<script setup lang="ts">
    /** Work index: every project in the editorial table. */
    import PageHeader from '@/components/pages/page-header.vue'
    import WorkList from '@/components/work-list.vue'
    import { projects } from '@/data/content'

    const span = `from ${Math.min(...projects.map(p => p.year))} to ${new Date().getFullYear()}`
    const count = `${String(projects.length).padStart(2, '0')} entries`
</script>

<template>
    <div>
        <PageHeader label="Projects" :meta="count">
            <div class="text-headline-large">Projects <span v-text="span"></span></div>
            <template #lead>
                <p class="text-headline-small">
                    Selected projects from product teams and personal tools.
                </p>
            </template>
        </PageHeader>

        <section aria-label="All projects" class="wrap">
            <!-- The footer draws its own hairline, so the table leaves its closing rule off. -->
            <WorkList :projects="projects" show-all ruled open />
        </section>
    </div>
</template>

<script setup lang="ts">
  /**
   * Shared opening for inner pages: a hairline that draws in, a mono label row,
   * the serif display title (default slot) and optional lead / aside columns.
   * The lead sits in columns 1-8, the aside in columns 10-12.
   */
  defineProps<{ label?: string, meta?: string }>()
</script>

<template>
  <header class="page-header wrap">
    <div v-reveal class="page-header__rule" />
    <div class="page-header__bar t-label">
      <div class="page-header__label"><slot name="label">{{ label }}</slot></div>
      <div class="page-header__meta"><slot name="meta">{{ meta }}</slot></div>
    </div>

    <h1 v-reveal="80" class="page-header__title t-display t-display--page"><slot /></h1>

    <div v-if="$slots.lead || $slots.aside" class="page-header__cols grid-12">
      <div v-if="$slots.lead" v-reveal="200" class="page-header__lead"><slot name="lead" /></div>
      <div v-if="$slots.aside" v-reveal="320" class="page-header__aside"><slot name="aside" /></div>
    </div>
  </header>
</template>

<style scoped>
.page-header {
  padding-top: calc(var(--header-h) + clamp(24px, 4vw, 56px));
  padding-bottom: var(--ph-pb, clamp(48px, 6vw, 80px));
}

/* Same draw-in hairline as SectionHead. */
.page-header__rule.reveal {
  height: 1px;
  background: var(--line-strong);
  opacity: 1;
  transform: scaleX(0);
  transform-origin: 0 50%;
  transition-duration: 1.2s;
}

.page-header__rule.reveal.is-in {
  transform: none;
}

.page-header__bar {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 24px;
  padding-top: 16px;
}

.page-header__label {
  color: var(--fg);
}

.page-header__meta {
  color: var(--fg-muted);
  text-align: right;
}

.page-header__title {
  margin-top: clamp(40px, 5vw, 64px);
}

.page-header__cols {
  margin-top: clamp(28px, 3.5vw, 48px);
  row-gap: 40px;
}

.page-header__lead {
  grid-column: 1 / span 8;
}

.page-header__aside {
  grid-column: 10 / -1;
}

@media (max-width: 999.98px) {
  .page-header__lead,
  .page-header__aside {
    grid-column: 1 / -1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .page-header__rule.reveal {
    transform: none;
  }
}
</style>

<script setup lang="ts">
  /**
   * The only hairline of a section: a rule, a mono label row ("01 — Selected
   * work" left, meta right), and an optional serif H2 supplied through the
   * default slot. Whatever follows must not draw its own top border. The gap to
   * the content below is clamp(40px, 5vw, 64px).
   */
  defineProps<{ index: string, title: string, meta?: string }>()
</script>

<template>
  <header class="section-head">
    <div v-reveal class="section-head__rule" />
    <div class="section-head__row t-label">
      <component :is="$slots.default ? 'p' : 'h2'" class="section-head__label">
        <span>{{ index }}</span>
        <span aria-hidden="true">&ensp;—&ensp;</span>
        <span>{{ title }}</span>
      </component>
      <p v-if="meta" class="section-head__meta">{{ meta }}</p>
    </div>
    <h2 v-if="$slots.default" v-reveal class="section-head__title t-h2">
      <slot />
    </h2>
  </header>
</template>

<style scoped>
.section-head {
  margin-bottom: clamp(40px, 5vw, 64px);
}

/* The hairline draws in from the left rather than fading up. */
.section-head__rule.reveal {
  height: 1px;
  background: var(--line-strong);
  opacity: 1;
  transform: scaleX(0);
  transform-origin: 0 50%;
  transition-duration: 1.2s;
}

.section-head__rule.reveal.is-in {
  transform: none;
}

.section-head__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 24px;
  padding-top: 16px;
}

.section-head__label {
  margin: 0;
  font: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  color: var(--fg);
}

.section-head__label span:first-child {
  color: var(--fg-muted);
}

.section-head__meta {
  margin: 0;
  color: var(--fg-muted);
  text-align: right;
}

.section-head__title {
  margin-top: clamp(28px, 4vw, 56px);
  max-width: 20ch;
}

@media (prefers-reduced-motion: reduce) {
  .section-head__rule.reveal {
    transform: none;
  }
}
</style>

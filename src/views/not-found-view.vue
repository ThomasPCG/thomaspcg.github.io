<script setup lang="ts">
  /** 404. Also rendered by project-view.vue for an unknown case-study slug. */
  import { useRoute } from 'vue-router'
  import ArrowIcon from '@/components/arrow-icon.vue'

  // Read once: the path must not change while the page fades out.
  const path = useRoute().fullPath
</script>

<template>
  <section class="nf wrap">
    <div v-reveal class="nf__rule" />
    <div class="nf__bar t-label">
      <p>Error</p>
      <p>No route matches</p>
    </div>

    <h1 v-reveal="80" class="nf__code t-display">
      <span aria-hidden="true">4<em>0</em>4</span>
      <span class="sr-only">Page not found</span>
    </h1>

    <div class="nf__cols grid-12">
      <p v-reveal="200" class="nf__line t-h2"><em>Nothing computes here.</em></p>

      <div v-reveal="320" class="nf__aside">
        <p class="nf__path t-mono muted" v-text="path"></p>
        <nav class="nf__links">
          <RouterLink class="nf__link link-u" to="/"><ArrowIcon dir="left" /> Back to home</RouterLink>
          <RouterLink class="nf__link link-u muted" to="/work">Browse the work <ArrowIcon dir="right" /></RouterLink>
        </nav>
      </div>
    </div>
  </section>
</template>

<style scoped>
.nf {
  display: flex;
  flex-direction: column;
  min-height: 100svh;
  padding-top: calc(var(--header-h) + clamp(24px, 4vw, 56px));
  padding-bottom: clamp(56px, 8vw, 112px);
}

.nf__rule.reveal {
  height: 1px;
  background: var(--line-strong);
  opacity: 1;
  transform: scaleX(0);
  transform-origin: 0 50%;
  transition-duration: 1.2s;
}

.nf__rule.reveal.is-in {
  transform: none;
}

.nf__bar {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding-top: 16px;
}

.nf__bar p {
  margin: 0;
}

.nf__code {
  margin-block: auto;
  padding-block: clamp(32px, 6vw, 88px);
  font-size: clamp(9rem, 40vw, 32rem);
  line-height: 0.8;
  letter-spacing: -0.04em;
  margin-left: -0.04em;
}

.nf__cols {
  row-gap: 40px;
  align-items: end;
}

.nf__line {
  grid-column: 1 / span 7;
}

.nf__aside {
  grid-column: 9 / -1;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.nf__path {
  padding-top: 16px;
  border-top: 1px solid var(--line);
  overflow-wrap: anywhere;
}

.nf__links {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
}

.nf__link {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

@media (max-width: 999.98px) {
  .nf__line,
  .nf__aside {
    grid-column: 1 / -1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nf__rule.reveal {
    transform: none;
  }
}
</style>

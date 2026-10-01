<script setup lang="ts">
  /**
   * One block of a case study: a sticky mono label in columns 1-3 and the
   * content in columns 4-10. Below 760px the label sits inline above the text.
   *
   * The label is nudged down so its capitals start level with the first line of
   * the body. Set `--cap` on the section to the body's cap-top offset (the
   * default suits 1.05rem body text at line-height 1.65).
   */
  defineProps<{ label: string }>()
</script>

<template>
  <section v-reveal class="case-section grid-12">
    <h2 class="case-section__label t-label" v-text="label"></h2>
    <div class="case-section__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.case-section {
  --cap: 0.5075rem;
  padding-block: clamp(28px, 3.4vw, 44px) clamp(40px, 5vw, 64px);
  border-top: 1px solid var(--line);
}

.case-section__label {
  grid-column: 1 / span 3;
  align-self: start;
  position: sticky;
  top: calc(var(--header-h) + 28px);
  margin: calc(var(--cap) - 0.274rem) 0 0;
  color: var(--fg);
}

.case-section__body {
  grid-column: 4 / span 7;
  min-width: 0;
}

@media (max-width: 759.98px) {
  .case-section__label {
    position: static;
    grid-column: 1 / -1;
    margin: 0 0 20px;
  }

  .case-section__body {
    grid-column: 1 / -1;
  }
}
</style>

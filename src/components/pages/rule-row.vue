<script setup lang="ts">
  /**
   * Editorial table row used by the About page: three slots on the 12-column
   * grid (a: 1-3, b: 4-8, c: 9-12) under a hairline. Stacks on mobile.
   * Meta goes in `a`, the serif title in `b`, the note in `c`.
   *
   * The cells share one cap line: the label and the note are nudged so their
   * capitals start level with the title's, rather than sitting on its baseline.
   * The first row draws no top rule, because the section head above it does.
   */
</script>

<template>
  <li v-reveal class="rule-row grid-12">
    <div class="rule-row__a"><slot name="a" /></div>
    <div class="rule-row__b"><slot name="b" /></div>
    <div class="rule-row__c"><slot name="c" /></div>
  </li>
</template>

<style scoped>
.rule-row {
  /* Title size. Its cap top sits .17em below the line box (Instrument Serif,
     line-height 1.1); the label's sits .274rem below its own, the note's .406rem. */
  --rr-title: clamp(1.6rem, 2.6vw, 2.4rem);
  align-items: start;
  padding-block: clamp(24px, 2.8vw, 36px);
  border-top: 1px solid var(--line);
}

.rule-row:first-child {
  padding-top: 0;
  border-top: 0;
}

.rule-row__b :deep(.t-h3) {
  font-size: var(--rr-title);
}

.rule-row__a {
  grid-column: 1 / span 2;
  margin-top: calc(var(--rr-title) * 0.17 - 0.274rem);
  color: var(--fg-muted);
  transition: color 0.3s var(--ease);
}

.rule-row:hover .rule-row__a {
  color: var(--accent);
}

.rule-row__b {
  grid-column: 3 / span 4;
}

.rule-row__c {
  grid-column: 7 / span 5;
  margin-top: calc(var(--rr-title) * 0.17 - 0.406rem);
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--fg-muted);
}

@media (max-width: 759.98px) {
  .rule-row__a,
  .rule-row__b,
  .rule-row__c {
    grid-column: 1 / -1;
  }

  .rule-row__a {
    margin-top: 0;
  }

  .rule-row__b {
    margin-top: 14px;
  }

  .rule-row__c {
    margin-top: 12px;
  }
}
</style>

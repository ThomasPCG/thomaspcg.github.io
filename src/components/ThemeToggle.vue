<script setup lang="ts">
  /**
   * Header button that flips between the dark (ink) and light (paper) themes.
   * The glyph is a ring with one half filled, drawn on a 16px grid with the same
   * 1.25px stroke as ArrowIcon, and turns half a revolution on each switch. The
   * theme change radiates from the button (see useColorMode).
   */
  import { computed } from 'vue'
  import { useColorMode } from '@/composables/useColorMode'

  const { mode, toggle } = useColorMode()

  const label = computed(() => `Switch to ${mode.value === 'dark' ? 'light' : 'dark'} theme`)

  const onClick = (e: MouseEvent) => toggle(e.currentTarget as Element)
</script>

<template>
  <v-btn
    :aria-label="label"
    class="theme-btn"
    :title="label"
    variant="text"
    @click="onClick"
  >
    <svg
      aria-hidden="true"
      class="theme-btn__icon"
      :class="{ 'is-light': mode === 'light' }"
      fill="none"
      focusable="false"
      viewBox="0 0 16 16"
    >
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 1.75a6.25 6.25 0 0 1 0 12.5z" />
    </svg>
  </v-btn>
</template>

<style scoped>
/* The 16px glyph sits centred in a 40px target; the side margins pull its visible
   edge back to the nav gap on one side and the page gutter on the other. */
.theme-btn {
  width: 40px;
  min-width: 0;
  height: 40px;
  margin-inline: -12px;
  padding: 0;
}

.theme-btn__icon {
  display: block;
  width: 16px;
  height: 16px;
  overflow: visible;
  transition: transform 0.7s var(--ease);
}

.theme-btn__icon.is-light {
  transform: rotate(180deg);
}

.theme-btn__icon :is(circle, path) {
  stroke: currentColor;
  stroke-width: 1.25;
  stroke-linejoin: miter;
}

.theme-btn__icon path {
  fill: currentColor;
}
</style>

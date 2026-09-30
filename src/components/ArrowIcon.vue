<script setup lang="ts">
  /**
   * Inline arrow drawn on a 16px grid with a 1.25px stroke.
   * Sized in `em`, so it scales with the surrounding text.
   */
  withDefaults(defineProps<{ dir?: 'right' | 'up-right' | 'down' | 'left' | 'up' }>(), {
    dir: 'right',
  })

  const paths = {
    'right': 'M1.5 8H14M9 3l5 5-5 5',
    'left': 'M14.5 8H2M7 3L2 8l5 5',
    'down': 'M8 1.5V14M3 9l5 5 5-5',
    'up': 'M8 14.5V2M3 7l5-5 5 5',
    'up-right': 'M3 13L13 3M5 3h8v8',
  }
</script>

<template>
  <svg
    aria-hidden="true"
    class="arrow-icon"
    fill="none"
    focusable="false"
    viewBox="0 0 16 16"
  >
    <path :d="paths[dir]" />
  </svg>
</template>

<style scoped>
.arrow-icon {
  display: inline-block;
  flex: none;
  width: 1em;
  height: 1em;
  vertical-align: -0.125em;
  overflow: visible;
}

.arrow-icon path {
  stroke: currentColor;
  stroke-width: 1.25;
  stroke-linecap: butt;
  stroke-linejoin: miter;
}
</style>

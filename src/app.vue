<script setup lang="ts">
  import SiteFooter from '@/components/site-footer.vue'
  import SiteHeader from '@/components/site-header.vue'
</script>

<template>
  <v-app>
    <a class="skip-link t-label" href="#main">Skip to content</a>
    <SiteHeader />

    <v-main id="main">
      <router-view v-slot="{ Component, route }">
        <Transition mode="out-in" name="page">
          <!-- The footer lives inside the keyed wrapper so it fades with the page instead of jumping. -->
          <div :key="route.path" class="page">
            <component :is="Component" />
            <SiteFooter />
          </div>
        </Transition>
      </router-view>
    </v-main>
  </v-app>
</template>

<style scoped>
.page {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
}

.page > :first-child {
  flex: 1 0 auto;
}

.skip-link {
  position: fixed;
  top: 12px;
  left: var(--gutter);
  z-index: 200;
  padding: 10px 14px;
  background: var(--fg);
  color: var(--bg);
  transform: translateY(-200%);
  transition: transform 0.3s var(--ease);
}

.skip-link:focus-visible {
  transform: none;
}
</style>

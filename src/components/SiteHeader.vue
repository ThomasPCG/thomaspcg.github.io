<script setup lang="ts">
  /**
   * Fixed header. Transparent over the hero, solid with a hairline once the
   * page scrolls, hides while scrolling down and returns on scroll up.
   * Below 760px the links move into a full-width drawer.
   */
  import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import ThemeToggle from '@/components/ThemeToggle.vue'
  import { site } from '@/data/content'

  const route = useRoute()

  const nav = [
    { index: '01', label: 'Work', to: '/work', section: true },
    { index: '02', label: 'About', to: '/about', section: true },
    { index: '03', label: 'Contact', to: '/#contact', section: false },
  ]

  // Contact is an anchor, not a route, so it is never "current".
  const isCurrent = (item: (typeof nav)[number]) =>
    item.section && (route.path === item.to || route.path.startsWith(`${item.to}/`))

  const scrolled = ref(false)
  const hidden = ref(false)
  const drawer = ref(false)

  let lastY = 0

  function onScroll () {
    const y = window.scrollY
    scrolled.value = y > 8
    if (y <= 8) {
      hidden.value = false
      lastY = y
    } else if (Math.abs(y - lastY) > 6) {
      hidden.value = y > lastY && y > 160
      lastY = y
    }
  }

  // The drawer only exists below the desktop breakpoint.
  const desktop = window.matchMedia('(min-width: 760px)')
  const closeOnDesktop = () => {
    if (desktop.matches) drawer.value = false
  }

  onMounted(() => {
    lastY = window.scrollY
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    desktop.addEventListener('change', closeOnDesktop)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll)
    desktop.removeEventListener('change', closeOnDesktop)
  })

  watch(() => route.fullPath, () => {
    hidden.value = false
  })
</script>

<template>
  <header
    class="site-header"
    :class="{ 'is-scrolled': scrolled, 'is-hidden': hidden && !drawer }"
    @focusin="hidden = false"
  >
    <div class="wrap site-header__bar">
      <RouterLink aria-label="Thomas Lim, home" class="brand" to="/">
        <span class="brand__name">{{ site.name }}</span>
        <span class="brand__loc">/ SG</span>
      </RouterLink>

      <div class="site-header__end">
        <nav aria-label="Primary" class="nav">
          <RouterLink
            v-for="item in nav"
            :key="item.label"
            custom
            :to="item.to"
          >
            <template #default="{ href, navigate }">
              <a
                :aria-current="isCurrent(item) ? 'page' : undefined"
                class="nav__link"
                :class="{ 'is-current': isCurrent(item) }"
                :href="href"
                @click="navigate"
              >
                <span class="nav__idx">{{ item.index }}</span>
                <span class="nav__label link-u">{{ item.label }}</span>
              </a>
            </template>
          </RouterLink>
        </nav>

        <ThemeToggle />

        <v-btn
          aria-controls="site-drawer"
          :aria-expanded="drawer"
          class="menu-btn"
          variant="text"
          @click="drawer = true"
        >
          Menu
        </v-btn>
      </div>
    </div>
  </header>

  <v-navigation-drawer
    id="site-drawer"
    v-model="drawer"
    class="drawer"
    location="right"
    :scrim="false"
    temporary
    width="100%"
    @keydown.esc="drawer = false"
  >
    <div class="drawer__inner wrap">
      <div class="drawer__top">
        <span class="brand__name">{{ site.name }}</span>
        <v-btn class="menu-btn" variant="text" @click="drawer = false">Close</v-btn>
      </div>

      <nav aria-label="Mobile" class="drawer__nav">
        <RouterLink
          v-for="item in nav"
          :key="item.label"
          custom
          :to="item.to"
        >
          <template #default="{ href, navigate }">
            <a
              :aria-current="isCurrent(item) ? 'page' : undefined"
              class="drawer__link"
              :class="{ 'is-current': isCurrent(item) }"
              :href="href"
              @click="navigate"
            >
              <span class="drawer__idx t-label">{{ item.index }}</span>
              <span class="drawer__label">{{ item.label }}</span>
            </a>
          </template>
        </RouterLink>
      </nav>

      <div class="drawer__foot">
        <p class="t-label">Email</p>
        <a class="drawer__mail link-u" :href="`mailto:${site.email}`">{{ site.email }}</a>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<style scoped>
.site-header {
  position: fixed;
  inset: 0 0 auto;
  z-index: 100;
  height: var(--header-h);
  border-bottom: 1px solid transparent;
  transition:
    transform 0.45s var(--ease),
    background-color 0.3s var(--ease),
    border-color 0.3s var(--ease);
}

.site-header.is-scrolled {
  background: var(--bg);
  border-bottom-color: var(--line);
}

.site-header.is-hidden {
  transform: translateY(-100%);
}

.site-header__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

/* Nav, theme toggle and mobile menu button share the right-hand side. */
.site-header__end {
  display: flex;
  align-items: center;
  gap: clamp(28px, 3.4vw, 52px);
}

/* ---------------------------------------------------------------- brand */
.brand {
  display: inline-flex;
  align-items: baseline;
  gap: 10px;
}

.brand__name {
  font-family: var(--font-serif);
  font-size: 1.4rem;
  line-height: 1;
  letter-spacing: -0.01em;
}

.brand__loc {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  color: var(--fg-muted);
}

/* ------------------------------------------------------------ desktop nav */
.nav {
  display: flex;
  gap: clamp(28px, 3.4vw, 52px);
}

.nav__link {
  display: inline-flex;
  align-items: baseline;
  gap: 0.75em;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--fg-muted);
  transition: color 0.3s var(--ease);
}

.nav__idx {
  color: var(--fg-muted);
  transition: color 0.3s var(--ease);
}

.nav__link:is(:hover, :focus-visible, .is-current) {
  color: var(--fg);
}

.nav__link:is(:hover, :focus-visible, .is-current) .nav__idx {
  color: var(--accent);
}

/* The current page keeps its underline drawn. */
.nav__link.is-current .nav__label {
  background-size: 100% 1px;
}

.menu-btn {
  display: none;
  height: 40px;
  margin-right: -8px;
  padding-inline: 8px;
}

@media (max-width: 759.98px) {
  .site-header__end {
    gap: 0;
  }

  .nav {
    display: none;
  }

  .menu-btn {
    display: inline-grid;
  }
}

/* ---------------------------------------------------------------- drawer */
.drawer {
  background: var(--bg);
  border: 0;
}

.drawer__inner {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.drawer__top {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  height: var(--header-h);
}

.drawer__nav {
  margin-top: clamp(24px, 8vh, 72px);
}

.drawer__link {
  display: flex;
  align-items: baseline;
  gap: 18px;
  padding-block: 14px 18px;
  border-top: 1px solid var(--line);
  transition: color 0.3s var(--ease);
}

.drawer__link:last-child {
  border-bottom: 1px solid var(--line);
}

.drawer__idx {
  min-width: 2.2em;
  color: var(--fg-muted);
  transition: color 0.3s var(--ease);
}

.drawer__label {
  font-family: var(--font-serif);
  font-size: clamp(3.25rem, 17vw, 5.5rem);
  line-height: 1;
  letter-spacing: -0.02em;
}

.drawer__link:is(:hover, :focus-visible, .is-current) .drawer__idx {
  color: var(--accent);
}

.drawer__foot {
  margin-top: auto;
  padding-block: 40px calc(32px + env(safe-area-inset-bottom));
}

.drawer__mail {
  display: inline-block;
  margin-top: 8px;
  font-size: clamp(1.1rem, 5vw, 1.5rem);
  font-weight: 300;
}
</style>

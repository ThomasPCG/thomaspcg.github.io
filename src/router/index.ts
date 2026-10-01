/**
 * router/index.ts
 *
 * History-mode routes with lazy views. Deep links on GitHub Pages work because
 * the build copies index.html to 404.html (see vite.config.mts).
 */

import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { projects } from '@/data/content'

const SITE_TITLE = 'Thomas Lim'

// An unknown case-study slug renders the 404 view, keeping the URL as typed.
function knownProject (to: RouteLocationNormalized) {
  if (projects.some(p => p.slug === to.params.slug)) {
    return true
  }
  return { name: 'not-found', params: { pathMatch: to.path.split('/').slice(1) }, replace: true }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/home-view.vue'),
    },
    {
      path: '/work',
      name: 'work',
      component: () => import('@/views/work-view.vue'),
      meta: { title: 'Work' },
    },
    {
      path: '/work/:slug',
      name: 'project',
      component: () => import('@/views/project-view.vue'),
      beforeEnter: knownProject,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/about-view.vue'),
      meta: { title: 'About' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/not-found-view.vue'),
      meta: { title: 'Page not found' },
    },
  ],
  scrollBehavior (to, from, savedPosition) {
    // Let the out-in page transition finish before moving the viewport.
    const settle = <T>(position: T) => new Promise<T>(resolve => setTimeout(resolve, 300, position))

    if (savedPosition) {
      return settle(savedPosition)
    }
    if (to.hash) {
      const header = Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'))
      return settle({ el: to.hash, top: header || 72, behavior: 'smooth' as const })
    }
    return settle({ top: 0 })
  },
})

router.afterEach(to => {
  const project = to.name === 'project' ? projects.find(p => p.slug === to.params.slug) : undefined
  const title = project?.title ?? (to.meta.title as string | undefined)
  document.title = title ? `${title} — Thomas Lim` : SITE_TITLE
})

export default router

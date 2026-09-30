<script setup lang="ts">
  /**
   * Home: editorial front page. Hero, selected work (a lead story and a table
   * of the rest), capabilities; the contact footer comes from the app shell.
   */
  import { computed } from 'vue'
  import ArrowIcon from '@/components/ArrowIcon.vue'
  import CapabilitiesSection from '@/components/home/CapabilitiesSection.vue'
  import HeroSection from '@/components/home/HeroSection.vue'
  import LeadProject from '@/components/home/LeadProject.vue'
  import SectionHead from '@/components/SectionHead.vue'
  import WorkList from '@/components/WorkList.vue'
  import { projects } from '@/data/content'

  const featured = computed(() => projects.filter(p => p.featured))
  // The first featured project is the lead story; the rest follow as table rows.
  const lead = computed(() => featured.value[0])
  const rest = computed(() => featured.value.slice(1))
  const workMeta = computed(() => `${featured.value.length} of ${projects.length} projects`)
</script>

<template>
  <div class="home">
    <HeroSection />

    <section class="home__work">
      <!-- The anchor starts a little above the rule, so `/#work` leaves air under the header. -->
      <div id="work" class="wrap home__anchor">
        <SectionHead index="01" :meta="workMeta" title="Selected work">
          Projects where the <em>logic</em> mattered.
        </SectionHead>

        <LeadProject v-if="lead" index="01" :project="lead" />

        <div class="home__rest">
          <WorkList ruled :projects="rest" :start="2" />
        </div>

        <div v-reveal class="home__more">
          <RouterLink class="home__all link-u" to="/work">
            All work
            <ArrowIcon class="home__all-arrow" dir="right" />
          </RouterLink>
        </div>
      </div>
    </section>

    <CapabilitiesSection />
  </div>
</template>

<style scoped>
.home__work {
  padding-top: clamp(80px, 11vw, 160px);
  padding-bottom: clamp(72px, 9vw, 128px);
}

.home__anchor {
  padding-top: 28px;
  margin-top: -28px;
}

/* Generous air between the feature and the table that follows it. */
.home__rest {
  margin-top: clamp(64px, 8vw, 120px);
}

.home__more {
  display: flex;
  justify-content: flex-end;
  margin-top: clamp(28px, 3.5vw, 48px);
}

.home__all {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-size: clamp(1.05rem, 1.5vw, 1.3rem);
  font-weight: 300;
}

.home__all-arrow {
  transition: transform 0.4s var(--ease);
}

.home__all:is(:hover, :focus-visible) .home__all-arrow {
  transform: translateX(4px);
}
</style>

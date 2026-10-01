<script setup lang="ts">
    /**
     * Prints a content string, turning *word* into <em> without v-html.
     * In sans-serif copy the emphasis switches to the serif italic, as in the headlines.
     */
    import { computed } from 'vue'

    const props = defineProps<{ text: string }>()

    // split() with a capture group puts the emphasised words at the odd indices.
    const segments = computed(() => props.text.split(/\*([^*]+)\*/).map((text, i) => ({ text, em: i % 2 === 1 })))
</script>

<template>
    <template v-for="(seg, i) in segments" :key="i">
        <em v-if="seg.em" v-text="seg.text"></em>
        <span v-else v-text="seg.text"></span>
    </template>
</template>

<style scoped>
    em {
        font-family: var(--font-serif);
        font-style: italic;
        font-size: var(--em-size, 1.12em);
        color: var(--fg);
    }
</style>

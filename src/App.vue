<script setup lang=ts>
import ProfileGrid from '@/features/profiles/ProfileGrid.vue';
</script>

<template>
  <main class=lumina-app-root>
    <ProfileGrid />
  </main>
</template>

<style>
@import '@/styles/tokens.css';

body {
  margin: 0;
  padding: 0;
  background-color: var(--cc-bg-primary, #070c18);
  color: var(--cc-text-primary, #fff);
  font-family: var(--cc-font-body, sans-serif);
  -webkit-font-smoothing: antialiased;
}

* {
  box-sizing: border-box;
}
</style>

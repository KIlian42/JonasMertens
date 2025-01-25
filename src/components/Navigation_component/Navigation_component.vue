<template>
  <div class="navigation">
    <div v-if="currentViewClass === 'phone'" class="pa-0 ma-0 navigationphone">
      <RouterLink to="/">
        <btn>
          <h2 class="extra-bold">Jonas Lión M.</h2>
        </btn>
      </RouterLink>
      <RouterLink to="/contact">
        <btn>
          <h2 class="extra-bold">Contact</h2>
        </btn>
      </RouterLink>
    </div>
    <div v-else class="navigationfullscreen">
      <RouterLink to="/">
        <btn>
          <h2 class="extra-bold">Jonas Lión M.</h2>
        </btn>
      </RouterLink>
      <RouterLink to="/contact">
        <btn>
          <h2 class="extra-bold">Contact</h2>
        </btn>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getViewClass } from './Navigation_component.ts'
const { currentViewClass } = getViewClass()
</script>

<style scoped>
@import url('./Navigation_component.css');
</style>

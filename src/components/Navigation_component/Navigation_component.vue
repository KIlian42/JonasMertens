<template>
  <v-row class="pa-0 ma-0"> </v-row>
  <v-col :cols="currentViewClass === 'phone' ? 12 : 2" class="pa-0 ma-0">
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
  </v-col>
</template>

<script setup lang="ts">
import { getViewClass } from './Navigation_component.ts'
const { currentViewClass } = getViewClass()
</script>

<style scoped>
@import url('./Navigation_component.css');
</style>

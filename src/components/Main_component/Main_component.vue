<template>
  <v-row class="pa-0 ma-0">
    <v-col :cols="currentViewClass === 'phone' ? 12 : 10" class="pa-0 ma-0">
      <router-view />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { getViewClass } from './Main_component.ts'
const { currentViewClass } = getViewClass()
</script>

<style scoped>
@import url('./Main_component.css');
</style>

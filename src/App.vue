<template>
  <v-app>
    <v-container fluid class="pa-0 ma-0">
      <Navigation />
      <MainComponent />
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
import Navigation from './components/Navigation_component/Navigation_component.vue'
import MainComponent from './components/Main_component/Main_component.vue'
</script>

<style scoped>
.v-container {
  position: relative;
  z-index: 0;
  min-height: 1000px;
}
</style>

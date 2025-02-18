<template>
  <v-app>
    <v-container fluid class="pa-0 ma-0">
      <MainComponent />
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
import MainComponent from './components/Main_component/Main_component.vue'
</script>

<style scoped>
v-container {
  background-color: white;
  height: 100%;
  overflow: hidden;
}
</style>

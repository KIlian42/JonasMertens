<template>
  <v-container fluid class="pa-12 ma-0 container">
    <v-row no-gutters class="pa-0 ma-0 rowelement" @click="addRow">
      <v-icon class="add">mdi-plus-circle</v-icon>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { projectStore } from '@/stores/projectStore'

const current_project = ref('') // ref(projectStore.getCurrentProjectPage)

const addRow = () => {}
</script>

<style scoped>
@import url('./Project_component.css');
</style>

<template>
  <div :class="currentViewClass === 'phone' ? 'mainphone' : 'mainfullscreen'">
    <Transition name="fade" mode="out-in">
      <RouterView />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { getViewClass } from './Main_component.ts'
const { currentViewClass } = getViewClass()
</script>

<style scoped>
@import url('./Main_component.css');
</style>

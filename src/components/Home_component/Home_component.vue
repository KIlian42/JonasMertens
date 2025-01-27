<template>
  <v-container fluid class="pa-12 ma-0 container">
    <v-row
      no-gutters
      class="pa-0 ma-0 rowelement"
      @mousedown="isPressed = true"
      @mouseup="isPressed = false"
      @mouseleave="isPressed = false"
      :class="{ pressed: isPressed }"
    >
      <v-icon class="add">mdi-plus-circle</v-icon>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isPressed = ref(false)
</script>

<style scoped>
.container {
  background-color: lightseagreen;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: scroll;
}

.rowelement {
  align-items: center;
  justify-content: center;
  background-color: lightgray;
  width: 100%;
  min-height: 200px;
  max-height: 200px;
  border-radius: 10px;
  transition: all 0.2s ease; /* Smooth transition */
}

.rowelement:hover {
  background-color: lightcyan;
  transform: scale(1.01);
  cursor: pointer;
}

.rowelement.pressed {
  transform: scale(0.98); /* Shrink effect on press */
  background-color: lightblue; /* Optional pressed color */
}

.add {
  font-size: 100px;
  transition: transform 0.2s ease; /* Smooth transform for scaling */
}

.rowelement.pressed .add {
  transform: scale(0.9); /* Icon shrink effect */
}
</style>

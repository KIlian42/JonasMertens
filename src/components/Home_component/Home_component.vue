<template>
  <v-container fluid class="pa-12 ma-0 container">
    <v-row
      no-gutters
      class="pa-0 ma-0 rowelement"
      @mousedown="isPressed = true"
      @mouseup="isPressed = false"
      @mouseleave="isPressed = false"
      :class="{ pressed: isPressed, dragging: isDragging }"
      @dragover.prevent="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <v-icon class="add" v-if="!bild">mdi-plus-circle</v-icon>
      <img v-else :src="bild" alt="Dropped image" class="uploaded-image" />
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isPressed = ref(false)
const isDragging = ref(false)
const bild = ref<string | null>(null)

// Handler für Drag-and-Drop
const onDragOver = () => {
  isDragging.value = true
}

const onDragLeave = () => {
  isDragging.value = false
}

const onDrop = (event: DragEvent) => {
  event.preventDefault() // Verhindert das Standardverhalten des Browsers (z. B. Datei öffnen)
  isDragging.value = false

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]

    // Prüfen, ob es sich um ein Bild handelt
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => {
        bild.value = reader.result as string
      }
      reader.readAsDataURL(file) // Konvertiert das Bild in einen Base64-String
    }
  }
}
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
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: lightgray;
  width: 100%;
  min-height: 200px;
  max-height: 200px;
  border-radius: 10px;
  transition: all 0.2s ease; /* Smooth transition */
  border: 2px dashed transparent;
}

.rowelement.dragging {
  border-color: lightblue;
  background-color: lightyellow; /* Zeigt an, dass ein Bild gezogen wird */
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

.uploaded-image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 10px;
}
</style>

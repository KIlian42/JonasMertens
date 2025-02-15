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
      @click="selectImage"
    >
      <v-icon class="add" v-if="!bild">mdi-plus-circle</v-icon>
      <img v-else :src="bild" alt="Dropped image" class="uploaded-image" />
    </v-row>
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
      @click="selectImage"
    >
      <v-icon class="add" v-if="!bild">mdi-plus-circle</v-icon>
      <img v-else :src="bild" alt="Dropped image" class="uploaded-image" />
    </v-row>

    <!-- Verstecktes Input-Feld -->
    <input
      type="file"
      ref="fileInput"
      accept="image/*"
      class="hidden-input"
      @change="onFileSelect"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isPressed = ref(false)
const isDragging = ref(false)
const bild = ref<string | null>(null)

const fileInput = ref<HTMLInputElement | null>(null) // Referenz zum versteckten Input-Feld

// Öffnet den Dateiauswahldialog
const selectImage = () => {
  fileInput.value?.click()
}

// Wird ausgelöst, wenn eine Datei über das Input-Feld ausgewählt wird
const onFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
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
@import url('./Project_component.css');
</style>

<script setup lang="ts">
const totalImages = 126 // Gesamtanzahl der Bilder
const imagesPerRow = 3 // Anzahl der Bilder pro Zeile

// Berechnung der Reihen und Bildpfade
const rows = Array.from({ length: Math.ceil(totalImages / imagesPerRow) }, (_, rowIndex) => {
  return Array.from(
    { length: imagesPerRow },
    (_, colIndex) => rowIndex * imagesPerRow + colIndex + 1,
  ).filter((imageNumber) => imageNumber <= totalImages)
})

const getImagePath = (imageNumber: number) => {
  return new URL(`./assets/photography/${imageNumber}.png`, import.meta.url).href
}
</script>

<template>
  <v-app>
    <v-container fluid class="pa-0">
      <v-row v-for="(row, rowIndex) in rows" :key="'row-' + rowIndex" no-gutters>
        <v-col v-for="imageNumber in row" :key="'image-' + imageNumber" cols="4">
          <img :src="getImagePath(imageNumber)" :alt="`Bild ${imageNumber}`" class="column-image" />
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<style scoped>
.column-image {
  width: 100%; /* Füllt die gesamte Breite der Spalte */
  height: 100%; /* Füllt die gesamte Höhe der Spalte */
  object-fit: cover; /* Schneidet das Bild passend zu, ohne das Seitenverhältnis zu verzerren */
  display: block; /* Entfernt mögliche Lücken um das Bild */
}
.v-col {
  height: 80vh; /* Beispielhöhe für die Spalten */
}
</style>

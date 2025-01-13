<script setup lang="ts">
import { onMounted } from 'vue'

const totalImages = 126 // Total number of images
const imagesPerRow = 3 // Number of images per row

// Function to generate the image path
const getImagePath = (imageNumber: number) => {
  return new URL(`./assets/photography/${imageNumber}.png`, import.meta.url).href
}

// Calculate rows for the grid
const rows = Array.from({ length: Math.ceil(totalImages / imagesPerRow) }, (_, rowIndex) => {
  return Array.from(
    { length: imagesPerRow },
    (_, colIndex) => rowIndex * imagesPerRow + colIndex + 1,
  ).filter((imageNumber) => imageNumber <= totalImages)
})

// Initialize scroll animation
onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    },
    { threshold: 0.1 },
  )

  const images = document.querySelectorAll('.fade-in')
  images.forEach((image) => observer.observe(image))
})
</script>

<template>
  <v-app>
    <v-container fluid class="pa-0">
      <v-row v-for="(row, rowIndex) in rows" :key="'row-' + rowIndex" no-gutters>
        <v-col v-for="(imageNumber, colIndex) in row" :key="'image-' + imageNumber" cols="4">
          <!-- Add dynamic classes for different offsets -->
          <img
            :src="getImagePath(imageNumber)"
            :alt="`Bild ${imageNumber}`"
            :class="[
              'column-image',
              'fade-in',
              colIndex === 0 ? 'offset-small' : '',
              colIndex === 1 ? 'offset-medium' : '',
              colIndex === 2 ? 'offset-large' : '',
            ]"
          />
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<style scoped>
.column-image {
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  object-fit: cover; /* Keep aspect ratio */
  display: block;
  opacity: 0; /* Initially hidden */
  transition:
    opacity 1s cubic-bezier(0.25, 0.1, 0.25, 1),
    transform 1s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.offset-small {
  transform: translateY(50px); /* First image offset */
}

.offset-medium {
  transform: translateY(100px); /* Second image offset */
}

.offset-large {
  transform: translateY(150px); /* Last image offset */
}

.column-image.visible {
  opacity: 1; /* Fully visible */
  transform: translateY(0); /* Reset offset */
}

.v-col {
  height: 80vh; /* Example height for columns */
}
</style>

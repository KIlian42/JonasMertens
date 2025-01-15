<script setup lang="ts">
import { ref, onMounted } from 'vue'

const totalImages = 126 // Total number of images
const imagesPerRow = 3 // Number of images per row

// Function to generate the image path
const getImagePath = (imageNumber: number) => {
  return new URL(`../assets/photography/${imageNumber}.png`, import.meta.url).href
}

// Calculate rows for the grid
const rows = Array.from({ length: Math.ceil(totalImages / imagesPerRow) }, (_, rowIndex) => {
  return Array.from(
    { length: imagesPerRow },
    (_, colIndex) => rowIndex * imagesPerRow + colIndex + 1,
  ).filter((imageNumber) => imageNumber <= totalImages)
})

// Flip states for each card
const flippedStates = ref<Array<boolean>>(Array(totalImages).fill(false))

// Toggle flip state
const toggleFlip = (index: number) => {
  flippedStates.value[index] = !flippedStates.value[index]
}

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
  <v-container fluid class="pa-0">
    <v-row v-for="(row, rowIndex) in rows" :key="'row-' + rowIndex" no-gutters>
      <v-col
        v-for="(imageNumber, colIndex) in row"
        :key="'image-' + imageNumber"
        cols="4"
        class="flip-container"
        @click="toggleFlip(imageNumber - 1)"
      >
        <div class="flip-card" :class="{ flipped: flippedStates[imageNumber - 1] }">
          <!-- Front (Image) -->
          <div class="card-front">
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
          </div>
          <!-- Back (Text) -->
          <div class="card-back">
            <p>Some text</p>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.flip-container {
  perspective: 1000px; /* Ensures 3D perspective is applied */
  cursor: pointer;
  width: 100%;
  height: 100%;
  position: relative;
}

.flip-card {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d; /* Maintains 3D space for children */
  transition: transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.flip-card.flipped {
  transform: rotateY(180deg); /* Flips the card */
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden; /* Ensures one side is hidden when flipped */
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-front {
  z-index: 2; /* Ensures front is visible initially */
  transform: rotateY(0deg); /* Front stays in place */
}

.card-back {
  transform: rotateY(180deg); /* Back rotates to face the user on flip */
  background-color: #f8f9fa;
  color: #000;
  z-index: 1;
}

.card-back p {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
}

.column-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0; /* Initially hidden for fade-in effect */
  transition:
    opacity 1s cubic-bezier(0.25, 0.1, 0.25, 1),
    transform 1s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.offset-small {
  transform: translateY(50px); /* Offset for small */
}

.offset-medium {
  transform: translateY(100px); /* Offset for medium */
}

.offset-large {
  transform: translateY(150px); /* Offset for large */
}

.column-image.visible {
  opacity: 1; /* Image fades in when visible */
  transform: translateY(0); /* Reset offset */
}

.v-col {
  height: 80vh; /* Example height */
}
</style>

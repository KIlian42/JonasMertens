<template>
  <v-container fluid class="pa-0 ma-0 container">
    <Loading_component v-show="isLoading"></Loading_component>
    <template v-for="(rowImages, rowIndex) in images" :key="`row-${rowIndex}`">
      <v-row no-gutters class="pa-0 ma-0 rowelement">
        <v-col
          v-for="(img, colIndex) in rowImages"
          :key="`col-${rowIndex}-${colIndex}`"
          cols="12"
          :lg="12 / rowImages.length"
          md="6"
          sm="12"
          class="colelement"
        >
          <v-container fluid class="element">
            <v-container fluid class="child">
              <img :src="img.src" class="childimg" />
              <div>
                {{ img.title }} <br />
                {{ img.description }}
              </div>
            </v-container>
          </v-container>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { projectStore } from '@/stores/projectStore'
import Loading_component from '../Loading_component/Loading_component.vue'

const isLoading = ref(true)

const images = computed(() => projectStore.getImages) // images ist ein Array von Arrays

const loadImages = async () => {
  await projectStore.loadImagesFromGitHub()
  isLoading.value = false
}
loadImages()
</script>

<style scoped>
@import url('./Project_component.css');
</style>

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
    <div class="addButton">
      <div class="addButtonInner">
        <div class="add-image-button">
          <v-icon size="61" class="add">mdi-plus-circle</v-icon>
        </div>
      </div>
    </div>
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

.addButton {
  width: 100%;
  height: 150px;
  padding: 20px 20px;
}

.addButtonInner {
  width: 100%;
  height: 100%;
  border: solid black 1px;
  border-radius: 50px;
  transition: ease 0.3s;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.6);
}

.addButtonInner:hover {
  transform: scale(1.01);
  cursor: pointer;
  .add-image-button {
    background: linear-gradient(70deg, #ff0000, #ff7f00, #ffff00, lightgreen, #0000ff);
  }
}

.add-image-button {
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: white;
}
</style>

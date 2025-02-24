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
    <div
      v-show="editMenuOpen"
      style="
        height: 300px;
        background-color: #ebeaea;
        border-bottom: solid 1px black;
        border-top: solid 1px black;
      "
    ></div>
    <div v-show="!editMenuOpen" class="addButton">
      <div class="addButtonInner">
        <div class="addRowButton" @click="updateEditMenuOpen">
          <v-icon size="61" class="add">mdi-plus-circle</v-icon>
        </div>
      </div>
    </div>
    <div class="editMenu" :class="{ open: editMenuOpen }">
      <!-- <v-select
        v-model="anzahl"
        :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
        label="Anzahl Spalten"
        outlined
        dense
        @change="updateAnzahl"
      ></v-select>
      <v-select v-model="indexSpalte" :items="selectItems" label="Spalte" outlined dense></v-select> -->
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { projectStore } from '@/stores/projectStore'
import Loading_component from '../Loading_component/Loading_component.vue'

const isLoading = ref(true)

const images = computed(() => projectStore.getImages) // images ist ein Array von Arrays

const loadImages = async () => {
  isLoading.value = true
  await projectStore.loadImagesFromGitHub()
  isLoading.value = false
}

onMounted(() => {
  loadImages()
})

const editMenuOpen = ref<boolean>(false)

const updateEditMenuOpen = () => {
  editMenuOpen.value = !editMenuOpen.value
  // Warte 300ms, bis das Menü animiert oder gerendert wurde
  setTimeout(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth', // Optional: sanfter Übergang
    })
  }, 250)
}
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
  .addRowButton {
    background: linear-gradient(70deg, #ff0000, #ff7f00, #ffff00, lightgreen, #0000ff);
  }
}

.addRowButton {
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

.editMenu {
  position: relative;
  background: linear-gradient(to right, #0065a9, #7fa9c2 30%, #7fa9c2 70%, #0065a9);
  bottom: 0;
  height: 0;
  width: 100%;
  overflow: hidden;
  transition: height 0.3s ease;
  border-bottom: 1px solid black;
}

.editMenu.open {
  height: 200px;
}
</style>

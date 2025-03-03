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
    <v-container v-show="editMenuOpen" fluid class="pa-0 ma-0" style="background-color: #ebeaea">
      <v-row class="ma-0 pa-0">
        <v-col
          class="ma-0"
          v-for="(_, index) in anzahl"
          :key="index"
          :cols="colSize"
          style="
            border: 1px solid black;
            height: auto;
            box-sizing: border-box;
            padding: 20px important!;
          "
        >
          <div style="height: 300px; background-color: red; border-radius: 20px">Hallo</div>
        </v-col>
      </v-row>
    </v-container>
    <div v-show="!editMenuOpen" class="addButton">
      <div class="addButtonInner">
        <div class="addRowButton" @click="updateEditMenuOpen">
          <v-icon size="61" class="add">mdi-plus-circle</v-icon>
        </div>
      </div>
    </div>
    <div class="editMenu" :class="{ open: editMenuOpen }">
      <v-row class="ma-0 pa-0">
        <v-col cols="12" sm="12" md="6" class="ma-0 pa-2">
          <v-select
            v-model="anzahl"
            :items="[1, 2, 3, 4]"
            label="Anzahl Spalten"
            outlined
            dense
          ></v-select>
        </v-col>
        <v-col cols="12" sm="12" md="6" class="ma-0 pa-2">
          <v-select
            v-model="selectedColumn"
            :items="columnItems"
            label="Ausgewählte Spalte"
            outlined
            dense
          ></v-select>
        </v-col>
        <v-col cols="12" sm="12" md="6" class="ma-0 pa-2">
          <v-text-field
            v-model.number="width[selectedColumn]"
            label="Breite"
            type="number"
            outlined
            dense
            step="1"
            min="0"
            @input="width[selectedColumn] = Math.round(width[selectedColumn] || 0)"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="12" md="6" class="ma-0 pa-2">
          <v-text-field
            v-model.number="height[selectedColumn]"
            label="Höhe"
            type="number"
            outlined
            dense
            step="1"
            min="0"
            @input="height[selectedColumn] = Math.round(height[selectedColumn] || 0)"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="12" md="6" class="ma-0 pa-2">
          <v-text-field
            v-model.number="padding[selectedColumn]"
            label="Abstand"
            type="number"
            outlined
            dense
            step="1"
            min="0"
            @input="padding[selectedColumn] = Math.round(padding[selectedColumn] || 0)"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="12" md="6" class="ma-0 pa-2">
          <v-text-field
            v-model.number="borderRadius[selectedColumn]"
            label="Gerundete Ecken"
            type="number"
            outlined
            dense
            step="1"
            min="0"
            @input="borderRadius[selectedColumn] = Math.round(borderRadius[selectedColumn] || 0)"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" class="pa-1">
          <v-text-field v-model="title[selectedColumn]" label="Titel" outlined dense></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" class="pa-1">
          <v-text-field
            v-model="description[selectedColumn]"
            label="Bildbeschreibung"
            outlined
            dense
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" class="pa-1">
          <v-select
            v-model="fitOption[selectedColumn]"
            :items="['fill', 'contain', 'cover']"
            label="Fit-Option"
            outlined
            dense
          ></v-select>
        </v-col>
        <v-col cols="12" sm="6" class="pa-1">
          <v-select
            v-model="visible[selectedColumn]"
            :items="['true', 'false']"
            label="Sichtbar"
            outlined
            dense
          ></v-select>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { projectStore } from '@/stores/projectStore'
import Loading_component from '../Loading_component/Loading_component.vue'

const width = ref([0, 0, 0, 0])
const height = ref([0, 0, 0, 0])
const padding = ref([0, 0, 0, 0])
const borderRadius = ref([0, 0, 0, 0])
const title = ref(['', '', '', ''])
const description = ref(['', '', '', ''])
const fitOption = ref(['fill', 'fill', 'fill', 'fill'])
const visible = ref([true, true, true, true])
const anzahl = ref(1)
const colSize = computed(() => Math.floor(12 / anzahl.value))
const selectedColumn = ref(1)
const columnItems = computed(() => {
  const items = []
  // Erstelle ein Array mit Werten von 1 bis anzahl
  for (let i = 1; i <= anzahl.value; i++) {
    items.push(i)
  }
  return items
})

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
</style>

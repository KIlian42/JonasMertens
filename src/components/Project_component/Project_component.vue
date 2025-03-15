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
            border-bottom: 1px solid black;
            height: auto;
            box-sizing: border-box;
            padding: 20px important!;
            display: flex;
            align-items: center;
            justify-content: center;
          "
          :style="{ 'border-right': index !== anzahl - 1 ? '1px solid black' : '' }"
        >
          <div
            class="newimageelement"
            @click="triggerFileInput(index)"
            @dragover.prevent
            @drop.prevent="onDropFile($event, index)"
            :style="
              imgurls[index]
                ? {
                    backgroundImage: 'url(' + imgurls[index] + ')',
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }
                : {}
            "
          >
            <span v-if="!imgurls[index]">Bild hinzufügen</span>
          </div>
          <input
            type="file"
            ref="fileInput"
            style="display: none"
            @change="onDropBackgroundImage"
          />
        </v-col>
      </v-row>
    </v-container>
    <div v-show="!editMenuOpen" class="addButton" @click="updateEditMenuOpen">
      <div class="addButtonInner">
        <div class="addRowButton">
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
const visible = ref(['Ja', 'Ja', 'Ja', 'Ja'])
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
const imgurls = ref(['', '', ''])

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

const fileInput = ref<HTMLInputElement | null>(null)
// Optional: Speichere den aktuell ausgewählten Index, wenn du auch über den Klick-Input arbeitest
const currentIndex = ref<number | null>(null)

// Klick-Handler: Setzt den aktuellen Index und öffnet den versteckten File-Input
const triggerFileInput = (index: number) => {
  currentIndex.value = index
  if (Array.isArray(fileInput.value)) {
    fileInput.value[index].click()
  } else {
    fileInput.value?.click()
  }
}

// Change-Handler für den File-Input (beim Klick)
const onDropBackgroundImage = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0] && currentIndex.value !== null) {
    imgurls.value[currentIndex.value] = URL.createObjectURL(target.files[0])
    console.log('Added image via click:', imgurls.value[currentIndex.value])
  }
}

// Drop-Handler für Drag-and-Drop
const onDropFile = (event: DragEvent, index: number) => {
  const files = event.dataTransfer?.files
  if (files && files[0]) {
    imgurls.value[index] = URL.createObjectURL(files[0])
    console.log('Added image via drop:', imgurls.value[index])
  }
}
</script>

<style scoped>
@import url('./Project_component.css');
</style>

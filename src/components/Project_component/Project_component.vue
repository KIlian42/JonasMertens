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
    <v-container v-show="editMenuOpen" fluid class="pa-0 ma-0">
      <v-row class="ma-0 pa-0">
        <v-col
          class="ma-0 pa-0"
          v-for="(_, index) in anzahl"
          :key="index"
          :cols="colSize"
          style="border-bottom: 1px solid black; height: auto; overflow: scroll"
          :style="{ 'border-right': index !== anzahl - 1 ? '1px solid black' : '' }"
        >
          <div
            style="display: flex; align-items: center; justify-content: center; overflow: scroll"
            :style="{ padding: allPadding[index] + 'px' }"
          >
            <div
              class="newimageelement"
              @click="triggerFileInput(index)"
              @dragover.prevent
              @drop.prevent="onDropFile($event, index)"
              :style="{
                width: allWidth[index] + 'px',
                height: allHeight[index] + 'px',
                borderRadius: allBorderRadius[index] + 'px',
                ...(imgurls[index]
                  ? {
                      backgroundImage: 'url(' + imgurls[index] + ')',
                      backgroundSize: mapFitOption(allFitOption[index]),
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    }
                  : {}),
              }"
            >
              <span v-if="!imgurls[index]"><p>Bild hinzufügen</p></span>
            </div>
          </div>
          <input
            type="file"
            ref="fileInput"
            style="display: none"
            @change="onDropBackgroundImage"
          />
          <!-- Textcontainer unter dem Bild -->
          <div class="caption" style="margin-top: 10px; text-align: center">
            <div v-if="allTitle[index]">{{ allTitle[index] }}</div>
            <div v-if="allDescription[index]">{{ allDescription[index] }}</div>
          </div>
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
            v-model.number="allWidth[selectedColumn - 1]"
            label="Breite"
            type="number"
            outlined
            dense
            step="1"
            min="0"
            @input="allWidth[selectedColumn - 1] = Math.round(allWidth[selectedColumn - 1] || 0)"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="12" md="6" class="ma-0 pa-2">
          <v-text-field
            v-model.number="allHeight[selectedColumn - 1]"
            label="Höhe"
            type="number"
            outlined
            dense
            step="1"
            min="0"
            @input="allHeight[selectedColumn - 1] = Math.round(allHeight[selectedColumn - 1] || 0)"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="12" md="6" class="ma-0 pa-2">
          <v-text-field
            v-model.number="allPadding[selectedColumn - 1]"
            label="Abstand"
            type="number"
            outlined
            dense
            step="1"
            min="0"
            @input="
              allPadding[selectedColumn - 1] = Math.round(allPadding[selectedColumn - 1] || 0)
            "
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="12" md="6" class="ma-0 pa-2">
          <v-text-field
            v-model.number="allBorderRadius[selectedColumn - 1]"
            label="Gerundete Ecken"
            type="number"
            outlined
            dense
            step="1"
            min="0"
            @input="
              allBorderRadius[selectedColumn - 1] = Math.round(
                allBorderRadius[selectedColumn - 1] || 0,
              )
            "
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" class="pa-1">
          <v-text-field
            v-model="allTitle[selectedColumn - 1]"
            label="Titel"
            outlined
            dense
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" class="pa-1">
          <v-text-field
            v-model="allDescription[selectedColumn - 1]"
            label="Bildbeschreibung"
            outlined
            dense
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" class="pa-1">
          <v-select
            v-model="allFitOption[selectedColumn - 1]"
            :items="['Angepasst', 'Vollständig', 'Gefüllt']"
            label="Fit-Option"
            outlined
            dense
          ></v-select>
        </v-col>
        <v-col cols="12" sm="6" class="pa-1">
          <v-select
            v-model="allVisible[selectedColumn - 1]"
            :items="['Ja', 'Nein']"
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

const allWidth = ref([600, 600, 600, 600])
const allHeight = ref([600, 600, 600, 600])
const allPadding = ref([10, 10, 10, 10])
const allBorderRadius = ref([0, 0, 0, 0])
const allTitle = ref(['', '', '', ''])
const allDescription = ref(['', '', '', ''])
const allFitOption = ref(['Angepasst', 'Angepasst', 'Angepasst', 'Angepasst'])
const allVisible = ref(['Ja', 'Ja', 'Ja', 'Ja'])
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

const mapFitOption = (fitOption: string): string => {
  if (fitOption === 'Vollständig') return 'contain'
  else if (fitOption === 'Gefüllt') return 'cover'
  else if (fitOption === 'Angepasst') return '100% 100%' // fitOption === Angepasst
}
</script>

<style scoped>
@import url('./Project_component.css');
</style>

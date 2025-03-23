<template>
  <v-container fluid class="pa-0 ma-0 container">
    <Loading_component v-show="isLoading"></Loading_component>
    <template v-for="(rowImages, rowIndex) in images" :key="`row-${rowIndex}`">
      <v-row no-gutters class="pa-0 ma-0 rowelement">
        <v-col
          v-for="(img, colIndex) in rowImages"
          :key="`col-${rowIndex}-${colIndex}`"
          xs="12"
          sm="12"
          md="12"
          :lg="12 / rowImages.length"
          class="ma-0 pa-0 colelement"
        >
          <v-container fluid class="element">
            <v-container fluid class="child">
              <div
                style="display: flex; align-items: center; justify-content: center"
                :style="{ padding: img.padding + 'px' }"
              >
                <div
                  class="newimageelement"
                  :style="{
                    position: 'relative',
                    width: img.width + 'px',
                    height: img.height + 'px',
                    borderRadius: img.border_radius + 'px',
                    backgroundImage: 'url(' + img.src + ')',
                    backgroundSize: mapFitOption(img.objectFit),
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }"
                >
                  <div
                    class="edit-button"
                    @click="editImage(rowIndex, colIndex)"
                    style="position: absolute; right: 10px; bottom: 13px"
                  >
                    <v-icon size="40" color="white"> mdi-pencil </v-icon>
                  </div>
                  <div
                    class="delete-button"
                    @click="deleteImage(rowIndex, colIndex)"
                    style="position: absolute; left: 10px; bottom: 13px"
                  >
                    <v-icon size="40" color="white"> mdi-delete </v-icon>
                  </div>
                </div>
              </div>
              <div class="caption" style="margin-top: 10px; text-align: center">
                <div v-if="img.title">{{ img.title }}</div>
                <div v-if="img.description">{{ img.description }}</div>
              </div>
            </v-container>
          </v-container>
        </v-col>
      </v-row>
    </template>
    <v-container v-show="editMenuOpen" fluid class="pa-0 ma-0">
      <v-row class="ma-0 pa-0">
        <v-col
          xs="12"
          sm="12"
          md="6"
          :lg="12 / numberColumns"
          class="ma-0 pa-0"
          v-for="(_, index) in numberColumns"
          :key="index"
          style="height: auto"
        >
          <div
            style="display: flex; align-items: center; justify-content: center"
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
                ...(allNewImgUrls[index]
                  ? {
                      backgroundImage: 'url(' + allNewImgUrls[index] + ')',
                      backgroundSize: mapFitOption(allFitOption[index]),
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    }
                  : {}),
              }"
            >
              <span v-if="!allNewImgUrls[index]"><b>Bild hinzufügen</b></span>
            </div>
          </div>
          <div class="caption" style="margin-top: 10px; text-align: center">
            <div v-if="allTitle[index]">{{ allTitle[index] }}</div>
            <div v-if="allDescription[index]">{{ allDescription[index] }}</div>
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
    <div v-show="loggedIn && !editMenuOpen" class="addButton" @click="updateEditMenuOpen">
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
            v-model="numberColumns"
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
        <v-col cols="12" sm="12" md="6" class="ma-0 pa-2">
          <v-text-field
            v-model="allTitle[selectedColumn - 1]"
            label="Titel"
            outlined
            dense
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="12" md="6" class="ma-0 pa-2">
          <v-text-field
            v-model="allDescription[selectedColumn - 1]"
            label="Bildbeschreibung"
            outlined
            dense
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="12" md="6" class="ma-0 pa-2">
          <v-select
            v-model="allFitOption[selectedColumn - 1]"
            :items="['Angepasst', 'Vollständig', 'Gefüllt']"
            label="Fit-Option"
            outlined
            dense
          ></v-select>
        </v-col>
        <v-col cols="12" sm="12" md="6" class="ma-0 pa-2">
          <v-select
            v-model="allVisible[selectedColumn - 1]"
            :items="['Ja', 'Nein']"
            label="Sichtbar"
            outlined
            dense
            disabled
          ></v-select>
        </v-col>
        <v-col cols="12" sm="12" md="6" class="ma-0 pa-2">
          <v-btn color="#333333" @click="addImages">Speichern</v-btn>
        </v-col>
        <v-col cols="12" sm="12" md="6" class="ma-0 pa-2">
          <v-btn color="#333333" @click="closeEditMenu">Abbrechen</v-btn>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { authStore } from '@/stores/authStore'
import { projectStore } from '@/stores/projectStore'
import Loading_component from '../Loading_component/Loading_component.vue'
import { v4 as uuidv4 } from 'uuid'

const loggedIn = authStore.loggedIn
const isLoading = ref(true)
const loadImages = async () => {
  isLoading.value = true
  await projectStore.loadImagesFromGitHub()
  isLoading.value = false
}

onMounted(async () => {
  await loadImages()
})
const images = computed(() => projectStore.getImages)

const numberColumns = ref(1)
const selectedColumn = ref(1)
const allWidth = ref([600, 600, 600, 600])
const allHeight = ref([600, 600, 600, 600])
const allPadding = ref([10, 10, 10, 10])
const allBorderRadius = ref([10, 10, 10, 10])
const allTitle = ref(['', '', '', ''])
const allDescription = ref(['', '', '', ''])
const allFitOption = ref(['Angepasst', 'Angepasst', 'Angepasst', 'Angepasst'])
const allVisible = ref(['Ja', 'Ja', 'Ja', 'Ja'])
const allNewImgUrls = ref(['', '', '', ''])

const editMenuOpen = ref<boolean>(false)
const fileInput = ref<HTMLInputElement | null>(null)
const currentIndex = ref<number | null>(null)

// Reactive for numberColumns dropdown
const columnItems = computed(() => {
  const items = []
  for (let i = 1; i <= numberColumns.value; i++) {
    items.push(i)
  }
  items.push('Alle')
  return items
})

const updateEditMenuOpen = () => {
  editMenuOpen.value = !editMenuOpen.value
  setTimeout(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth', // Optional: sanfter Übergang
    })
  }, 250)
}

const triggerFileInput = (index: number) => {
  currentIndex.value = index
  if (Array.isArray(fileInput.value)) {
    fileInput.value[index].click()
  } else {
    fileInput.value?.click()
  }
}

const onDropBackgroundImage = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0] && currentIndex.value !== null) {
    allNewImgUrls.value[currentIndex.value] = URL.createObjectURL(target.files[0])
  }
}

const onDropFile = (event: DragEvent, index: number) => {
  const files = event.dataTransfer?.files
  if (files && files[0]) {
    allNewImgUrls.value[index] = URL.createObjectURL(files[0])
  }
}

const mapFitOption = (fitOption: string): string => {
  if (fitOption === 'Vollständig') return 'contain'
  else if (fitOption === 'Gefüllt') return 'cover'
  else return '100% 100%' // fitOption === Angepasst
}

const closeEditMenu = () => {
  editMenuOpen.value = false
}

const addImages = async (): Promise<boolean> => {
  editMenuOpen.value = false
  isLoading.value = true
  const addedImagesName = []
  const addedImagesSrc = []
  const newRow = []
  for (let i = 0; i < numberColumns.value; i++) {
    const uuid = uuidv4()
    const fileName = uuid + '.png'
    addedImagesName.push(fileName)
    addedImagesSrc.push(allNewImgUrls.value[i])
    newRow.push({
      id: uuid,
      src: allNewImgUrls.value[i],
      width: allWidth.value[i],
      height: allHeight.value[i],
      padding: allPadding.value[i],
      border_radius: allBorderRadius.value[i],
      title: allTitle.value[i],
      description: allDescription.value[i],
      objectFit: allFitOption.value[i],
      visible: allVisible.value[i],
      subpage: '',
    })
  }
  undoEdit()
  images.value.push(newRow)
  await projectStore.uploadImagesOnGithub(addedImagesName, addedImagesSrc)
  await updateProjectSettingsInStore()
  closeEditMenu()
  window.scrollTo({
    top: document.body.scrollHeight,
  })
  isLoading.value = false
  return true
}

const editImage = async (rowIndex: number, colIndex: number = -1) => {}

const deleteImage = async (rowIndex: number, colIndex: number = -1) => {
  isLoading.value = true
  const deletedImagesName: string[] = []
  const newImages = images.value.map((row: any) => [...row])
  if (colIndex !== -1) {
    deletedImagesName.push(newImages[rowIndex][colIndex].id + '.png')
    newImages[rowIndex].splice(colIndex, 1)
    if (newImages[rowIndex].length === 0) {
      newImages.splice(rowIndex, 1)
    }
  } else {
    for (const image of newImages[rowIndex]) {
      deletedImagesName.push(image.id + '.png')
    }
    newImages.splice(rowIndex, 1)
  }
  projectStore.setImages(newImages)
  await updateProjectSettingsInStore()
  window.scrollTo({
    top: document.body.scrollHeight,
  })
  await projectStore.deleteImagesOnGithub(deletedImagesName)
  isLoading.value = false
  return true
}

const updateProjectSettingsInStore = async (): Promise<boolean> => {
  projectStore.setImages(images.value)
  await projectStore.updateProjectSettingsOnGithub()
  await projectStore.loadImagesFromGitHub()
  return true
}

const undoEdit = () => {
  numberColumns.value = 1
  selectedColumn.value = 1
  allWidth.value = [600, 600, 600, 600]
  allHeight.value = [600, 600, 600, 600]
  allPadding.value = [10, 10, 10, 10]
  allBorderRadius.value = [10, 10, 10, 10]
  allTitle.value = ['', '', '', '']
  allDescription.value = ['', '', '', '']
  allFitOption.value = ['Angepasst', 'Angepasst', 'Angepasst', 'Angepasst']
  allVisible.value = ['Ja', 'Ja', 'Ja', 'Ja']
  allNewImgUrls.value = ['', '', '', '']
  fileInput.value = null
  currentIndex.value = null
}
</script>

<style scoped>
@import url('./Project_component.css');
</style>

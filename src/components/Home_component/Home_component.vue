<template>
  <div
    class="map-wrapper"
    @mousedown="onMouseDown"
    @contextmenu.prevent="onRightClick"
    @dragover.prevent
    @drop="onDrop"
  >
    <svg ref="svg" class="map-container"></svg>
    <btn
      v-if="loggedIn"
      icon
      class="add-image-button"
      @click="((editImageCheck = false), openPopup())"
    >
      <v-icon size="62">mdi-plus-circle</v-icon>
    </btn>

    <v-dialog v-model="showPopup" max-width="800">
      <v-card class="popup-card">
        <v-card-title v-if="!editImageCheck" class="text-h6">Bild hinzufügen</v-card-title>
        <v-card-title v-else class="text-h6">Bild bearbeiten</v-card-title>
        <v-card-text>
          <v-container fluid>
            <v-file-input
              v-if="!editImageCheck"
              label="Bilddatei"
              @change="onFileChange"
              outlined
              dense
            ></v-file-input>

            <v-row>
              <v-col cols="12" sm="6" class="pa-1">
                <v-text-field
                  v-model.number="newImage.x"
                  label="X-Position"
                  type="number"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" class="pa-1">
                <v-text-field
                  v-model.number="newImage.y"
                  label="Y-Position"
                  type="number"
                  outlined
                  dense
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6" class="pa-1">
                <v-text-field
                  v-model.number="newImage.width"
                  label="Breite"
                  type="number"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" class="pa-1">
                <v-text-field
                  v-model.number="newImage.height"
                  label="Höhe"
                  type="number"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" class="pa-1">
                <v-text-field
                  v-model.number="newImage.border_radius"
                  label="Gerundete Ecken"
                  type="number"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" class="pa-1">
                <v-text-field
                  v-model.number="newImage.z_index"
                  label="Hierarchie Position"
                  type="number"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" class="pa-1">
                <v-text-field v-model="newImage.title" label="Titel" outlined dense></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" class="pa-1">
                <v-text-field
                  v-model="newImage.description"
                  label="Bildbeschreibung"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12" class="pa-1">
                <v-select
                  v-model="newImage.objectFit"
                  :items="['fill', 'contain', 'cover']"
                  label="Fit-Option"
                  outlined
                  dense
                ></v-select>
              </v-col>
            </v-row>

            <v-row>
              <v-col sm="6" md="3" class="d-flex justify-center">
                <v-btn color="#333333" @click="deleteImage" v-if="editImageCheck">Löschen</v-btn>
              </v-col>
              <v-col sm="6" md="3" class="d-flex justify-center">
                <v-btn color="#333333" @click="updateShowPreview">Vorschau</v-btn>
              </v-col>
              <v-col sm="6" md="3" class="d-flex justify-center">
                <v-btn color="#333333" @click="editImage" v-if="editImageCheck">Anwenden</v-btn>
                <v-btn color="#333333" @click="addImage" v-else>Anwenden</v-btn>
              </v-col>
              <v-col sm="6" md="3" class="d-flex justify-center">
                <v-btn color="#333333" @click="closePopup">Zurück</v-btn>
              </v-col>
            </v-row>

            <div
              v-if="showPreview"
              class="image-preview"
              style="overflow: scroll; scrollbar-gutter: stable"
            >
              <br />
              <img
                v-if="newImage.src"
                :src="newImage.src"
                alt="Vorschau"
                :style="`object-fit: ${newImage.objectFit};`"
              />
              <p v-if="!newImage.src">Keine Vorschau verfügbar.</p>
            </div>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount, nextTick, computed, watch } from 'vue'
import { useImageStore } from '@/stores/imageStore'
import { useAuthStore } from '@/stores/authStore'
import * as d3 from 'd3'

const container = ref<HTMLDivElement | null>(null)
const svg = ref<SVGElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const width = ref(0)
const height = ref(0)
let leftClickActive = false
let rightClickActive = false
let mainContainer: d3.Selection<SVGGElement, unknown, null, undefined>

const imageStore = useImageStore()
const authStore = useAuthStore()

const loggedIn = authStore.loggedIn

const isLoading = ref(true)
const images = computed(() => imageStore.getImages)

const loadImages = async () => {
  await imageStore.loadImagesFromGitHub()
  isLoading.value = false
}
loadImages()

watch(isLoading, (newValue) => {
  if (!newValue) {
    renderImages()
  }
})

const showPopup = ref(false)
const editImageCheck = ref(false)
const showPreview = ref(true)
const newImage = ref({
  id: 0,
  name: '',
  src: '',
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  border_radius: 0,
  z_index: 1,
  objectFit: 'fill',
  title: '',
  description: '',
})
const selectedFile = ref<File | null>(null)

const updateSize = () => {
  if (container.value) {
    width.value = container.value.clientWidth
    height.value = container.value.clientHeight
    d3.select(svg.value).attr('width', width.value).attr('height', height.value)
  }
}

const onZoom = (event: d3.D3ZoomEvent<SVGElement, unknown>) => {
  mainContainer.attr('transform', event.transform.toString())
}

const onMouseDown = (event: MouseEvent) => {
  if (!loggedIn) return
  if (event.button === 0) leftClickActive = true
  if (event.button === 2) rightClickActive = true

  if (leftClickActive && rightClickActive) {
    editImageCheck.value = false
    openPopup()
  }
}

const onRightClick = (event: MouseEvent) => {
  if (!loggedIn) return
  event.preventDefault()
  if (!svg.value) return

  const svgElement = svg.value as SVGElement
  const transform = d3.zoomTransform(svgElement)
  const svgRect = svgElement.getBoundingClientRect()

  newImage.value.x = (event.clientX - svgRect.left - transform.x) / transform.k
  newImage.value.y = (event.clientY - svgRect.top - transform.y) / transform.k

  editImageCheck.value = false
  openPopup()
}

const updateShowPreview = () => {
  showPreview.value = !showPreview.value
}

const openPopup = () => {
  showPopup.value = true
}

const closePopup = () => {
  showPopup.value = false
  selectedFile.value = null
  newImage.value.src = ''
  newImage.value = {
    id: 0,
    name: '',
    src: '',
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    border_radius: 0,
    z_index: 1,
    objectFit: 'fill',
    title: '',
    description: '',
  }
}

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
    newImage.value.src = URL.createObjectURL(selectedFile.value)
  }
}

const addImage = async () => {
  if (selectedFile.value) {
    const imageName = `image_${Date.now()}.${selectedFile.value.name.split('.').pop()}`
    const reader = new FileReader()

    reader.onload = async (e) => {
      const base64String = (e.target?.result as string).split(',')[1]
      await imageStore.addImage({
        ...newImage.value,
        src: newImage.value.src,
        name: imageName,
      })
      renderImages()
      closePopup()
    }

    reader.readAsDataURL(selectedFile.value)
  }
}

const editImage = async () => {
  if (selectedFile.value) {
    const reader = new FileReader()

    reader.onload = async (e) => {
      await imageStore.editImage({
        ...newImage.value,
      })
      renderImages()
      closePopup()
    }

    reader.readAsDataURL(selectedFile.value)
  }
}

const deleteImage = async () => {
  if (selectedFile.value) {
    const reader = new FileReader()

    reader.onload = async (e) => {
      await imageStore.deleteImage(newImage.value.id)
      renderImages()
      closePopup()
    }

    reader.readAsDataURL(selectedFile.value)
  }
}

const onDrop = async (event: DragEvent) => {
  if (!loggedIn) return
  event.preventDefault()
  if (!event.clientX || !event.clientY || !svg.value || !event.dataTransfer?.files.length) return

  const svgElement = svg.value as SVGElement
  const transform = d3.zoomTransform(svgElement)
  const svgRect = svgElement.getBoundingClientRect()

  const x = (event.clientX - svgRect.left - transform.x) / transform.k
  const y = (event.clientY - svgRect.top - transform.y) / transform.k

  selectedFile.value = event.dataTransfer.files[0]
  newImage.value = {
    id: 0,
    name: '',
    src: URL.createObjectURL(selectedFile.value),
    x,
    y,
    width: 100,
    height: 100,
    border_radius: 0,
    z_index: 1,
    objectFit: 'fill',
    title: '',
    description: '',
  }

  showPopup.value = true
}

const renderImages = () => {
  if (!mainContainer) return
  mainContainer.selectAll('g.image-group').remove()

  images.value.forEach((img, index) => {
    const group = mainContainer.append('g').attr('class', 'image-group')

    // Definiere das Clip-Path
    const clipPathId = `clip-path-${index}`
    mainContainer
      .append('defs')
      .append('clipPath')
      .attr('id', clipPathId)
      .append('rect')
      .attr('x', img.x)
      .attr('y', img.y)
      .attr('width', img.width)
      .attr('height', img.height)
      .attr('rx', img.border_radius ?? 20) // Radius für Abrundung
      .attr('ry', img.border_radius ?? 20)

    // Rahmen
    const border = group
      .append('rect')
      .attr('x', img.x)
      .attr('y', img.y)
      .attr('width', img.width)
      .attr('height', img.height)
      .attr('rx', img.border_radius ?? 20)
      .attr('ry', img.border_radius ?? 20)
      .attr('fill', 'none')
      .attr('stroke', 'orange')
      .attr('stroke-width', 10)
      .style('opacity', 0)

    // Bild mit Clip-Path
    const imageElement = group
      .append('image')
      .attr('x', img.x)
      .attr('y', img.y)
      .attr('width', img.width)
      .attr('height', img.height)
      .attr('href', img.src)
      .attr('alt', img.description)
      .attr('preserveAspectRatio', 'none') // Objekt soll den Bereich füllen
      .attr('clip-path', `url(#${clipPathId})`) // Clip-Path für Abrundung
      .style('cursor', 'pointer')
      .on('mouseover', function () {
        border.style('opacity', 1)
      })
      .on('mouseout', function () {
        border.style('opacity', 0)
      })
      .on('click', function () {
        if (loggedIn == true) {
          newImage.value = {
            id: img.id ? img.id : 0,
            name: img.name ? img.name : '',
            src: img.src,
            x: img.x,
            y: img.y,
            width: img.width,
            height: img.height,
            border_radius: img.border_radius,
            z_index: img.z_index,
            objectFit: img.objectFit,
            title: img.title,
            description: img.description,
          }

          showPopup.value = true
          editImageCheck.value = true
        }
      })
  })
}

const initView = (ref: SVGElement | null) => {
  if (!ref) return

  const svg = d3.select(ref)
  mainContainer = svg.append('g').classed('container', true)

  const zoom = d3
    .zoom<SVGElement, unknown>()
    .scaleExtent([0.01, 1000]) // Min- und Max-Zoom
    .on('zoom', onZoom)
    .filter((event: any) => !(event.type === 'wheel' && event.ctrlKey))

  svg.call(zoom)

  // Initial View (Zoom und Position)
  let initialZoomLevel = 1.1 // Zoom 150%
  let initialX = 810 // Standardposition
  let initialY = 350 // 50px nach unten verschoben

  // Anpassung der X-Position bei kleineren Bildschirmen
  if (window.innerWidth < 1200) {
    initialZoomLevel = 0.41
    initialX -= 635
    initialY += 20
  }

  const initialView = d3.zoomIdentity.translate(initialX, initialY).scale(initialZoomLevel)

  svg.call(zoom.transform, initialView)
}

onMounted(() => {
  nextTick(() => {
    updateSize()
    initView(svg.value)
    window.addEventListener('resize', updateSize)
    window.addEventListener('mouseup', () => {
      leftClickActive = false
      rightClickActive = false
    })
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateSize)
  window.removeEventListener('mouseup', () => {
    leftClickActive = false
    rightClickActive = false
  })
})
</script>

<style>
@import url('./Home_component.css');
</style>

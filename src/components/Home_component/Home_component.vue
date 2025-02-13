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
      @click="
        (() => {
          editImageCheck = false
          openPopup()
        })()
      "
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
              v-model="selectedFile"
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
                  step="1"
                  @input="newImage.x = Math.round(newImage.x || 0)"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" class="pa-1">
                <v-text-field
                  v-model.number="newImage.y"
                  label="Y-Position"
                  type="number"
                  outlined
                  dense
                  step="1"
                  @input="newImage.y = Math.round(newImage.y || 0)"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6" class="pa-1">
                <v-text-field
                  v-model.number="newImage.width"
                  label="Breite"
                  type="number"
                  outlined
                  dense
                  step="1"
                  min="0"
                  @input="newImage.width = Math.round(newImage.width || 0)"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" class="pa-1">
                <v-text-field
                  v-model.number="newImage.height"
                  label="Höhe"
                  type="number"
                  outlined
                  dense
                  step="1"
                  min="0"
                  @input="newImage.height = Math.round(newImage.height || 0)"
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
            <br v-if="showPreview" />
            <br v-if="showPreview" />
            <div
              v-if="showPreview"
              class="image-preview"
              style="overflow: scroll; scrollbar-gutter: stable; text-align: center"
            >
              <img
                v-if="newImage.src"
                :src="`${newImage.src}`"
                alt="Vorschau"
                :width="`${newImage.width}`"
                :height="`${newImage.height}`"
                :style="`object-fit: ${newImage.objectFit};border-radius: ${newImage.border_radius}px`"
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

/* -------------------------
   Globale Variablen & Stores
------------------------- */
const container = ref<HTMLDivElement | null>(null)
const svg = ref<SVGElement | null>(null)
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
  if (!newValue) renderImages()
})

/* -------------------------
   Default Image & Helper-Funktion
------------------------- */
const defaultImage = {
  id: 0,
  name: '',
  src: '',
  x: 0,
  y: 0,
  width: 500,
  height: 500,
  border_radius: 0,
  z_index: 1,
  objectFit: 'fill',
  title: '',
  description: '',
}

function getDefaultImage(overrides = {}) {
  return { ...defaultImage, ...overrides }
}

/* -------------------------
   Zustandsvariablen
------------------------- */
const showPopup = ref(false)
const editImageCheck = ref(false)
const showPreview = ref(true)
const selectedFile = ref<File | null>(null)
const newImage = ref(getDefaultImage())

/* -------------------------
   Methoden & Event-Handler
------------------------- */
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

  const svgElement = svg.value
  const transform = d3.zoomTransform(svgElement)
  const svgRect = svgElement.getBoundingClientRect()

  newImage.value.x = Math.round((event.clientX - svgRect.left - transform.x) / transform.k || 0)
  newImage.value.y = Math.round((event.clientY - svgRect.top - transform.y) / transform.k || 0)

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
  console.log('close Popup')
  showPopup.value = false
  selectedFile.value = null
  newImage.value = getDefaultImage()
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
  try {
    await imageStore.editImage({ ...newImage.value })
    await imageStore.loadImagesFromGitHub()
    renderImages()
    closePopup()
  } catch (error) {
    console.error('Fehler beim Bearbeiten des Bildes:', error)
  }
}

const deleteImage = async () => {
  try {
    await imageStore.deleteImage(newImage.value.id)
    await imageStore.loadImagesFromGitHub()
    renderImages()
    closePopup()
  } catch (error) {
    console.error('Fehler beim Bearbeiten des Bildes:', error)
  }
}

const onDrop = async (event: DragEvent) => {
  if (!loggedIn) return
  event.preventDefault()
  if (!event.clientX || !event.clientY || !svg.value || !event.dataTransfer?.files.length) return

  const svgElement = svg.value
  const transform = d3.zoomTransform(svgElement)
  const svgRect = svgElement.getBoundingClientRect()
  const x = Math.round((event.clientX - svgRect.left - transform.x) / transform.k || 0)
  const y = Math.round((event.clientY - svgRect.top - transform.y) / transform.k || 0)

  selectedFile.value = event.dataTransfer.files[0]
  newImage.value = getDefaultImage({
    src: URL.createObjectURL(selectedFile.value),
    x,
    y,
  })

  showPopup.value = true
}

const renderImages = () => {
  if (!mainContainer) return

  // Entferne alle Inhalte (sowohl Gruppen als auch defs)
  mainContainer.selectAll('*').remove()

  // Erstelle einen neuen defs-Container für die ClipPaths
  const defs = mainContainer.append('defs')

  // Hilfsfunktion zum Escapen von Sonderzeichen (z. B. Umlauten)
  const escapeHTML = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')

  images.value.forEach((img, index) => {
    const group = mainContainer.append('g').attr('class', 'image-group')
    const clipPathId = `clip-path-${index}`

    // Erstelle den ClipPath im defs-Container
    defs
      .append('clipPath')
      .attr('id', clipPathId)
      .append('rect')
      .attr('x', img.x)
      .attr('y', img.y)
      .attr('width', img.width)
      .attr('height', img.height)
      .attr('rx', img.border_radius ?? 20)
      .attr('ry', img.border_radius ?? 20)

    // Rahmen (zur Hervorhebung beim Mouseover)
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

    // Bild hinzufügen und den ClipPath anwenden
    group
      .append('image')
      .attr('x', img.x)
      .attr('y', img.y)
      .attr('width', img.width)
      .attr('height', img.height)
      .attr('href', img.src)
      .attr('alt', img.description)
      .attr('preserveAspectRatio', 'none')
      .attr('clip-path', `url(#${clipPathId})`)
      .style('cursor', 'pointer')
      .on('mouseover', () => border.style('opacity', 1))
      .on('mouseout', () => border.style('opacity', 0))
      .on('click', () => {
        if (loggedIn) {
          newImage.value = getDefaultImage({
            id: img.id,
            name: img.name,
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
          })
          showPopup.value = true
          editImageCheck.value = true
        }
      })

    // Überschrift (Titel) als HTML-Element in foreignObject einbetten
    group
      .append('foreignObject')
      .attr('x', img.x)
      .attr('y', img.y + img.height + 20)
      .attr('width', img.width)
      .attr('height', 40)
      .append('xhtml:div')
      .attr('xmlns', 'http://www.w3.org/1999/xhtml').html(`
        <html>
          <head>
            <meta charset="UTF-8" />
          </head>
          <body style="margin:0; font-size:16px; font-weight:bold; color:#000; line-height:1.2;">
            <p style="margin:0;">${escapeHTML(img.title)}</p>
          </body>
        </html>
      `)

    // Beschreibung als HTML-Element in foreignObject einbetten
    group
      .append('foreignObject')
      .attr('x', img.x)
      .attr('y', img.y + img.height + 60)
      .attr('width', img.width)
      .attr('height', 1000)
      .append('xhtml:div')
      .attr('xmlns', 'http://www.w3.org/1999/xhtml').html(`
        <html>
          <head>
            <meta charset="UTF-8" />
          </head>
          <body style="margin:0; font-size:14px; color:#333; line-height:1.2;">
            <p style="margin:0;">${escapeHTML(img.description)}</p>
          </body>
        </html>
      `)
  })
}

const initView = (ref: SVGElement | null) => {
  if (!ref) return
  const svgSel = d3.select(ref)
  mainContainer = svgSel.append('g').classed('container', true)

  const zoom = d3
    .zoom<SVGElement, unknown>()
    .scaleExtent([0.01, 1000])
    .on('zoom', onZoom)
    .filter((event: any) => !(event.type === 'wheel' && event.ctrlKey))

  svgSel.call(zoom)

  // Initialer View-Zoom und -Position
  let initialZoomLevel = 1.1
  let initialX = 810
  let initialY = 350

  if (window.innerWidth < 1200) {
    initialZoomLevel = 0.41
    initialX -= 635
    initialY += 20
  }

  const initialView = d3.zoomIdentity.translate(initialX, initialY).scale(initialZoomLevel)
  svgSel.call(zoom.transform, initialView)
}

// Definiere die Funktion, die auf 'mouseup' reagiert, um beide Klick-Flags zurückzusetzen
const handleMouseUp = () => {
  leftClickActive = false
  rightClickActive = false
}

onMounted(() => {
  nextTick(() => {
    updateSize()
    initView(svg.value)
    window.addEventListener('resize', updateSize)
    window.addEventListener('mouseup', handleMouseUp)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateSize)
  window.removeEventListener('mouseup', handleMouseUp)
})
</script>

<style>
@import url('./Home_component.css');
</style>

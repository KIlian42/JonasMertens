<template>
  <div
    class="map-wrapper"
    @mousedown="onMouseDown"
    @contextmenu.prevent="onRightClick"
    @dragover.prevent
    @drop="onDrop"
  >
    <svg ref="svg" class="map-container"></svg>
    <btn icon class="add-image-button" @click="openPopup">
      <v-icon size="62">mdi-plus-circle</v-icon>
    </btn>

    <v-dialog v-model="showPopup" max-width="800">
      <v-card class="popup-card">
        <v-card-title v-if="editImage === false" class="text-h6">Bild hinzufügen</v-card-title>
        <v-card-title v-else class="text-h6">Bild bearbeiten</v-card-title>
        <v-card-text>
          <v-container fluid>
            <v-file-input
              v-if="editImage === false"
              label="Bilddatei"
              @change="onFileChange"
              outlined
              dense
            ></v-file-input>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model.number="newImage.x"
                  label="X-Position"
                  type="number"
                  outlined
                  dense
                ></v-text-field>
                <v-text-field
                  v-model.number="newImage.width"
                  label="Breite"
                  type="number"
                  outlined
                  dense
                ></v-text-field>
                <v-text-field
                  v-model.number="newImage.radius"
                  label="Gerundete Ecken"
                  type="number"
                  outlined
                  dense
                ></v-text-field>
                <v-select
                  v-model="newImage.objectFit"
                  :items="['fill', 'contain', 'cover']"
                  label="Fit-Option"
                  outlined
                  dense
                ></v-select>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="newImage.y"
                  label="Y-Position"
                  type="number"
                  outlined
                  dense
                ></v-text-field>
                <v-text-field
                  v-model.number="newImage.height"
                  label="Höhe"
                  type="number"
                  outlined
                  dense
                ></v-text-field>
                <v-text-field
                  v-model.number="newImage.zIndex"
                  label="Hierarchie Position"
                  type="number"
                  outlined
                  dense
                ></v-text-field>
                <v-text-field
                  v-model="newImage.description"
                  label="Bildbeschreibung"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- <div v-if="newImage.src" class="image-preview">
              <img :src="newImage.src" alt="Vorschau" :style="{ objectFit: newImage.objectFit }" />
            </div> -->
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="#333333" @click="addImage">OK</v-btn>
          <v-btn color="#333333" @click="closePopup">Abbrechen</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount, nextTick, computed, watch } from 'vue'
import { useImageStore } from '@/stores/imageStore'
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
const editImage = ref(false)
const newImage = ref({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  rounded: '0px',
  zIndex: 1,
  objectFit: 'cover',
  title: '',
  description: '',
  src: '',
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
  if (event.button === 0) leftClickActive = true
  if (event.button === 2) rightClickActive = true

  if (leftClickActive && rightClickActive) {
    openPopup()
  }
}

const onRightClick = (event: MouseEvent) => {
  event.preventDefault()
  if (!svg.value) return

  const svgElement = svg.value as SVGElement
  const transform = d3.zoomTransform(svgElement)
  const svgRect = svgElement.getBoundingClientRect()

  newImage.value.x = (event.clientX - svgRect.left - transform.x) / transform.k
  newImage.value.y = (event.clientY - svgRect.top - transform.y) / transform.k

  showPopup.value = true
}

const openPopup = () => {
  showPopup.value = true
}

const closePopup = () => {
  showPopup.value = false
  selectedFile.value = null
  newImage.value.src = ''
  editImage.value = false
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

const onDrop = async (event: DragEvent) => {
  event.preventDefault()
  if (!event.clientX || !event.clientY || !svg.value || !event.dataTransfer?.files.length) return

  const svgElement = svg.value as SVGElement
  const transform = d3.zoomTransform(svgElement)
  const svgRect = svgElement.getBoundingClientRect()

  const x = (event.clientX - svgRect.left - transform.x) / transform.k
  const y = (event.clientY - svgRect.top - transform.y) / transform.k

  selectedFile.value = event.dataTransfer.files[0]
  newImage.value = {
    x,
    y,
    width: 100,
    height: 100,
    rounded: '0px',
    zIndex: 1,
    objectFit: 'cover',
    title: '',
    description: '',
    src: URL.createObjectURL(selectedFile.value),
  }

  showPopup.value = true
}

const renderImages = () => {
  if (!mainContainer) return
  mainContainer.selectAll('g.image-group').remove()

  images.value.forEach((img) => {
    const group = mainContainer.append('g').attr('class', 'image-group')

    const border = group
      .append('rect')
      .attr('x', img.x)
      .attr('y', img.y)
      .attr('width', img.width)
      .attr('height', img.height)
      .attr('fill', 'none')
      .attr('stroke', '#171937')
      .attr('stroke-width', 4)
      .style('opacity', 0)

    const imageElement = group
      .append('image')
      .attr('x', img.x)
      .attr('y', img.y)
      .attr('width', img.width)
      .attr('height', img.height)
      .attr('href', img.src)
      .attr('alt', img.description)
      .style('cursor', 'pointer')
      .on('mouseover', function () {
        border.style('opacity', 1)
      })
      .on('mouseout', function () {
        border.style('opacity', 0)
      })
      .on('click', function () {
        // alert(`Bild angeklickt: ${img.description}`)
        newImage.value = {
          x: img.x,
          y: img.y,
          width: img.width,
          height: img.height,
          rounded: img.rounded,
          zIndex: img.zIndex,
          objectFit: img.objectFit,
          title: img.title,
          description: img.description,
          src: img.src,
        }

        showPopup.value = true
        editImage.value = true
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
.map-wrapper {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
}

.map-container {
  background: linear-gradient(to bottom, #fff 98%, #e6e6e6);
  width: 100%;
  height: 100%;
  touch-action: none;
}
.add-image-button {
  width: 50px;
  height: 50px;
  position: absolute;
  bottom: 20px;
  right: 20px;
  color: #10142f;
  border-radius: 50%; /* Kreisförmiger Button */
  display: flex; /* Icon-Zentrierung */
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.6); /* Optionaler Schatten für bessere Sichtbarkeit */
  cursor: pointer;
  background-color: white;
}

.add-image-button:hover {
  transform: scale(1.05);
  background-color: #fbbe0e;
}

.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
}

.popup-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>

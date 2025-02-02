<template>
  <div
    ref="container"
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

    <div v-if="showPopup" class="popup">
      <div class="popup-content">
        <label>X: <input v-model.number="newImage.x" type="number" /></label>
        <label>Y: <input v-model.number="newImage.y" type="number" /></label>
        <label>Width: <input v-model.number="newImage.width" type="number" /></label>
        <label>Height: <input v-model.number="newImage.height" type="number" /></label>
        <label v-if="!selectedFile">
          Image File:
          <input type="file" ref="fileInput" @change="onFileChange" />
        </label>
        <p v-if="selectedFile">Selected File: {{ selectedFile.name }}</p>
        <div v-if="newImage.src">
          <img
            :src="newImage.src"
            alt="Preview"
            style="max-width: 100%; max-height: 200px; margin-top: 10px"
          />
        </div>
        <button @click="addImage">OK</button>
        <button @click="closePopup">Cancel</button>
      </div>
    </div>
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
const newImage = ref({ x: 0, y: 0, width: 100, height: 100, src: '' })
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
    src: URL.createObjectURL(selectedFile.value),
  }

  showPopup.value = true
}

const renderImages = () => {
  if (!mainContainer) return
  mainContainer.selectAll('image').remove()
  images.value.forEach((img) => {
    mainContainer
      .append('image')
      .attr('x', img.x)
      .attr('y', img.y)
      .attr('width', img.width)
      .attr('height', img.height)
      .attr('href', img.src)
      .style('object-fit', 'cover')
  })
}

const initView = (ref: SVGElement | null) => {
  if (!ref) return

  const svg = d3.select(ref)
  mainContainer = svg.append('g').classed('container', true)

  const zoom = d3
    .zoom<SVGElement, unknown>()
    .scaleExtent([0.01, 1000])
    .on('zoom', onZoom)
    .filter((event: any) => {
      return !(event.type === 'wheel' && event.ctrlKey)
    })

  svg.call(zoom)

  const centered = d3.zoomIdentity.translate(width.value / 2, height.value / 2)
  svg.call(zoom.transform, centered)
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
}

.add-image-button:hover {
  transform: scale(1.05);
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

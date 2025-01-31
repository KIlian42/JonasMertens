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
    <button class="add-image-button" @click="openPopup">+</button>

    <div v-if="showPopup" class="popup">
      <div class="popup-content">
        <label>X: <input v-model.number="newImage.x" type="number" /></label>
        <label>Y: <input v-model.number="newImage.y" type="number" /></label>
        <label>Width: <input v-model.number="newImage.width" type="number" /></label>
        <label>Height: <input v-model.number="newImage.height" type="number" /></label>
        <button @click="addImage">OK</button>
        <button @click="closePopup">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount, nextTick, computed } from 'vue'
import { useImageStore } from '@/stores/imageStore'
import * as d3 from 'd3'

const container = ref<HTMLDivElement | null>(null)
const svg = ref<SVGElement | null>(null)
const width = ref(0)
const height = ref(0)
let leftClickActive = false
let rightClickActive = false
let mainContainer: d3.Selection<SVGGElement, unknown, null, undefined>

const imageStore = useImageStore()
const images = computed(() => imageStore.getImages)

const showPopup = ref(false)
const newImage = ref({ x: 0, y: 0, width: 100, height: 100, src: '/11.png' })

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
}

const addImage = () => {
  imageStore.addImage({ ...newImage.value })
  renderImages()
  closePopup()
}

const onDrop = (event: DragEvent) => {
  event.preventDefault()
  if (!event.clientX || !event.clientY || !svg.value) return

  const svgElement = svg.value as SVGElement
  const transform = d3.zoomTransform(svgElement)
  const svgRect = svgElement.getBoundingClientRect()

  const x = (event.clientX - svgRect.left - transform.x) / transform.k
  const y = (event.clientY - svgRect.top - transform.y) / transform.k

  imageStore.addImage({ x, y, width: 100, height: 100 })
  renderImages()
}

const renderImages = () => {
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

  renderImages()

  const zoom = d3
    .zoom<SVGElement, unknown>()
    .scaleExtent([0.166, 30])
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
  background-color: #ccc;
  width: 100%;
  height: 100%;
  touch-action: none;
}

.add-image-button {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background-color: blue;
  color: white;
  border: none;
  padding: 10px 15px;
  font-size: 20px;
  cursor: pointer;
  border-radius: 5px;
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

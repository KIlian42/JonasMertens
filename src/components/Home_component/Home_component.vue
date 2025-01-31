<template>
  <div ref="container" class="map-wrapper" @mousedown="onMouseDown" @contextmenu.prevent>
    <svg ref="svg" class="map-container"></svg>
    <button class="add-rectangle-button" @click="addRectangle">+</button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount, nextTick } from 'vue'
import * as d3 from 'd3'

const container = ref<HTMLDivElement | null>(null)
const svg = ref<SVGElement | null>(null)
const width = ref(0)
const height = ref(0)
let leftClickActive = false
let rightClickActive = false
let mainContainer: d3.Selection<SVGGElement, unknown, null, undefined>

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
    addRectangle()
  }
}

const addRectangle = () => {
  mainContainer
    .append('rect')
    .attr('x', 700)
    .attr('y', 600)
    .attr('width', 100)
    .attr('height', 100)
    .style('fill', 'red')
}

const initView = (ref: SVGElement | null) => {
  if (!ref) return

  const svg = d3.select(ref)
  mainContainer = svg.append('g').classed('container', true)

  // Draw initial red rectangles
  mainContainer
    .append('rect')
    .attr('x', 100)
    .attr('y', 100)
    .attr('width', 100)
    .attr('height', 100)
    .style('fill', 'red')

  mainContainer
    .append('rect')
    .attr('x', 300)
    .attr('y', 200)
    .attr('width', 100)
    .attr('height', 100)
    .style('fill', 'red')

  mainContainer
    .append('rect')
    .attr('x', 500)
    .attr('y', 400)
    .attr('width', 100)
    .attr('height', 100)
    .style('fill', 'red')

  const zoom = d3
    .zoom<SVGElement, unknown>()
    .scaleExtent([0.166, 30])
    .on('zoom', onZoom)
    .filter((event: any) => {
      return !(event.type === 'wheel' && event.ctrlKey)
    })

  svg.call(zoom)

  // Center container within SVG
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

.add-rectangle-button {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background-color: red;
  color: white;
  border: none;
  padding: 10px 15px;
  font-size: 20px;
  cursor: pointer;
  border-radius: 5px;
}
</style>

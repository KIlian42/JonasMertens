<template>
  <div
    ref="container"
    class="map-container"
    @wheel.prevent="onWheel"
    @mousedown="onMouseDown"
    @dblclick="onDoubleClick"
  >
    <div ref="content" class="map-content" :style="mapStyle">
      <div class="box" style="top: 100px; left: 100px"></div>
      <div class="box" style="top: 300px; left: 200px"></div>
      <div class="box" style="top: 500px; left: 400px"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const lastX = ref(0)
const lastY = ref(0)

const container = ref<HTMLElement | null>(null)
const content = ref<HTMLElement | null>(null)

const mapStyle = computed(() => ({
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
  transformOrigin: '0 0',
}))

const onWheel = (event: WheelEvent) => {
  const scaleFactor = 1.1
  const rect = container.value!.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top

  const prevScale = scale.value
  scale.value = event.deltaY < 0 ? scale.value * scaleFactor : scale.value / scaleFactor

  const deltaScale = scale.value / prevScale
  translateX.value = mouseX - (mouseX - translateX.value) * deltaScale
  translateY.value = mouseY - (mouseY - translateY.value) * deltaScale
}

const onMouseDown = (event: MouseEvent) => {
  isDragging.value = true
  lastX.value = event.clientX
  lastY.value = event.clientY
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

const onMouseMove = (event: MouseEvent) => {
  if (!isDragging.value) return
  translateX.value += event.clientX - lastX.value
  translateY.value += event.clientY - lastY.value
  lastX.value = event.clientX
  lastY.value = event.clientY
}

const onMouseUp = () => {
  isDragging.value = false
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}

const onDoubleClick = (event: MouseEvent) => {
  const rect = container.value!.getBoundingClientRect()
  translateX.value = event.clientX - rect.left - content.value!.clientWidth / 2
  translateY.value = event.clientY - rect.top - content.value!.clientHeight / 2
}
</script>

<style>
.map-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background: white;
}
.map-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: 0 0;
  transition: transform 0.1s ease-out;
}
.box {
  width: 100px;
  height: 100px;
  background: red;
  position: absolute;
}
</style>

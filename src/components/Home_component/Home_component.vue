<template>
  <div ref="container" class="map-wrapper">
    <svg ref="svg" class="map-container"></svg>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount, nextTick } from 'vue'
import * as d3 from 'd3'

const container = ref<HTMLDivElement | null>(null)
const svg = ref<SVGElement | null>(null)
const width = ref(0)
const height = ref(0)

const updateSize = () => {
  if (container.value) {
    width.value = container.value.clientWidth
    height.value = container.value.clientHeight
    d3.select(svg.value).attr('width', width.value).attr('height', height.value)
  }
}

const onZoom = (
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  event: d3.D3ZoomEvent<SVGElement, unknown>,
) => {
  container.attr('transform', event.transform)
}

const initView = (ref: SVGElement | null) => {
  if (!ref) return

  const svg = d3.select(ref)
  const container = svg.append('g').classed('container', true)

  // Draw three red rectangles
  container
    .append('rect')
    .attr('x', 100)
    .attr('y', 100)
    .attr('width', 100)
    .attr('height', 100)
    .style('fill', 'red')

  container
    .append('rect')
    .attr('x', 300)
    .attr('y', 200)
    .attr('width', 100)
    .attr('height', 100)
    .style('fill', 'red')

  container
    .append('rect')
    .attr('x', 500)
    .attr('y', 400)
    .attr('width', 100)
    .attr('height', 100)
    .style('fill', 'red')

  // Init D3 zoom with smooth inertia effect and mobile support
  const zoom = d3
    .zoom<SVGElement, unknown>()
    .scaleExtent([0.166, 30])
    .on('zoom', (event) => onZoom(container, event))
    .filter((event) => {
      return !(event.type === 'wheel' && event.ctrlKey) // Prevent default zoom on pinch gestures
    })

  let lastDeltaY = 0
  svg
    .call(zoom)
    .on('wheel', (event) => {
      event.preventDefault()
      const targetScale = d3.zoomTransform(svg.node()!).k * (event.deltaY < 0 ? 1.1 : 0.9)
      lastDeltaY = event.deltaY
      d3.transition()
        .duration(300)
        .ease(d3.easeCubicOut)
        .tween('zoom', () => {
          const i = d3.interpolate(d3.zoomTransform(svg.node()!).k, targetScale)
          return (t) => {
            svg.call(zoom.scaleTo, i(t))
          }
        })
    })
    .on('touchmove', (event) => {
      event.preventDefault()
    })
    .on('gesturechange', (event) => {
      event.preventDefault()
      const targetScale = d3.zoomTransform(svg.node()!).k * event.scale
      d3.transition()
        .duration(300)
        .ease(d3.easeCubicOut)
        .tween('zoom', () => {
          const i = d3.interpolate(d3.zoomTransform(svg.node()!).k, targetScale)
          return (t) => {
            svg.call(zoom.scaleTo, i(t))
          }
        })
    })

  // Center container within SVG
  const centered = d3.zoomIdentity.translate(width.value / 2, height.value / 2)
  svg.call(zoom.transform, centered)
}

onMounted(() => {
  nextTick(() => {
    updateSize()
    initView(svg.value)
    window.addEventListener('resize', updateSize)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateSize)
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
</style>

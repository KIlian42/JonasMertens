import { ref, computed, onMounted, onUnmounted } from 'vue'

export function getViewClass() {
  const isSmallScreen = ref(false)

  const checkScreenSize = () => {
    isSmallScreen.value = window.matchMedia('(max-width: 900px)').matches
  }

  onMounted(() => {
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', checkScreenSize)
  })

  const currentViewClass = computed(() => (isSmallScreen.value ? 'phone' : 'fullscreen'))

  return {
    currentViewClass,
  }
}

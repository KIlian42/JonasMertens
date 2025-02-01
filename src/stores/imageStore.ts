import { defineStore } from 'pinia'
import axios from 'axios'

export const useImageStore = defineStore('image', {
  state: () => ({
    images: [] as Array<{
      id?: number
      name?: string
      x: number
      y: number
      width: number
      height: number
      src: string
    }>,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    getImages: (state) => state.images,
  },

  actions: {
    async loadImagesFromGitHub() {
      this.loading = true
      this.error = null

      const jsonUrl =
        'https://raw.githubusercontent.com/KIlian42/JonasMertensDatabase/main/settings.json'

      try {
        const response = await axios.get(jsonUrl)
        if (response.data && response.data.images) {
          this.images = response.data.images
        } else {
          throw new Error('Keine Bilddaten gefunden.')
        }
      } catch (error: any) {
        console.error('Fehler beim Laden der JSON-Daten:', error)
        this.error = 'Fehler beim Laden der Bilddaten.'
      } finally {
        this.loading = false
      }
    },

    addImage(image: { x: number; y: number; width: number; height: number; src: string }) {
      this.images.push(image)
    },
  },
})

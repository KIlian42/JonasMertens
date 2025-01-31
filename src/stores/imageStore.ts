import { defineStore } from 'pinia'

export const useImageStore = defineStore('image', {
  state: () => ({
    images: [
      { x: 100, y: 100, width: 100, height: 100, src: 'src/assets/photography/11.png' },
      { x: 300, y: 200, width: 100, height: 100, src: 'src/assets/photography/11.png' },
      { x: 500, y: 400, width: 100, height: 100, src: 'src/assets/photography/11.png' },
    ],
  }),
  getters: {
    getImages: (state) => state.images,
  },
  actions: {
    addImage(image: any) {
      this.images.push(image)
    },
  },
})

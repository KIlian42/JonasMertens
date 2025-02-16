import { defineStore } from 'pinia'
import axios from 'axios'

const GITHUB_REPO = 'KIlian42/JonasMertensDatabase'
const BRANCH = 'main'
const SETTINGS_FILE_PATH = 'project_settings.json'
const GITHUB_API_BASE_URL = 'https://api.github.com/repos'

export const useProjectStore = defineStore('project', {
  state: () => ({
    current_project_page: 0,
    images: [] as Array<
      Array<{
        id?: number
        name?: string
        src: string
        row: number
        col: number
        padding: number
        height: number
        border_radius: number
        objectFit: string
        title: string
        description: string
      }>
    >,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    getCurrentProjectPage: (state) => state.current_project_page,
    getImages: (state) => state.images,
  },

  actions: {
    setCurrentProjectPage(current_project_page: number) {
      this.current_project_page = current_project_page
    },

    async loadImagesFromGitHub() {
      this.loading = true
      this.error = null
      const url = `${GITHUB_API_BASE_URL}/${GITHUB_REPO}/contents/${SETTINGS_FILE_PATH}?ref=${BRANCH}&t=${Date.now()}`

      try {
        const { data } = await axios.get(url)
        if (!data.content) throw new Error('Ungültige API-Antwort.')
        const { images } = JSON.parse(atob(data.content))
        if (!images) throw new Error('Keine Bilddaten gefunden.')

        // Sortiere das flache Array der Bilder nach row (aufsteigend) und innerhalb derselben Zeile nach col
        const sortedImages = images[this.current_project_page].sort((a: any, b: any) => {
          if (a.row === b.row) {
            return a.col - b.col
          }
          return a.row - b.row
        })

        // Gruppiere die sortierten Bilder in ein Array von Arrays,
        // wobei jedes innere Array alle Bilder einer Zeile (row) enthält.
        const groupedImages: Array<
          Array<{
            id?: number
            name?: string
            src: string
            row: number
            col: number
            padding: number
            height: number
            border_radius: number
            objectFit: string
            title: string
            description: string
          }>
        > = []

        sortedImages.forEach((img: any) => {
          // Gehe davon aus, dass die row-Werte 1-indexed sind
          const rowIndex = img.row - 1
          if (!groupedImages[rowIndex]) {
            groupedImages[rowIndex] = []
          }
          groupedImages[rowIndex].push(img)
        })

        this.images = groupedImages
      } catch (error: any) {
        console.error('Fehler beim Laden der JSON-Daten:', error)
        this.error = 'Fehler beim Laden der Bilddaten.'
      } finally {
        this.loading = false
      }
    },
  },
})

export const projectStore = useProjectStore()

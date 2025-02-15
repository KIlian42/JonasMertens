import { defineStore } from 'pinia'
import axios from 'axios'

const GITHUB_REPO = 'KIlian42/JonasMertensDatabase'
const BRANCH = 'main'
const SETTINGS_FILE_PATH = 'project_settings.json'
// const IMAGES_FOLDER_PATH = 'images/'
const GITHUB_API_BASE_URL = 'https://api.github.com/repos'
// const GITHUB_RAW_BASE_URL = 'https://raw.githubusercontent.com'

export const useProjectlStore = defineStore('project', {
  state: () => ({
    current_project_page: 0,
    images: [] as Array<{
      id?: number
      name?: string
      src: string
      row: number
      col: number
      width: number
      height: number
      padding: number
      border_radius: number
      objectFit: string
      title: string
      description: string
      visible: boolean
    }>,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    getCurrentProjectPage: (state) => state.current_project_page,
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
        this.images = images
      } catch (error: any) {
        console.error('Fehler beim Laden der JSON-Daten:', error)
        this.error = 'Fehler beim Laden der Bilddaten.'
      } finally {
        this.loading = false
      }
    },
  },
})

export const projectStore = useProjectlStore()

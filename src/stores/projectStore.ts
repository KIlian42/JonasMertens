import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const GITHUB_REPO = 'KIlian42/JonasMertensDatabase'
const BRANCH = 'main'
const SETTINGS_FILE_PATH = 'project_settings.json'
const GITHUB_API_BASE_URL = 'https://api.github.com/repos'

// Hilfsfunktion für gemeinsame Request-Header
function getHeaders(token: string) {
  return {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
  }
}

export const useProjectStore = defineStore('project', {
  state: () => ({
    // images ist ein 2D-Array, das Zeilen (rows) von Bildobjekten enthält
    images: [] as Array<
      Array<{
        id?: number
        name?: string
        src: string
        width: number
        height: number
        padding: number
        border_radius: number
        title: string
        description: string
        objectFit: string
        visible: string
        subpage: string
      }>
    >,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    getImages: (state) => state.images,
  },

  actions: {
    async loadImagesFromGitHub() {
      this.images = []
      this.loading = true
      this.error = null
      const url = `${GITHUB_API_BASE_URL}/${GITHUB_REPO}/contents/${SETTINGS_FILE_PATH}?ref=${BRANCH}&t=${Date.now()}`

      try {
        const { data } = await axios.get(url)
        if (!data.content) throw new Error('Ungültige API-Antwort.')

        const parsed = JSON.parse(atob(data.content))
        if (!parsed.images) throw new Error('Keine Bilddaten gefunden.')

        this.images = parsed.images
      } catch (error: any) {
        console.error('Fehler beim Laden der JSON-Daten:', error)
        this.error = 'Fehler beim Laden der Bilddaten.'
      } finally {
        this.loading = false
      }
    },

    async updateProjectSettingsOnGithub() {
      const authStore = useAuthStore()
      const token = authStore.password
      try {
        await axios.put(
          `${GITHUB_API_BASE_URL}/${GITHUB_REPO}/contents/${SETTINGS_FILE_PATH}`,
          {
            message: 'Update project_settings.json.',
            // Das gesamte Objekt wird aktualisiert,
            // wobei images als Schlüssel in der JSON-Struktur gesetzt wird.
            content: btoa(JSON.stringify({ images: this.images }, null, 2)),
            branch: BRANCH,
            // Falls erforderlich, sollte hier auch der "sha"-Wert des aktuellen Files übergeben werden.
          },
          { headers: getHeaders(token) },
        )
      } catch (error: any) {
        console.error(
          'Fehler beim Updaten der project_settings.json:',
          error.response?.data || error.message,
        )
        this.error = `Fehler: ${error.response?.data?.message || 'Unbekannter Fehler'}`
      }
    },

    async convertImageToBase64(imageUrl: string): Promise<string> {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('GET', imageUrl, true)
        xhr.responseType = 'blob'
        xhr.onload = function () {
          if (xhr.status === 200) {
            const reader = new FileReader()
            reader.onloadend = function () {
              resolve((reader.result as string).split(',')[1])
            }
            reader.onerror = reject
            reader.readAsDataURL(xhr.response)
          } else {
            reject(new Error('Fehler beim Laden des Bildes.'))
          }
        }
        xhr.onerror = reject
        xhr.send()
      })
    },
  },
})

export const projectStore = useProjectStore()

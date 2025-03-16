import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const GITHUB_REPO = 'KIlian42/JonasMertensDatabase'
const BRANCH = 'main'
const SETTINGS_FILE_PATH = 'project_settings.json'
const GITHUB_API_BASE_URL = 'https://api.github.com/repos'
const IMAGES_FOLDER_PATH = 'images/' // Neuer Ordner-Pfad für Bilder

// Hilfsfunktion für gemeinsame Request-Header
function getHeaders(token: string) {
  return {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
  }
}

export const useProjectStore = defineStore('project', {
  state: () => ({
    // images ist ein 2D-Array: Zeilen (Rows) mit Bildobjekten als Spalten (Columns)
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
        // Zuerst den aktuellen SHA abrufen:
        const getUrl = `${GITHUB_API_BASE_URL}/${GITHUB_REPO}/contents/${SETTINGS_FILE_PATH}?ref=${BRANCH}&t=${Date.now()}`
        const { data } = await axios.get(getUrl, { headers: getHeaders(token) })
        const currentSha = data.sha

        // Anschließend die Datei mit dem SHA aktualisieren:
        await axios.put(
          `${GITHUB_API_BASE_URL}/${GITHUB_REPO}/contents/${SETTINGS_FILE_PATH}`,
          {
            message: 'Update project_settings.json.',
            content: btoa(JSON.stringify({ images: this.images }, null, 2)),
            branch: BRANCH,
            sha: currentSha,
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

    async updateProjectStoreonGithub() {
      const authStore = useAuthStore()
      const token = authStore.password

      // Für jedes Bild in jeder Zeile:
      for (const row of this.images) {
        for (const image of row) {
          // Falls die src noch nicht auf GitHub verweist
          if (!image.src.startsWith('https://raw.githubusercontent.com/')) {
            const imageName = image.name || `image_${Date.now()}.png`
            let imageBase64 = ''

            // Falls src bereits eine Data-URL ist, extrahiere den Base64-Teil,
            // ansonsten konvertiere die externe URL.
            if (image.src.startsWith('data:')) {
              imageBase64 = image.src.split(',')[1]
            } else {
              imageBase64 = await this.convertImageToBase64(image.src)
            }

            try {
              // Bilddatei hochladen
              await axios.put(
                `${GITHUB_API_BASE_URL}/${GITHUB_REPO}/contents/${IMAGES_FOLDER_PATH}${imageName}`,
                { message: `Add image ${imageName}`, content: imageBase64, branch: BRANCH },
                { headers: getHeaders(token) },
              )
              // Aktualisiere die Bild-URL im Store
              image.src = `https://raw.githubusercontent.com/${GITHUB_REPO}/${BRANCH}/${IMAGES_FOLDER_PATH}${imageName}`
            } catch (error: any) {
              console.error(
                'Fehler beim Hochladen des Bildes:',
                error.response?.data || error.message,
              )
              this.error = `Fehler beim Hochladen des Bildes: ${error.response?.data?.message || 'Unbekannter Fehler'}`
            }
          }
        }
      }

      // Nachdem alle Bilder hochgeladen wurden, pushe die aktualisierte project_settings.json
      await this.updateProjectSettingsOnGithub()
    },
  },
})

export const projectStore = useProjectStore()

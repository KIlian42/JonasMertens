// imageStore.ts
import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const GITHUB_REPO = 'KIlian42/JonasMertensDatabase'
const BRANCH = 'main'
const SETTINGS_FILE_PATH = 'settings.json'
const IMAGES_FOLDER_PATH = 'images/'
const GITHUB_API_BASE_URL = 'https://api.github.com/repos'

// Hilfsfunktion für gemeinsame Request-Header
function getHeaders(token: string) {
  return {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
  }
}

export const useImageStore = defineStore('image', {
  state: () => ({
    images: [] as Array<{
      id?: number
      name?: string
      src: string
      x: number
      y: number
      width: number
      height: number
      border_radius: number
      z_index: number
      objectFit: string
      title: string
      description: string
    }>,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    getImages: (state) => state.images,
  },

  actions: {
    async fetchImageDataUrl(imageName: string): Promise<string> {
      const authStore = useAuthStore()
      const token = authStore.userToken
      const url = `${GITHUB_API_BASE_URL}/${GITHUB_REPO}/contents/${IMAGES_FOLDER_PATH}${imageName}?ref=${BRANCH}`

      try {
        const { data } = await axios.get(url, { headers: getHeaders(token) })
        const base64Content = data.content.replace(/\n/g, '')
        // Bestimme MIME-Type anhand der Dateiendung (PNG als Standard)
        const mimeType = imageName.match(/\.(jpe?g|gif)$/i)
          ? imageName.endsWith('.gif')
            ? 'image/gif'
            : 'image/jpeg'
          : 'image/png'
        return `data:${mimeType};base64,${base64Content}`
      } catch (error) {
        console.error(`Fehler beim Laden des Bildes ${imageName}:`, error)
        throw error
      }
    },

    async loadImagesFromGitHub() {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()
      const token = authStore.userToken
      const url = `${GITHUB_API_BASE_URL}/${GITHUB_REPO}/contents/${SETTINGS_FILE_PATH}?ref=${BRANCH}&t=${Date.now()}`

      try {
        const { data } = await axios.get(url, { headers: getHeaders(token) })
        if (!data.content) throw new Error('Ungültige API-Antwort.')
        const settings = JSON.parse(atob(data.content))
        if (!settings.images) throw new Error('Keine Bilddaten gefunden.')
        this.images = await Promise.all(
          settings.images.map(async (img: any) => {
            try {
              const dataUrl = await this.fetchImageDataUrl(img.name)
              return { ...img, src: dataUrl }
            } catch (e) {
              console.error(`Fehler beim Laden von Bild ${img.name}:`, e)
              return img
            }
          }),
        )
      } catch (error: any) {
        console.error('Fehler beim Laden der JSON-Daten:', error)
        this.error = 'Fehler beim Laden der Bilddaten.'
      } finally {
        this.loading = false
      }
    },

    async addImage(image: {
      id?: number
      name?: string
      src: string
      x: number
      y: number
      width: number
      height: number
      border_radius: number
      z_index: number
      objectFit: string
      title: string
      description: string
    }) {
      const authStore = useAuthStore()
      // Hier wird der PAT aus "password" verwendet
      const token = authStore.password
      const imageName = image.name || `image_${Date.now()}.png`

      try {
        // Falls src bereits eine Data-URL ist, extrahiere den Base64-Teil,
        // ansonsten konvertiere die externe URL.
        const imageBase64 = image.src.startsWith('data:')
          ? image.src.split(',')[1]
          : await this.convertImageToBase64(image.src)

        // Bilddatei hochladen
        await axios.put(
          `${GITHUB_API_BASE_URL}/${GITHUB_REPO}/contents/${IMAGES_FOLDER_PATH}${imageName}`,
          { message: `Add image ${imageName}`, content: imageBase64, branch: BRANCH },
          { headers: getHeaders(token) },
        )

        // settings.json abrufen und aktualisieren
        const settingsRes = await axios.get(
          `${GITHUB_API_BASE_URL}/${GITHUB_REPO}/contents/${SETTINGS_FILE_PATH}`,
          { headers: getHeaders(token) },
        )
        const sha = settingsRes.data.sha
        const currentSettings = JSON.parse(atob(settingsRes.data.content))
        const newId = currentSettings.images.length
          ? Math.max(...currentSettings.images.map((img: any) => img.id)) + 1
          : 1

        const newImage = { ...image, id: newId, name: imageName, src: '' }
        currentSettings.images.push(newImage)

        await axios.put(
          `${GITHUB_API_BASE_URL}/${GITHUB_REPO}/contents/${SETTINGS_FILE_PATH}`,
          {
            message: `Update settings.json with new image ${imageName}`,
            content: btoa(JSON.stringify(currentSettings, null, 2)),
            sha,
            branch: BRANCH,
          },
          { headers: getHeaders(token) },
        )

        this.images.push(newImage)
      } catch (error: any) {
        console.error('Fehler beim Hochladen des Bildes:', error.response?.data || error.message)
        this.error = `Fehler: ${error.response?.data?.message || 'Unbekannter Fehler'}`
      }
    },

    async editImage(updatedImage: {
      id: number
      x?: number
      y?: number
      width?: number
      height?: number
      border_radius?: number
      z_index?: number
      objectFit?: string
      title?: string
      description?: string
    }) {
      const authStore = useAuthStore()
      const token = authStore.password

      try {
        const settingsRes = await axios.get(
          `${GITHUB_API_BASE_URL}/${GITHUB_REPO}/contents/${SETTINGS_FILE_PATH}`,
          { headers: getHeaders(token) },
        )
        const sha = settingsRes.data.sha
        const currentSettings = JSON.parse(atob(settingsRes.data.content))
        const index = currentSettings.images.findIndex((img: any) => img.id === updatedImage.id)
        if (index === -1) throw new Error('Bild nicht gefunden.')

        Object.assign(currentSettings.images[index], updatedImage)
        await axios.put(
          `${GITHUB_API_BASE_URL}/${GITHUB_REPO}/contents/${SETTINGS_FILE_PATH}`,
          {
            message: `Update settings.json for image ID ${updatedImage.id}`,
            content: btoa(JSON.stringify(currentSettings, null, 2)),
            sha,
            branch: BRANCH,
          },
          { headers: getHeaders(token) },
        )

        const localIndex = this.images.findIndex((img) => img.id === updatedImage.id)
        if (localIndex !== -1) Object.assign(this.images[localIndex], updatedImage)
      } catch (error: any) {
        console.error('Fehler beim Bearbeiten des Bildes:', error.response?.data || error.message)
        this.error = `Fehler: ${error.response?.data?.message || 'Unbekannter Fehler'}`
      }
    },

    async deleteImage(id: number) {
      const authStore = useAuthStore()
      const token = authStore.password

      try {
        // settings.json abrufen und Bild entfernen
        const settingsRes = await axios.get(
          `${GITHUB_API_BASE_URL}/${GITHUB_REPO}/contents/${SETTINGS_FILE_PATH}`,
          { headers: getHeaders(token) },
        )
        const sha = settingsRes.data.sha
        const currentSettings = JSON.parse(atob(settingsRes.data.content))
        const index = currentSettings.images.findIndex((img: any) => img.id === id)
        if (index === -1) throw new Error('Bild nicht gefunden.')

        const removedImage = currentSettings.images.splice(index, 1)[0]
        await axios.put(
          `${GITHUB_API_BASE_URL}/${GITHUB_REPO}/contents/${SETTINGS_FILE_PATH}`,
          {
            message: `Remove image ID ${id} from settings.json`,
            content: btoa(JSON.stringify(currentSettings, null, 2)),
            sha,
            branch: BRANCH,
          },
          { headers: getHeaders(token) },
        )

        // Bilddatei löschen
        const imagePath = `${IMAGES_FOLDER_PATH}${removedImage.name}`
        const imageRes = await axios.get(
          `${GITHUB_API_BASE_URL}/${GITHUB_REPO}/contents/${imagePath}?ref=${BRANCH}`,
          { headers: getHeaders(token) },
        )
        const imageSha = imageRes.data.sha
        await axios.delete(`${GITHUB_API_BASE_URL}/${GITHUB_REPO}/contents/${imagePath}`, {
          data: {
            message: `Delete image file ${removedImage.name}`,
            sha: imageSha,
            branch: BRANCH,
          },
          headers: getHeaders(token),
        })

        this.images = this.images.filter((img) => img.id !== id)
      } catch (error: any) {
        console.error('Fehler beim Löschen des Bildes:', error.response?.data || error.message)
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

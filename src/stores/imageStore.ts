// imageStore.ts

import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const GITHUB_REPO = 'KIlian42/JonasMertensDatabase'
const BRANCH = 'main'
const SETTINGS_FILE_PATH = 'settings.json'
const IMAGES_FOLDER_PATH = 'images/'
const GITHUB_API_BASE_URL = 'https://api.github.com/repos'

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
    async loadImagesFromGitHub() {
      this.loading = true
      this.error = null

      // GitHub API URL: liefert ein JSON-Objekt, in dem u.a. der base64-codierte Dateiinhalt enthalten ist
      const apiUrl = `${GITHUB_API_BASE_URL}/${GITHUB_REPO}/contents/${SETTINGS_FILE_PATH}?ref=${BRANCH}&t=${new Date().getTime()}`

      try {
        const response = await axios.get(apiUrl, {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            // Falls erforderlich, kannst du hier auch den Authorization-Header setzen,
            // z.B. Authorization: `token ${useAuthStore().password}`
          },
        })

        // Der API-Endpunkt liefert ein Objekt mit einer base64-codierten "content"-Eigenschaft.
        if (response.data && response.data.content) {
          // Base64-dekodieren und als JSON parsen:
          const decodedContent = atob(response.data.content)
          const settingsData = JSON.parse(decodedContent)

          if (settingsData && settingsData.images) {
            this.images = settingsData.images
            console.log('Geladene Bilder:', this.images)
          } else {
            throw new Error('Keine Bilddaten gefunden.')
          }
        } else {
          throw new Error('Ungültige Antwort vom API-Endpunkt.')
        }
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
      const GITHUB_PAT = authStore.password // PAT aus authStore

      try {
        const imageName = image.name || `image_${Date.now()}.png`

        // Falls src eine Data-URL ist, extrahiere Base64 direkt
        let imageBase64 = ''
        if (image.src.startsWith('data:')) {
          imageBase64 = image.src.split(',')[1]
        } else {
          imageBase64 = await this.convertImageToBase64(image.src)
        }

        // 1. Bild in GitHub hochladen
        await axios.put(
          `${GITHUB_API_BASE_URL}/${GITHUB_REPO}/contents/${IMAGES_FOLDER_PATH}${imageName}`,
          {
            message: `Add image ${imageName}`,
            content: imageBase64,
            branch: BRANCH,
          },
          {
            headers: {
              Authorization: `token ${GITHUB_PAT}`,
              Accept: 'application/vnd.github.v3+json',
            },
          },
        )

        const uploadedImageUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${BRANCH}/${IMAGES_FOLDER_PATH}${imageName}`

        // 2. settings.json aktualisieren
        const settingsResponse = await axios.get(
          `${GITHUB_API_BASE_URL}/${GITHUB_REPO}/contents/${SETTINGS_FILE_PATH}`,
          {
            headers: {
              Authorization: `token ${GITHUB_PAT}`,
              Accept: 'application/vnd.github.v3+json',
            },
          },
        )

        const sha = settingsResponse.data.sha
        const currentSettings = JSON.parse(atob(settingsResponse.data.content))
        const newId = currentSettings.images.length
          ? Math.max(...currentSettings.images.map((img: any) => img.id)) + 1
          : 1

        const newImage = {
          id: newId,
          name: imageName,
          src: uploadedImageUrl,
          x: image.x,
          y: image.y,
          width: image.width,
          height: image.height,
          border_radius: image.border_radius,
          z_index: image.z_index,
          objectFit: image.objectFit,
          title: image.title,
          description: image.description,
        }

        currentSettings.images.push(newImage)

        await axios.put(
          `${GITHUB_API_BASE_URL}/${GITHUB_REPO}/contents/${SETTINGS_FILE_PATH}`,
          {
            message: `Update settings.json with new image ${imageName}`,
            content: btoa(JSON.stringify(currentSettings, null, 2)),
            sha,
            branch: BRANCH,
          },
          {
            headers: {
              Authorization: `token ${GITHUB_PAT}`,
              Accept: 'application/vnd.github.v3+json',
            },
          },
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
      console.log('to here2')
      const authStore = useAuthStore()
      const GITHUB_PAT = authStore.password

      try {
        // Lade aktuelle settings.json
        const settingsResponse = await axios.get(
          `${GITHUB_API_BASE_URL}/${GITHUB_REPO}/contents/${SETTINGS_FILE_PATH}`,
          {
            headers: {
              Authorization: `token ${GITHUB_PAT}`,
              Accept: 'application/vnd.github.v3+json',
            },
          },
        )

        const sha = settingsResponse.data.sha
        const currentSettings = JSON.parse(atob(settingsResponse.data.content))

        const imageIndex = currentSettings.images.findIndex(
          (img: any) => img.id === updatedImage.id,
        )
        if (imageIndex === -1) {
          throw new Error('Bild nicht gefunden.')
        }

        // Aktualisiere die Eigenschaften des Bildes
        Object.assign(currentSettings.images[imageIndex], updatedImage)

        await axios.put(
          `${GITHUB_API_BASE_URL}/${GITHUB_REPO}/contents/${SETTINGS_FILE_PATH}`,
          {
            message: `Update settings.json for image ID ${updatedImage.id}`,
            content: btoa(JSON.stringify(currentSettings, null, 2)),
            sha,
            branch: BRANCH,
          },
          {
            headers: {
              Authorization: `token ${GITHUB_PAT}`,
              Accept: 'application/vnd.github.v3+json',
            },
          },
        )

        // Lokale Aktualisierung
        const localImageIndex = this.images.findIndex((img) => img.id === updatedImage.id)
        if (localImageIndex !== -1) {
          Object.assign(this.images[localImageIndex], updatedImage)
        }
      } catch (error: any) {
        console.error('Fehler beim Bearbeiten des Bildes:', error.response?.data || error.message)
        this.error = `Fehler: ${error.response?.data?.message || 'Unbekannter Fehler'}`
      }
    },

    async deleteImage(id: number) {
      const authStore = useAuthStore()
      const GITHUB_PAT = authStore.password

      try {
        // Lade aktuelle settings.json
        const settingsResponse = await axios.get(
          `${GITHUB_API_BASE_URL}/${GITHUB_REPO}/contents/${SETTINGS_FILE_PATH}`,
          {
            headers: {
              Authorization: `token ${GITHUB_PAT}`,
              Accept: 'application/vnd.github.v3+json',
            },
          },
        )

        const sha = settingsResponse.data.sha
        const currentSettings = JSON.parse(atob(settingsResponse.data.content))

        const imageIndex = currentSettings.images.findIndex((img: any) => img.id === id)
        if (imageIndex === -1) {
          throw new Error('Bild nicht gefunden.')
        }

        // Bild aus settings.json entfernen
        currentSettings.images.splice(imageIndex, 1)

        await axios.put(
          `${GITHUB_API_BASE_URL}/${GITHUB_REPO}/contents/${SETTINGS_FILE_PATH}`,
          {
            message: `Remove image ID ${id} from settings.json`,
            content: btoa(JSON.stringify(currentSettings, null, 2)),
            sha,
            branch: BRANCH,
          },
          {
            headers: {
              Authorization: `token ${GITHUB_PAT}`,
              Accept: 'application/vnd.github.v3+json',
            },
          },
        )

        // Lokale Aktualisierung
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
              const base64data = (reader.result as string).split(',')[1] // Base64-Daten extrahieren
              resolve(base64data)
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

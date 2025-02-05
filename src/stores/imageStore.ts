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
      x: number
      y: number
      width: number
      height: number
      src: string
      rounded: string
      zIndex: number
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

      const jsonUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${BRANCH}/${SETTINGS_FILE_PATH}`

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

    async addImage(image: {
      x: number
      y: number
      width: number
      height: number
      src: string
      name?: string
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

import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const GITHUB_REPO = 'KIlian42/JonasMertensDatabase'
const BRANCH = 'main'
const SETTINGS_FILE_PATH = 'project_settings.json'
const GITHUB_API_BASE_URL = 'https://api.github.com/repos'
const GITHUB_RAW_BASE_URL = 'https://raw.githubusercontent.com'
const IMAGES_FOLDER_PATH = 'images'

function getHeaders(token: string) {
  return {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
  }
}

export const useProjectStore = defineStore('project', {
  state: () => ({
    images: [] as Array<
      Array<{
        id: string
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
    setImages(newImages: typeof this.images) {
      this.images = newImages
    },

    async loadImagesFromGitHub(): Promise<boolean> {
      this.images = []
      this.loading = true
      this.error = null
      const url = `${GITHUB_API_BASE_URL}/${GITHUB_REPO}/contents/${SETTINGS_FILE_PATH}?ref=${BRANCH}&t=${Date.now()}`
      try {
        const { data } = await axios.get(url)
        if (!data.content) throw new Error('Ungültige API-Antwort.')
        const binaryString = atob(data.content)
        const bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0))
        const decodedJson = new TextDecoder('utf-8').decode(bytes)
        const parsed = JSON.parse(decodedJson)
        this.images = parsed.images
        for (let rowIndex = 0; rowIndex < this.images.length; rowIndex++) {
          for (let colIndex = 0; colIndex < this.images[rowIndex].length; colIndex++) {
            const newSrc = `${this.images[rowIndex][colIndex].src.split('?')[0]}?t=${Date.now()}`
            this.images[rowIndex][colIndex].src = newSrc
          }
        }
      } catch (error: any) {
        console.error('Fehler beim Laden der JSON-Daten:', error)
        this.error = 'Fehler beim Laden der Bilddaten.'
        return false
      } finally {
        this.loading = false
        return true
      }
    },

    async updateProjectSettingsOnGithub() {
      const authStore = useAuthStore()
      const token = authStore.password
      for (let rowIndex = 0; rowIndex < this.images.length; rowIndex++) {
        for (let colIndex = 0; colIndex < this.images[rowIndex].length; colIndex++) {
          const fileName = this.images[rowIndex][colIndex].id + '.png'
          const newSrc = `${GITHUB_RAW_BASE_URL}/${GITHUB_REPO}/${BRANCH}/${IMAGES_FOLDER_PATH}/${fileName}`
          this.images[rowIndex][colIndex].src = newSrc
        }
      }
      try {
        const getUrl = `${GITHUB_API_BASE_URL}/${GITHUB_REPO}/contents/${SETTINGS_FILE_PATH}?ref=${BRANCH}&t=${Date.now()}`
        const { data } = await axios.get(getUrl, { headers: getHeaders(token) })
        const currentSha = data.sha
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

    async uploadImagesOnGithub(imagesName: string[], imagesSrc: string[]): Promise<boolean> {
      const authStore = useAuthStore()
      const token = authStore.password

      for (let index = 0; index < imagesName.length; index++) {
        const imageName = imagesName[index]
        let imageBase64 = ''
        if (imagesSrc[index].startsWith('data:')) {
          imageBase64 = imagesSrc[index].split(',')[1]
        } else {
          imageBase64 = await this.convertImageToBase64(imagesSrc[index])
        }

        const url = `${GITHUB_API_BASE_URL}/${GITHUB_REPO}/contents/${IMAGES_FOLDER_PATH}/${imageName}`

        try {
          await axios.put(
            url,
            {
              message: `Add image ${imageName}`,
              content: imageBase64,
              branch: BRANCH,
            },
            { headers: getHeaders(token) },
          )
        } catch (error: any) {
          console.error('Fehler beim Hochladen des Bildes:', error.response?.data || error.message)
          this.error = `Fehler beim Hochladen des Bildes: ${error.response?.data?.message || 'Unbekannter Fehler'}`
        }
      }
      return true
    },

    async deleteImagesOnGithub(imagesName: string[]): Promise<boolean> {
      const authStore = useAuthStore()
      const token = authStore.password

      for (const fileName of imagesName) {
        try {
          const url = `${GITHUB_API_BASE_URL}/${GITHUB_REPO}/contents/${IMAGES_FOLDER_PATH}/${fileName}`
          const { data } = await axios.get(url, { headers: getHeaders(token) })
          const sha = data.sha

          await axios.delete(url, {
            data: {
              message: `Delete image ${fileName}`,
              branch: BRANCH,
              sha: sha,
            },
            headers: getHeaders(token),
          })
        } catch (error: any) {
          console.error(
            'Fehler beim Löschen der Bilder auf Github:',
            error.response?.data || error.message,
          )
          this.error = `Fehler: ${error.response?.data?.message || 'Unbekannter Fehler'}`
        }
      }
      return true
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

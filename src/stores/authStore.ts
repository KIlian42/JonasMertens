import { defineStore } from 'pinia'
import { useImageStore } from '@/stores/imageStore'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    username: 'berlin',
    password: '',
    loggedIn: false,
  }),

  getters: {
    isLoggedIn: (state) => state.loggedIn,
  },

  actions: {
    async login(password: string): Promise<boolean> {
      this.password = password
      const imageStore = useImageStore()
      const success = await imageStore.loadImagesFromGitHubWithAuth(this.password)
      if (success) {
        this.loggedIn = true
        document.cookie = `jonashomepagelogincookie=${password}; path=/; max-age=1800` // 30 Minuten speichern
        return true // Erfolgreich eingeloggt ✅
      } else {
        return false // Fehler beim Data fetching ❌
      }
    },

    logout() {
      this.password = ''
      this.loggedIn = false
      document.cookie = 'jonashomepagelogincookie=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC' // Cookie löschen
    },

    loadPasswordFromCookie() {
      const cookieMatch = document.cookie.match(/jonashomepagelogincookie=([^;]*)/)
      if (cookieMatch) {
        this.password = cookieMatch[1]
        this.loggedIn = true
      }
    },
  },
})

export const authStore = useAuthStore()
authStore.loadPasswordFromCookie()

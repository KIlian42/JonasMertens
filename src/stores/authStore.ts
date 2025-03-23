import { defineStore } from 'pinia'
import axios from 'axios'

function getHeaders(token: string) {
  return {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
  }
}

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
    loadPasswordFromCookie() {
      const cookieMatch = document.cookie.match(/jonashomepagelogincookie=([^;]*)/)
      if (cookieMatch) {
        this.password = cookieMatch[1]
        this.loggedIn = true
      }
    },

    async login(password: string): Promise<boolean> {
      this.password = password
      const success = await this.test_authentification()
      if (success) {
        this.loggedIn = true
        document.cookie = `jonashomepagelogincookie=${password}; path=/; max-age=1800` // 30 Minuten speichern
        return true
      } else {
        this.password = ''
        return false
      }
    },

    logout() {
      this.password = ''
      this.loggedIn = false
      document.cookie = 'jonashomepagelogincookie=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC' // Cookie löschen
    },

    async test_authentification(): Promise<boolean> {
      try {
        const response = await axios.get(
          'https://api.github.com/repos/KIlian42/JonasMertensDatabase/contents/project_settings.json',
          { headers: getHeaders(this.password) },
        )
        return response.status === 200
      } catch (error) {
        return false
      }
    },
  },
})

export const authStore = useAuthStore()
authStore.loadPasswordFromCookie()

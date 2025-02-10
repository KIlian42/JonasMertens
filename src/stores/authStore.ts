// authStore.ts
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    username: 'berlin',
    password: '',
    loggedIn: false,
    // Zeitstempel in Millisekunden, der den Zeitpunkt des Logins markiert
    loginTimestamp: null as number | null,
  }),
  getters: {
    isLoggedIn: (state) => state.loggedIn,
    isValidLogin: (state) => (username: string, password: string) => {
      return state.username === username && state.password === password
    },
    // Prüft, ob der Login seit mehr als 30 Minuten besteht
    isLoginExpired: (state) => {
      if (!state.loginTimestamp) return true
      return Date.now() - state.loginTimestamp > 30 * 60 * 1000
    },
  },
  actions: {
    // Setzt den Login-Status (true/false)
    setLoginStatus(status: boolean) {
      this.loggedIn = status
    },

    /**
     * setPassword – Diese Funktion dient nun als Login-Funktion:
     * - Es wird das Passwort gesetzt,
     * - der Login-Status auf true gesetzt,
     * - der aktuelle Zeitstempel gespeichert und
     * - der State in localStorage persistiert.
     */
    setPassword(password: string) {
      this.password = password
      this.loggedIn = true
      this.loginTimestamp = Date.now()
      this.saveToLocalStorage()
    },

    // Meldet den Benutzer ab und entfernt die persistierten Daten
    logout() {
      this.password = ''
      this.loggedIn = false
      this.loginTimestamp = null
      localStorage.removeItem('authStore')
    },

    // Prüft, ob der Login abgelaufen ist, und loggt gegebenenfalls automatisch aus
    checkExpiration() {
      if (this.isLoginExpired) {
        this.logout()
      }
    },

    // Speichert den relevanten Teil des States in localStorage
    saveToLocalStorage() {
      const data = {
        password: this.password,
        loggedIn: this.loggedIn,
        loginTimestamp: this.loginTimestamp,
      }
      localStorage.setItem('authStore', JSON.stringify(data))
    },

    // Lädt den gespeicherten State aus localStorage und prüft, ob der Login noch gültig ist
    loadFromLocalStorage() {
      const data = localStorage.getItem('authStore')
      if (data) {
        try {
          const parsed = JSON.parse(data)
          this.password = parsed.password
          this.loggedIn = parsed.loggedIn
          this.loginTimestamp = parsed.loginTimestamp
          // Prüfen, ob die gespeicherte Login-Sitzung abgelaufen ist
          this.checkExpiration()
        } catch (error) {
          console.error('Fehler beim Parsen der authStore-Daten aus localStorage:', error)
          localStorage.removeItem('authStore')
        }
      }
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'authStore',
        storage: localStorage,
      },
    ],
  },
})

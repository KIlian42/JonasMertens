// authStore.ts

import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    username: 'berlin',
    password: '',
    loggedIn: false,
  }),
  getters: {
    isLoggedIn: (state) => state.loggedIn,
    isValidLogin: (state) => (username: string, password: string) => {
      return state.username === username && state.password === password
    },
  },
  actions: {
    setLoginStatus(status: boolean) {
      this.loggedIn = status
    },
    setPassword(password: string) {
      this.password = password
    },
  },
})

// authStore.ts

import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    userToken:
      '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',
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

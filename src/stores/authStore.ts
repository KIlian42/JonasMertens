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

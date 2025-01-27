import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    username: 'test',
    password: '123',
    loggedIn: false,
  }),
  getters: {
    isValidLogin: (state) => (username: string, password: string) => {
      return state.username === username && state.password === password
    },
    isLoggedIn: (state) => () => {
      return state.loggedIn
    },
  },
  actions: {
    setLoginStatus(state: boolean) {
      this.loggedIn = state
    },
  },
})

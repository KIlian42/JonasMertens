import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', {
  state: () => ({}),

  getters: {},

  actions: {},
})

export const globalStore = useGlobalStore()

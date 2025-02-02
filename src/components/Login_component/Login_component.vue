<template>
  <div class="login-box">
    <div ref="anchor" class="anchor-point"></div>
    <v-card v-if="authStore.isLoggedIn" elevation="10" class="glassmorphism-card">
      <v-card-title class="text-h5 d-flex justify-center">Jonas Mertens</v-card-title>
      <v-card-text>
        <v-form>
          <v-btn block class="custom-btn" @click="logout"> Logout </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
    <v-card
      v-else
      elevation="10"
      class="glassmorphism-card"
      :class="{ shake: loginErrorAnimation }"
    >
      <v-card-title class="text-h5 d-flex justify-center">Jonas Mertens</v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field
            v-model="username"
            label="Benutzername"
            type="text"
            outlined
            dense
            class="mb-4"
          ></v-text-field>
          <v-text-field
            v-model="password"
            label="Passwort"
            type="password"
            outlined
            dense
            class="mb-4"
          ></v-text-field>
          <div v-if="loginErrorMessage" class="error-message">Login fehlgeschlagen</div>
          <v-btn block class="custom-btn" @click="login"> Login </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const anchor = ref<HTMLElement | null>(null)

onMounted(() => {
  anchor.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
})

const username = ref('')
const password = ref('')

const loginErrorMessage = ref(false)
const loginErrorAnimation = ref(false)

const router = useRouter()
const authStore = useAuthStore()

const login = () => {
  if (username.value === 'berlin') {
    authStore.setPassword(password.value)
    if (authStore.isValidLogin(username.value, password.value)) {
      loginErrorMessage.value = false
      authStore.setLoginStatus(true)
      router.push('/')
    } else {
      loginErrorMessage.value = true
      loginErrorAnimation.value = true
      setTimeout(() => {
        loginErrorAnimation.value = false
      }, 1000)
    }
  } else {
    loginErrorMessage.value = true
    loginErrorAnimation.value = true
    setTimeout(() => {
      loginErrorAnimation.value = false
    }, 1000)
  }
}

const logout = () => {
  authStore.setLoginStatus(false)
  password.value = ''
}
</script>

<style scoped>
@import url('./Login_component.css');
</style>

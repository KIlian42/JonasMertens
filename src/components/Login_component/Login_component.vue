<template>
  <div class="login-box">
    <v-card elevation="10" class="glassmorphism-card" :class="{ shake: loginErrorAnimation }">
      <v-card-title class="text-h5 d-flex justify-center">Jonas Mertens</v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field
            v-model="username"
            label="Benutzername"
            type="username"
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const username = ref('')
const password = ref('')
const loggedIn = ref(false)
const loginErrorMessage = ref(false)
const loginErrorAnimation = ref(false)

const router = useRouter()
const authStore = useAuthStore()

const login = () => {
  if (authStore.isValidLogin(username.value, password.value)) {
    loginErrorMessage.value = false
    loggedIn.value = true
    authStore.setLoginStatus(true)
    router.push('/')
  } else {
    loginErrorMessage.value = true
    loginErrorAnimation.value = true
    setTimeout(() => {
      loginErrorAnimation.value = false
    }, 1000)
  }
}
</script>

<style scoped>
@import url('./Login_component.css');
</style>

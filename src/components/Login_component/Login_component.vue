<template>
  <div class="login-box">
    <v-card elevation="10" class="glassmorphism-card">
      <v-card-title class="text-h5 d-flex justify-center">Jonas Mertens</v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field
            v-model="name"
            label="Benutzername"
            type="name"
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
          <v-btn block class="custom-btn" @click="login"> Login </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const name = ref('')
const password = ref('')

const login = () => {
  console.log('Name:', name.value)
  console.log('Password:', password.value)
}
</script>

<style scoped>
@import url('./Login_component.css');
</style>

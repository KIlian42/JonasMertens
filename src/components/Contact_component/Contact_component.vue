<template>
  <div class="center-content">
    <div class="textbox">
      Inquiries: maxmustermann@example.com
      <br />
      Instagram: @maxmustermann
      <br />
      Privacy Policy & Imprint
    </div>
    <RouterLink to="/login">
      <div class="corner-element">
        <v-icon> mdi-login </v-icon>
      </div>
    </RouterLink>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
@import url('./Contact_component.css');
</style>

<template>
  <div class="center-content">
    <div class="textbox">
      Anfragen: maxmustermann@example.com
      <br />
      Instagram: @maxmustermann
      <br />
      <div class="container">
        <RouterLink to="/privacypolicy">
          <div class="highlight-text">Datenschutzerklärung</div>
        </RouterLink>
        <span>&</span>
        <RouterLink to="/imprint">
          <div class="highlight-text">Impressum</div>
        </RouterLink>
      </div>
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

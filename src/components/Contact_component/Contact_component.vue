<template>
  <div class="center-content">
    <div class="textbox">
      Inquiries: maxmustermann@example.com
      <br />
      Instagram: @maxmustermann
      <br />
      <div class="container">
        <RouterLink to="/privacypolicy">
          <div class="highlight-text">Privacy Policy</div>
        </RouterLink>
        <span>&</span>
        <RouterLink to="/imprint">
          <div class="highlight-text">Imprint</div>
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

<template>
  <div class="center-content">
    <div ref="anchor" class="anchor-point"></div>
    <div class="textbox">
      <h2><b>Impressum</b></h2>
      Angaben gemäß § 5 TMG
      <br />
      Jonas Lión Mertens
      <br />
      Wohnhaft: Straße Hausnummer Postleitzahl Stadt
      <br />
      Telefon: XXXXXXXXXX
      <br />
      E-Mail: maxmustermann@example.com
      <br /><br />
      <b>Umsatzsteuer-Identifikationsnummer:</b>
      <br />
      Angaben gemäß § 27 a Umsatzsteuergesetz
      <br />
      Umsatzsteuer-ID: DE XXXXXXXXXX
      <br /><br />
      <b>Berufsbezeichnung und berufsrechtliche Regelungen:</b>
      <br />
      Berufsbezeichnung: Fotograf
      <br />
      Es gelten folgende berufsrechtliche Regelungen: EU-Streitschlichtung
      <br />
      Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
      <br />
      <a href="https://ec.europa.eu/consumers/odr/" target="_blank">
        https://ec.europa.eu/consumers/odr/</a
      >
      <br />
      Unsere E-Mail-Adresse finden Sie oben im Impressum.
      <br /><br />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const anchor = ref<HTMLElement | null>(null)

onMounted(() => {
  anchor.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
})
</script>

<style scoped>
@import url('./Imprint_component.css');
</style>

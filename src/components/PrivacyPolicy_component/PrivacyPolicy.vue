<template>
  <div class="center-content">
    <div ref="anchor" class="anchor-point"></div>
    <div class="textbox">
      <h2><b>Datenschutzerklärung</b></h2>
      <br />
      <b>Allgemeiner Hinweis und Pflichtinformationen</b>
      <br /><br />
      <b>Benennung der verantwortlichen Stelle</b>
      <br /><br />
      Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
      <br /><br />
      <b>Jonas Mertens</b><br />
      <b>Straße Hausnummer</b><br />
      <b>Postleitzahl Stadt</b>
      <br /><br />
      Die verantwortliche Stelle entscheidet allein oder gemeinsam mit anderen über die Zwecke und
      Mittel der Verarbeitung von personenbezogenen Daten (z.B. Namen, Kontaktdaten o. Ä.).
      <br /><br />
      <b>Widerruf Ihrer Einwilligung zur Datenverarbeitung</b>
      <br /><br />
      Nur mit Ihrer ausdrücklichen Einwilligung sind einige Vorgänge der Datenverarbeitung möglich.
      Ein Widerruf Ihrer bereits erteilten Einwilligung ist jederzeit möglich. Für den Widerruf
      genügt eine formlose Mitteilung per E-Mail. Die Rechtmäßigkeit der bis zum Widerruf erfolgten
      Datenverarbeitung bleibt vom Widerruf unberührt.
      <br /><br />
      <b>Recht auf Beschwerde bei der zuständigen Aufsichtsbehörde</b>
      <br /><br />
      Als Betroffener steht Ihnen im Falle eines datenschutzrechtlichen Verstoßes ein
      Beschwerderecht bei der zuständigen Aufsichtsbehörde zu. Zuständige Aufsichtsbehörde bezüglich
      datenschutzrechtlicher Fragen ist der Landesdatenschutzbeauftragte des Bundeslandes, in dem
      sich der Sitz unseres Unternehmens befindet. Der folgende Link stellt eine Liste der
      Datenschutzbeauftragten sowie deren Kontaktdaten bereit:
      <a
        href="https://www.bfdi.bund.de/DE/Infothek/Anschriften_Links/anschriften_links-node.html"
        target="_blank"
      >
        bfdi.bund.de</a
      >. <br /><br />
      <b>Recht auf Datenübertragbarkeit</b>
      <br /><br />
      Ihnen steht das Recht zu, Daten, die wir auf Grundlage Ihrer Einwilligung oder in Erfüllung
      eines Vertrags automatisiert verarbeiten, an sich oder an Dritte aushändigen zu lassen. Die
      Bereitstellung erfolgt in einem maschinenlesbaren Format. Sofern Sie die direkte Übertragung
      der Daten an einen anderen Verantwortlichen verlangen, erfolgt dies nur, soweit es technisch
      machbar ist.
      <br /><br />
      <b>Recht auf Auskunft, Berichtigung, Sperrung, Löschung</b>
      <br /><br />
      Sie haben jederzeit im Rahmen der geltenden gesetzlichen Bestimmungen das Recht auf
      unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, Herkunft der Daten,
      deren Empfänger und den Zweck der Datenverarbeitung und ggf. ein Recht auf Berichtigung,
      Sperrung oder Löschung dieser Daten. Diesbezüglich und auch zu weiteren Fragen zum Thema
      personenbezogene Daten können Sie sich jederzeit über die im Impressum aufgeführten
      Kontaktmöglichkeiten an uns wenden.
      <br /><br />
      <b>SSL- bzw. TLS-Verschlüsselung</b>
      <br /><br />
      Aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte, die Sie an uns
      als Seitenbetreiber senden, nutzt unsere Website eine SSL-bzw. TLS-Verschlüsselung. Damit sind
      Daten, die Sie über diese Website übermitteln, für Dritte nicht mitlesbar. Sie erkennen eine
      verschlüsselte Verbindung an der „https://“ Adresszeile Ihres Browsers und am Schloss-Symbol
      in der Browserzeile.
      <br /><br />
      <b>Cookies</b>
      <br /><br />
      Unsere Website verwendet Cookies. Das sind kleine Textdateien, die Ihr Webbrowser auf Ihrem
      Endgerät speichert. Cookies helfen uns dabei, unser Angebot nutzerfreundlicher, effektiver und
      sicherer zu machen.
      <br /><br />
      Einige Cookies sind „Session-Cookies.“ Solche Cookies werden nach Ende Ihrer Browser-Sitzung
      von selbst gelöscht. Hingegen bleiben andere Cookies auf Ihrem Endgerät bestehen, bis Sie
      diese selbst löschen. Solche Cookies helfen uns, Sie bei Rückkehr auf unserer Website
      wiederzuerkennen.
      <br /><br />
      Mit einem modernen Webbrowser können Sie das Setzen von Cookies überwachen, einschränken oder
      unterbinden. Viele Webbrowser lassen sich so konfigurieren, dass Cookies mit dem Schließen des
      Programms von selbst gelöscht werden. Die Deaktivierung von Cookies kann eine eingeschränkte
      Funktionalität unserer Website zur Folge haben.
      <br /><br />
      Das Setzen von Cookies, die zur Ausübung elektronischer Kommunikationsvorgänge oder der
      Bereitstellung bestimmter, von Ihnen erwünschter Funktionen (z.B. Warenkorb) notwendig sind,
      erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Als Betreiber dieser Website haben wir
      ein berechtigtes Interesse an der Speicherung von Cookies zur technisch fehlerfreien und
      reibungslosen Bereitstellung unserer Dienste. Sofern die Setzung anderer Cookies (z.B. für
      Analyse-Funktionen) erfolgt, werden diese in dieser Datenschutzerklärung separat behandelt.
      <br /><br />
      <b>
        Bei weiteren Fragen, wenden Sie sich bitte an den Betreiber dieser Webseite:
        <a class="highlight-text" target="”_blank”" href="https://www.kiliankramer.com"
          >Kilian Kramer</a
        >
      </b>
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
@import url('./PrivacyPolicy.css');
</style>

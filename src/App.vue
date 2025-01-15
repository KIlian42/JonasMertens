<template>
  <v-app>
    <v-container fluid class="pa-0 ma-0 full-size">
      <v-row no-gutters class="pa-0 ma-0 full-size">
        <!-- Spacer Column -->
        <v-col cols="1" class="d-flex align-center justify-center" style="max-width: 50px"></v-col>

        <!-- Buttons Column -->
        <v-col cols="2" class="buttons-column">
          <div class="sticky-buttons">
            <RouterLink to="/">
              <btn text @click="onButtonClick('Jonas L. Mertens')">
                <h2 class="extra-bold">Jonas Mertens</h2>
              </btn>
            </RouterLink>
            <RouterLink to="/contact">
              <btn text @click="onButtonClick('Contact')">
                <h2 class="extra-bold">Contact</h2>
              </btn>
            </RouterLink>
          </div>
        </v-col>

        <!-- Content Column -->
        <v-col cols="9" class="d-flex align-center justify-center content-column">
          <RouterView />
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import { RouterLink, RouterView } from 'vue-router'

export default {
  methods: {
    onButtonClick(buttonName) {
      console.log(`${buttonName} button clicked!`)
    },
  },
}
</script>

<style scoped>
.full-size {
  height: 100vh; /* Full height for the container */
}

.buttons-column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.sticky-buttons {
  position: sticky; /* Make the buttons sticky */
  top: 0; /* Stick to the top of the viewport */
  height: 100vh; /* Full height to allow vertical centering */
  display: flex;
  flex-direction: column;
  justify-content: center; /* Vertically center the buttons */
  background-color: white; /* Optional: Prevent overlap artifacts */
  z-index: 1; /* Ensure it stays on top if necessary */
}

.content-column {
  padding: 16px; /* Add padding for better spacing */
}

/* Styling für die Buttons */
.custom-button {
  transition: transform 0.2s ease-in-out;
  text-transform: none;
  padding: 0;
  margin-bottom: 4px; /* Weniger vertikaler Abstand zwischen den Buttons */
  cursor: pointer;
}

/* Extra-Bold Styling */
.extra-bold {
  font-size: 25px;
  font-weight: 800; /* Maximale Schriftstärke */
  line-height: 1.2; /* Geringerer Abstand zwischen den Zeilen */
}

/* Standard-Stile für RouterLink entfernen */
a {
  color: inherit;
  text-decoration: none;
}

a:hover {
  transform: scale(1.05);
  cursor: pointer;
}

/* Spezifisch für RouterLink */
router-link {
  text-decoration: none;
  color: inherit;
}
</style>

import { createRouter, createWebHistory } from 'vue-router'
import Impressum from '../views/JonasMertens.vue'
import Contact from '../views/Contact.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'jonasmertens',
      component: () => import('../views/JonasMertens.vue'),
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/Contact.vue'),
    },
  ],
})

export default router

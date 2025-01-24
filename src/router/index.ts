import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../components/Home_component/Home_component.vue'),
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../components/Contact_component/Contact_component.vue'),
    },
  ],
})

export default router

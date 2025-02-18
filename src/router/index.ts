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
    {
      path: '/login',
      name: 'login',
      component: () => import('../components/Login_component/Login_component.vue'),
    },
    {
      path: '/privacypolicy',
      name: 'privacypolicy',
      component: () => import('../components/PrivacyPolicy_component/PrivacyPolicy.vue'),
    },
    {
      path: '/imprint',
      name: 'imprint',
      component: () => import('../components/Imprint_component/Imprint_component.vue'),
    },
    {
      path: '/project',
      name: 'project',
      component: () => import('../components/Project_component/Project_component.vue'),
    },
  ],
})

export default router

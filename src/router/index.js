import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/chat'
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('../views/Chat.vue').then(m => m.default || m)
  },
  {
    path: '/config',
    name: 'config',
    component: () => import('../views/Config.vue').then(m => m.default || m)
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: () => import('../views/Placeholder.vue').then(m => m.default || m),
    props: { text: 'OpenTask (Not Implemented)' }
  },
  {
    path: '/extensions',
    name: 'extensions',
    component: () => import('../views/Placeholder.vue').then(m => m.default || m),
    props: { text: 'Extensions (Not Implemented)' }
  },
  {
    path: '/data',
    name: 'data',
    component: () => import('../views/Placeholder.vue').then(m => m.default || m),
    props: { text: 'Data (Not Implemented)' }
  },
  {
    path: '/console',
    name: 'console',
    component: () => import('../views/Placeholder.vue').then(m => m.default || m),
    props: { text: 'Console (Not Implemented)' }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router

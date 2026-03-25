import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/chat'
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('../views/Chat.vue')
  },
  {
    path: '/config',
    name: 'config',
    component: () => import('../views/Config.vue')
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: { template: '<div>OpenTask (Not Implemented)</div>' }
  },
  {
    path: '/extensions',
    name: 'extensions',
    component: { template: '<div>Extensions (Not Implemented)</div>' }
  },
  {
    path: '/data',
    name: 'data',
    component: { template: '<div>Data (Not Implemented)</div>' }
  },
  {
    path: '/console',
    name: 'console',
    component: { template: '<div>Console (Not Implemented)</div>' }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router

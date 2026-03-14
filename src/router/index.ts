// src/router/index.ts
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/Dashboard'
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/dashboard'
      },
      {
        path: 'dashboard',
        component: () => import('@/views/DashboardPage.vue')
      },
      {
        path: 'tasks',
        component: () => import('@/views/TasksPage.vue')
      },
      // TAMBAHKAN INI (Tab 3)
      {
        path: 'courses',
        component: () => import('@/views/CoursesPage.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
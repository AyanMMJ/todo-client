// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/pages/Dashboard.vue'
import Login from '@/pages/Login.vue'
import Register from '@/pages/Register.vue'

const routes = [
    {
        path: '/',
        name: 'Dashboard',
        component: Dashboard
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/register',
        name: 'Register',
        component: Register
    }
]

const router = createRouter({ history: createWebHistory(), routes })

// Global auth guard: protect Dashboard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.name === 'Dashboard'
  const userData = localStorage.getItem('userData')
  if (requiresAuth && !userData) {
    return next({ name: 'Login' })
  }
  if ((to.name === 'Login' || to.name === 'Register') && userData) {
    return next({ name: 'Dashboard' })
  }
  return next()
})
export default router

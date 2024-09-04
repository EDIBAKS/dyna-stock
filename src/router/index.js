import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import newProduct from '../components/newProduct.vue'
import dailyDispatch from '../components/dailyDispatch.vue'
import DispatchLogs from '../components/DispatchLogs.vue'
import summaryReport from '../components/summaryReport.vue'
import LoginPage from '../components/LoginPage.vue'
import { useAuthStore } from '../stores/authStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginPage
    },
    {
      path: '/profile',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/addProduct',
      name: 'newproduct',
      component: newProduct,
      meta: { requiresAuth: true }
    },
    {
      path: '/latestdisp',
      name: 'latestdisp',
      component: dailyDispatch,
      meta: { requiresAuth: true }
    },
    {
      path: '/logs',
      name: 'displogs',
      component: DispatchLogs,
      meta: { requiresAuth: true }
    },
    {
      path: '/report',
      name: 'summary',
      component: summaryReport,
      meta: { requiresAuth: true }
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Ensure the authentication state is initialized before proceeding
  if (!authStore.initialized) {
    await authStore.initializeAuth();
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = authStore.user;

  // If the user is already logged in and tries to access the login page, redirect to /profile
  if (isAuthenticated && to.path === '/') {
    next('/profile');
  } else if (requiresAuth && !isAuthenticated) {
    next('/'); // Redirect to login page if not authenticated
  } else {
    next(); // Proceed to the route
  }
});

export default router;


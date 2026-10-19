import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Details from '../views/DetailsView.vue'
import Library from '../views/LibraryView.vue'
import Connexion from '../views/ConnexionView.vue'
import Listes from '../views/ListesView.vue'
import store from '../store'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/library',
    name: 'library',
    component: Library,
    meta: { requiresAuth: true }
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: Library,
    meta: { requiresAuth: true }
  },
  {
    path: '/movie/:id',
    name: 'details',
    component: Details,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: Connexion
  },
  {
    path: '/lists',
    name: 'lists',
    component: Listes,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const authenticated = store?.state.user != null;

  if (to.meta.requiresAuth && !authenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  if (to.name === 'login' && authenticated) {
    return { name: 'home' };
  }
});

export default router
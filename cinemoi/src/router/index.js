import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Details from '../views/DetailsView.vue'
import Library from '../views/LibraryView.vue'
import Favorites from "../views/FavoritesView.vue"
import Connexion from '../views/ConnexionView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView         
  },
  {
    path: '/library',
    name: 'library',
    component: Library
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: Favorites
  },
  {
    path: '/movie/:id',
    name: 'details',
    component: Details,
    props: true // pour recuperer l'id du film facilement dans la vue
  },
  {
    path: '/login',
    name: 'login',
    component: Connexion
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
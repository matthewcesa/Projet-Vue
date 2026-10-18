import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Details from '../views/DetailsView.vue'
import Library from '../views/LibraryView.vue'
import Connexion from '../views/ConnexionView.vue'
import Listes from '../views/ListesView.vue'

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
    path: '/movie/:id',
    name: 'details',
    component: Details,
    props: true // pour recuperer l'id du film facilement dans la vue
  },
  {
    path: '/login',
    name: 'login',
    component: Connexion
  },
  {
    path: '/lists',
    name: 'lists',
    component: Listes
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
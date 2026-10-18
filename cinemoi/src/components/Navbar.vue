<template>
  <header class="navbar">

    <div class="navbar-left">
      <router-link to="/" class="logo">
        <span class="logo-icon">C</span> 
        <span class="logo-text">Cinémoi</span>
      </router-link>
    </div>

    <nav class="navbar-center">
      <router-link to="/" class="nav-item">Découvrir</router-link>
      <router-link to="/library" class="nav-item">Ma bibliothèque</router-link>
      <router-link to="/lists" class="nav-item">Listes</router-link>
    </nav>

    <div class="navbar-right">
      <button class="notification-btn" aria-label="Notifications">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
      </button>

      <router-link to="/login" class="profile-link">
        <img src="https://via.placeholder.com/40" alt="Avatar" class="avatar" />
        <span class="profile-name">Élisa</span>
        <span class="dropdown-arrow">▼</span>
      </router-link>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2.5rem;
  background-color: #f7f3e8; 
  color: #2c2c2c;
  border-bottom: 1px solid #e6dfd1;
}


.navbar-left {
  display: flex;
  align-items: center;
  flex: 1; 
}

.logo {
  font-size: 1.4rem;
  font-weight: bold;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.logo-icon {
  background-color: #b85d38; 
  color: #fff;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.logo-text {
  color: #1a1a1a;
  font-family: serif;
  letter-spacing: -0.5px;
}

.navbar-center {
  display: flex;
  justify-content: center;
  gap: 3rem;
  flex: 1;
}

.nav-item {
  color: #555555;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  transition: color 0.2s;
  padding-bottom: 0.3rem;
}

.nav-item:hover {
  color: #b85d38;
}

.nav-item.router-link-exact-active {
  color: #b85d38;
  font-weight: bold;
  border-bottom: 2px solid #b85d38;
}

.navbar-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1.5rem;
  flex: 1;
}

.notification-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #444;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.notification-btn:hover {
  color: #b85d38;
}

.profile-link {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  color: #2c2c2c;
  font-weight: 500;
  font-size: 0.95rem;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.dropdown-arrow {
  font-size: 0.65rem;
  color: #666;
}

@media (max-width: 600px) {
  .navbar {
    flex-wrap: wrap;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
  }

  .navbar-left,
  .navbar-right {
    flex: 0 0 auto;
  }

  .navbar-right {
    gap: 0.8rem;
  }

  .navbar-center {
    order: 1;
    flex: 0 0 100%;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .nav-item {
    font-size: 0.82rem;
  }

  .profile-name,
  .dropdown-arrow {
    display: none;
  }
}
</style> 
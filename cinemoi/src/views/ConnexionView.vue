<template>
  <main class="auth-screen">
    <section class="cinema-panel" aria-label="Cinémoi">
      <router-link to="/login" class="cinema-logo" aria-label="Cinémoi, connexion">
        <span class="logo-mark">C</span>
        <span>Cinémoi</span>
      </router-link>

      <div class="cinema-copy">
        <p class="cinema-eyebrow">VOTRE CINÉMA, RIEN QU’À VOUS</p>
        <h1>Retrouvez les films qui ont compté.</h1>
        <p class="cinema-description">
          Composez votre cinémathèque, notez vos découvertes et gardez une trace de chaque émotion.
        </p>
      </div>

      <blockquote class="cinema-quote">
        <span></span>
        « Le cinéma substitue à notre regard un monde qui s’accorde à nos désirs. »
      </blockquote>

      
    </section>

    <section class="form-panel" aria-labelledby="auth-title">
      <router-link to="/" class="back-link"><span aria-hidden="true">←</span> Retour à l’exploration</router-link>

      <div class="form-content">
        <h2 id="auth-title">{{ isRegistering ? 'Rejoignez Cinémoi' : 'Bon retour parmi nous' }}</h2>
        <p class="form-intro">
          {{ isRegistering ? 'Créez votre espace pour commencer votre cinémathèque.' : 'Connectez-vous pour retrouver votre bibliothèque.' }}
        </p>

        <div class="email-divider"><span>ou avec votre adresse e-mail</span></div>

        <form class="auth-form" @submit.prevent="submitAuth">
          <label for="email">Adresse e-mail</label>
          <div class="input-wrap">
            <span aria-hidden="true">✉</span>
            <input
              id="email"
              v-model.trim="email"
              type="email"
              autocomplete="email"
              placeholder="vous@exemple.fr"
              required
            />
          </div>

          <div class="password-label-row">
            <label for="password">Mot de passe</label>
            <button v-if="!isRegistering" class="forgot-link" type="button" @click="showRecoveryMessage">
              Mot de passe oublié ?
            </button>
          </div>
          <div class="input-wrap">
            <span aria-hidden="true">♙</span>
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              :autocomplete="isRegistering ? 'new-password' : 'current-password'"
              :minlength="isRegistering ? 8 : undefined"
              placeholder="Votre mot de passe"
              required
            />
            <button
              class="visibility-button"
              type="button"
              :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
              @click="showPassword = !showPassword"
            >{{ showPassword ? 'Masquer' : 'Voir' }}</button>
          </div>

          <template v-if="isRegistering">
            <label for="confirm-password">Confirmer le mot de passe</label>
            <div class="input-wrap">
              <span aria-hidden="true">♙</span>
              <input
                id="confirm-password"
                v-model="confirmPassword"
                type="password"
                autocomplete="new-password"
                minlength="8"
                placeholder="Saisir le mot de passe à nouveau"
                required
              />
            </div>
          </template>

          <label v-if="!isRegistering" class="stay-signed-in">
            <input v-model="rememberMe" type="checkbox" />
            <span>Rester connecté</span>
          </label>

          <p v-if="errorMessage" class="form-message error-message" role="alert">{{ errorMessage }}</p>
          <p v-if="successMessage" class="form-message success-message" role="status">{{ successMessage }}</p>

          <button class="submit-button" type="submit" :disabled="loading">
            <span>{{ loading ? 'Un instant...' : isRegistering ? 'Créer mon compte' : 'Se connecter' }}</span>
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <p class="mode-switch">
          {{ isRegistering ? 'Vous avez déjà un compte ?' : 'Nouveau sur Cinémoi ?' }}
          <button type="button" @click="toggleMode">
            {{ isRegistering ? 'Se connecter' : 'Créer un compte' }}
          </button>
        </p>
      </div>

      <p class="legal-note">En continuant, vous acceptez nos Conditions d’utilisation et notre Politique de confidentialité.</p>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

const route = useRoute();
const router = useRouter();
const store = useStore();
const isRegistering = ref(route.query.mode === 'register');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const rememberMe = ref(true);
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const toggleMode = () => {
  isRegistering.value = !isRegistering.value;
  errorMessage.value = '';
  successMessage.value = '';
  password.value = '';
  confirmPassword.value = '';
};

const showRecoveryMessage = () => {
  errorMessage.value = 'La récupération du mot de passe sera disponible avec un service de compte en ligne.';
};

const submitAuth = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  if (isRegistering.value && password.value !== confirmPassword.value) {
    errorMessage.value = 'Les deux mots de passe ne correspondent pas.';
    return;
  }

  loading.value = true;
  try {
    await store.dispatch(isRegistering.value ? 'register' : 'login', {
      email: email.value,
      password: password.value,
      remember: rememberMe.value
    });

    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
      ? route.query.redirect
      : '/';
    await router.replace(redirect);
  } catch (error) {
    errorMessage.value = error.message || 'La connexion a échoué. Réessaie.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-screen {
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(440px, 0.88fr);
  min-height: 100vh;
  background: #f6f0e6;
  color: #302824;
}

.cinema-panel {
  position: relative;
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  padding: 2rem clamp(1.5rem, 3.6vw, 3.4rem) 2.1rem;
  background:
    linear-gradient(180deg, rgba(24, 15, 15, 0.3) 0%, rgba(24, 15, 15, 0.08) 35%, rgba(24, 15, 15, 0.76) 100%),
    linear-gradient(90deg, rgba(20, 13, 13, 0.48), rgba(20, 13, 13, 0.04)),
    url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1800&q=90') center/cover;
  color: #fffaf2;
}

.cinema-logo {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 0.6rem;
  color: #fffaf2;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.25rem;
  font-weight: 700;
  text-decoration: none;
}

.logo-mark,
.preview-avatar {
  display: grid;
  width: 34px;
  aspect-ratio: 1;
  place-items: center;
  border-radius: 50%;
  background: #c6532e;
  color: #fff;
  font-family: Georgia, 'Times New Roman', serif;
}

.cinema-copy {
  max-width: 620px;
  margin-top: auto;
  padding: 7rem 0 3rem;
}

.cinema-eyebrow,
.preview-eyebrow {
  color: #e2a94a;
  font-size: 0.72rem;
  font-weight: 700;
}

.cinema-copy h1 {
  max-width: 610px;
  margin: 1rem 0 1.1rem;
  color: #fffaf2;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2.8rem, 5vw, 4.5rem);
  font-weight: 500;
  line-height: 0.98;
}

.cinema-description {
  max-width: 460px;
  color: rgba(255, 250, 242, 0.8);
  font-size: 0.98rem;
  line-height: 1.55;
}

.cinema-quote {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  max-width: 600px;
  color: rgba(255, 250, 242, 0.88);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 0.9rem;
  font-style: italic;
}

.cinema-quote span {
  width: 24px;
  height: 1px;
  flex: 0 0 24px;
  background: #dfa13d;
}

.account-preview {
  position: absolute;
  top: 9%;
  right: 1.5%;
  width: min(245px, 40%);
  padding: 1rem;
  background: #fffaf2;
  color: #332c28;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.28);
}

.preview-eyebrow {
  margin-bottom: 0.8rem;
  color: #b64f2b;
  font-size: 0.63rem;
}

.preview-heading {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid #e7ded1;
}

.preview-avatar {
  width: 35px;
  flex: 0 0 35px;
}

.preview-heading div {
  display: grid;
  gap: 0.2rem;
  min-width: 0;
}

.preview-heading strong {
  font-size: 0.76rem;
}

.preview-heading div span {
  color: #81776e;
  font-size: 0.63rem;
}

.preview-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding-top: 0.75rem;
  font-size: 0.73rem;
}

.preview-row span {
  width: 16px;
  color: #675d54;
  text-align: center;
}

.form-panel {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  justify-content: space-between;
  padding: 2.3rem clamp(2rem, 5vw, 4.8rem) 1.8rem;
  background: #f6f0e6;
}

.back-link {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 0.55rem;
  color: #7c7168;
  font-size: 0.77rem;
  text-decoration: none;
}

.back-link:hover {
  color: #b64f2b;
}

.form-content {
  width: min(100%, 430px);
  margin: auto;
  padding: 3rem 0;
}

.form-content h2 {
  margin: 0;
  color: #302824;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2rem, 3.2vw, 2.65rem);
  line-height: 1.08;
}

.form-intro {
  margin: 0.6rem 0 1.7rem;
  color: #81776e;
  font-size: 0.88rem;
}

.email-divider {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 1.2rem;
  color: #8b8178;
  font-size: 0.68rem;
  white-space: nowrap;
}

.email-divider::before,
.email-divider::after {
  height: 1px;
  flex: 1;
  background: #d8cbbb;
  content: '';
}

.auth-form {
  display: grid;
  gap: 0.5rem;
}

.auth-form > label:not(.stay-signed-in),
.password-label-row label {
  margin-top: 0.25rem;
  color: #38302a;
  font-size: 0.76rem;
  font-weight: 700;
}

.password-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.5rem;
}

.forgot-link {
  padding: 0;
  border: 0;
  background: transparent;
  color: #b64f2b;
  font: inherit;
  font-size: 0.68rem;
  cursor: pointer;
}

.input-wrap {
  display: flex;
  align-items: center;
  min-height: 46px;
  border: 1px solid #d4c5b4;
  background: #fffaf2;
}

.input-wrap:focus-within {
  border-color: #c6532e;
  outline: 1px solid #c6532e;
}

.input-wrap > span {
  width: 40px;
  flex: 0 0 40px;
  color: #b64f2b;
  text-align: center;
}

.input-wrap input {
  width: 100%;
  min-width: 0;
  min-height: 44px;
  padding: 0.6rem 0.25rem;
  border: 0;
  outline: 0;
  background: transparent;
  color: #302824;
  font: inherit;
  font-size: 0.78rem;
}

.visibility-button {
  padding: 0 0.75rem;
  border: 0;
  background: transparent;
  color: #81776e;
  font: inherit;
  font-size: 0.67rem;
  cursor: pointer;
}

.stay-signed-in {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0.35rem 0 0.45rem;
  color: #81776e;
  font-size: 0.68rem;
}

.stay-signed-in input {
  accent-color: #c6532e;
}

.form-message {
  margin: 0.35rem 0;
  font-size: 0.78rem;
  line-height: 1.4;
}

.error-message {
  color: #a32828;
}

.success-message {
  color: #35764a;
}

.submit-button {
  display: flex;
  width: 100%;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  margin-top: 0.3rem;
  border: 1px solid #c6532e;
  background: #c6532e;
  color: #fffaf2;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

.submit-button:disabled {
  cursor: wait;
  opacity: 0.65;
}

.mode-switch {
  margin: 1rem 0 0;
  color: #81776e;
  font-size: 0.72rem;
  text-align: center;
}

.mode-switch button {
  padding: 0;
  border: 0;
  background: transparent;
  color: #7b6659;
  font: inherit;
  cursor: pointer;
}

.mode-switch button:hover {
  color: #b64f2b;
  text-decoration: underline;
}

.legal-note {
  margin: 1.5rem 0 0;
  color: #9a9087;
  font-size: 0.62rem;
  line-height: 1.45;
  text-align: center;
}

@media (max-width: 900px) {
  .auth-screen {
    grid-template-columns: minmax(0, 0.9fr) minmax(390px, 1.1fr);
  }

  .account-preview {
    display: none;
  }
}

@media (max-width: 680px) {
  .auth-screen {
    grid-template-columns: 1fr;
  }

  .cinema-panel {
    min-height: 35vh;
    padding: 1.2rem 1.25rem;
  }

  .cinema-copy {
    padding: 4rem 0 0.5rem;
  }

  .cinema-copy h1 {
    max-width: 520px;
    font-size: clamp(2.2rem, 10vw, 3.2rem);
  }

  .cinema-description,
  .cinema-quote {
    display: none;
  }

  .form-panel {
    min-height: 65vh;
    padding: 1.25rem;
  }

  .form-content {
    padding: 2.5rem 0;
  }
}
</style>

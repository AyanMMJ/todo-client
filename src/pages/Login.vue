<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo-section">
          <div class="logo-icon">🎯</div>
          <h1 class="login-title">Welcome Back</h1>
          <p class="login-subtitle">Sign in to continue your productivity journey</p>
        </div>
      </div>

      <form @submit.prevent="onFormSubmit" class="login-form">
        <!-- Email input -->
        <div class="form-group">
          <label class="form-label" for="email">
            <i class="fas fa-envelope"></i>
            Email Address
          </label>
          <input
            type="email"
            id="email"
            v-model="email"
            class="form-control"
            placeholder="Enter your email"
            required
          />
        </div>

        <!-- Password input -->
        <div class="form-group">
          <label class="form-label" for="password">
            <i class="fas fa-lock"></i>
            Password
          </label>
          <input
            type="password"
            id="password"
            v-model="password"
            class="form-control"
            placeholder="Enter your password"
            required
          />
        </div>

        <!-- Submit button -->
        <button type="submit" class="btn btn-primary login-btn" :disabled="isLoading">
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>
            <i class="fas fa-sign-in-alt"></i>
            {{ isLoading ? 'Signing In...' : 'Sign In' }}
          </span>
        </button>

        <!-- Register link -->
        <div class="register-link">
          <p>
            Don't have an account?
            <router-link :to="{ name: 'Register' }" class="link-text">
              Create one here
            </router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { loginUser } from "@/services/api";
import store from "@/store/store";
import router from "@/router";

const email = ref("");
const password = ref("");
const isLoading = ref(false);

onMounted(() => {
  const storedUserData = localStorage.getItem("userData");
  if (storedUserData) {
    const userData = JSON.parse(storedUserData);
    store.commit("setUser", userData);
    router.push({ name: "Dashboard" });
  }
});

const login = async () => {
  if (!email.value || !password.value) {
    showNotification("Please fill in all fields", "error");
    return;
  }

  isLoading.value = true;
  
  const user = {
    email: email.value,
    password: password.value,
  };

  try {
    const response = await loginUser(user);
    const { token, email, picture, _id } = response;
    const userData = {
      token,
      _id,
      email,
      pictureUrl: picture,
    };

    // Save user data in localStorage
    localStorage.setItem("userData", JSON.stringify(userData));

    // Set the user state in the Vuex store
    store.commit("setUser", userData);

    showNotification("Welcome back! 🎉", "success");

    // Redirect to dashboard
    setTimeout(() => {
      router.push({ name: "Dashboard" });
    }, 1000);
  } catch (error) {
    console.error("Login failed:", error);
    showNotification("Login failed. Please check your credentials.", "error");
  } finally {
    isLoading.value = false;
  }
};

const onFormSubmit = () => {
  login();
};

const showNotification = (message, type = "info") => {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
};
</script>

<style scoped>
.login-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideUp 0.6s ease;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-section {
  margin-bottom: 1.5rem;
}

.logo-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.login-title {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.login-subtitle {
  color: #6c757d;
  font-size: 1.1rem;
  margin: 0.5rem 0 0 0;
  font-weight: 400;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.form-label i {
  color: #667eea;
}

.form-control {
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  background: rgba(255, 255, 255, 0.95);
}

.form-control::placeholder {
  color: #6c757d;
  opacity: 0.7;
}

.login-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.register-link {
  text-align: center;
  margin-top: 1rem;
}

.register-link p {
  color: #6c757d;
  margin: 0;
}

.link-text {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.link-text:hover {
  color: #764ba2;
  text-decoration: underline;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 480px) {
  .login-container {
    padding: 1rem;
  }

  .login-card {
    padding: 2rem 1.5rem;
  }

  .login-title {
    font-size: 2rem;
  }

  .logo-icon {
    font-size: 3rem;
  }
}

/* Notification Styles */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  color: #333;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  z-index: 1000;
  max-width: 300px;
}

.notification.show {
  transform: translateX(0);
}

.notification-success {
  border-left: 4px solid #28a745;
}

.notification-error {
  border-left: 4px solid #dc3545;
}

.notification-info {
  border-left: 4px solid #17a2b8;
}
</style>

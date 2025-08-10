<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <div class="logo-section">
          <div class="logo-icon">🚀</div>
          <h1 class="register-title">Join Us</h1>
          <p class="register-subtitle">Create your account and start organizing your life</p>
        </div>
      </div>

      <form @submit.prevent="onFormSubmit" class="register-form">
        <!-- Picture URL input -->
        <div class="form-group">
          <label class="form-label" for="pictureUrl">
            <i class="fas fa-image"></i>
            Profile Picture URL
          </label>
          <input
            type="url"
            id="pictureUrl"
            v-model="pictureUrl"
            class="form-control"
            placeholder="https://example.com/your-photo.jpg"
          />
        </div>

        <!-- Name inputs -->
        <div class="name-group">
          <div class="form-group">
            <label class="form-label" for="firstname">
              <i class="fas fa-user"></i>
              First Name
            </label>
            <input
              type="text"
              id="firstname"
              v-model="firstName"
              class="form-control"
              placeholder="Enter your first name"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="lastname">
              <i class="fas fa-user"></i>
              Last Name
            </label>
            <input
              type="text"
              id="lastname"
              v-model="lastName"
              class="form-control"
              placeholder="Enter your last name"
              required
            />
          </div>
        </div>

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
            placeholder="Create a strong password"
            required
          />
        </div>

        <!-- Submit button -->
        <button type="submit" class="btn btn-primary register-btn" :disabled="isLoading">
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>
            <i class="fas fa-user-plus"></i>
            {{ isLoading ? 'Creating Account...' : 'Create Account' }}
          </span>
        </button>

        <!-- Login link -->
        <div class="login-link">
          <p>
            Already have an account?
            <router-link :to="{ name: 'Login' }" class="link-text">
              Sign in here
            </router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { registerUser } from "@/services/api";
import store from "@/store/store";
import router from "@/router";

const email = ref("");
const password = ref("");
const firstName = ref("");
const lastName = ref("");
const pictureUrl = ref("");
const isLoading = ref(false);

onMounted(() => {
  if (store.getters.user != null) {
    router.push({ name: "Dashboard" });
  }
});

const register = async () => {
  if (!email.value || !password.value || !firstName.value || !lastName.value) {
    showNotification("Please fill in all required fields", "error");
    return;
  }

  isLoading.value = true;

  const user = {
    email: email.value,
    password: password.value,
    first_name: firstName.value,
    last_name: lastName.value,
    picture: pictureUrl.value,
  };

  try {
    const response = await registerUser(user);
    const { token, email, picture, _id } = response;
    const userData = {
      token,
      _id,
      email,
      pictureUrl: picture,
    };

    // Save user data to local storage
    localStorage.setItem("userData", JSON.stringify(userData));

    // Update the user store with the registered user data
    store.commit("setUser", userData);

    showNotification("Account created successfully! Welcome aboard! 🎉", "success");

    setTimeout(() => {
      router.push({ name: "Dashboard" });
    }, 1000);
  } catch (error) {
    console.error("Registration failed:", error);
    showNotification("Registration failed. Please try again.", "error");
  } finally {
    isLoading.value = false;
  }
};

const onFormSubmit = () => {
  register();
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
.register-container {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
}

.register-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideUp 0.6s ease;
}

.register-header {
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

.register-title {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.register-subtitle {
  color: #6c757d;
  font-size: 1.1rem;
  margin: 0.5rem 0 0 0;
  font-weight: 400;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.name-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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

.register-btn {
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

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.register-btn:disabled {
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

.login-link {
  text-align: center;
  margin-top: 1rem;
}

.login-link p {
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
@media (max-width: 768px) {
  .register-container {
    padding: 1rem;
  }

  .register-card {
    padding: 2rem 1.5rem;
  }

  .register-title {
    font-size: 2rem;
  }

  .logo-icon {
    font-size: 3rem;
  }

  .name-group {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .register-container {
    padding: 0.5rem;
  }

  .register-card {
    padding: 1.5rem 1rem;
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

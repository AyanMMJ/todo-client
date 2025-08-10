<template>
  <div class="todo-container">
    <div class="todo-card">
      <!-- Header Section -->
      <div class="todo-header">
        <div class="header-content">
          <h1 class="todo-title">
            <span class="title-icon">📝</span>
            My Todo List
          </h1>
          <p class="todo-subtitle">Stay organized and productive</p>
        </div>
        <div class="header-actions">
          <button @click="deleteAll" class="btn btn-danger btn-sm action-btn" title="Delete all todos">
            <i class="fas fa-trash"></i>
            Clear All
          </button>
          <button @click="logout" class="btn btn-warning btn-sm action-btn" title="Logout">
            <i class="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </div>

      <!-- Add Todo Form -->
      <div class="add-todo-section">
        <form @submit.prevent="addTodo" class="add-todo-form">
          <div class="input-group">
            <input
              v-model="newTodo"
              @keydown.enter="addTodoOnEnter"
              type="text"
              class="form-control todo-input"
              placeholder="What needs to be done?"
              maxlength="200"
            />
            <button type="submit" class="btn btn-primary add-btn" :disabled="!newTodo.trim()">
              <i class="fas fa-plus"></i>
              Add
            </button>
          </div>
        </form>
      </div>

      <!-- Todo List -->
      <div class="todo-list-section">
        <div v-if="todoList.length === 0" class="empty-state">
          <div class="empty-icon">🎯</div>
          <h3>No todos yet!</h3>
          <p>Start by adding your first todo above</p>
        </div>
        
        <div v-else class="todo-list">
          <div
            v-for="(todo, index) in todoList"
            :key="index"
            class="todo-item"
            :class="{ 'completed': todo.completed }"
          >
            <div class="todo-content">
              <div class="todo-checkbox">
                <input
                  type="checkbox"
                  :checked="todo.completed"
                  @change="checkCompleted(index)"
                  class="custom-checkbox"
                  :id="`todo-${index}`"
                />
                <label :for="`todo-${index}`" class="checkbox-label"></label>
              </div>
              <span class="todo-text" :class="{ 'completed-text': todo.completed }">
                {{ todo.task }}
              </span>
            </div>
            <div class="todo-actions">
              <button
                @click="deleteTodoTask(index)"
                class="btn btn-outline-danger btn-sm delete-btn"
                title="Delete todo"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Section -->
      <div v-if="todoList.length > 0" class="progress-section">
        <div class="progress-info">
          <span class="progress-text">
            {{ completedCount }} of {{ todoList.length }} completed
          </span>
          <div class="progress-bar-container">
            <div 
              class="progress-bar" 
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import store from "@/store/store";
import router from "@/router";
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  deleteAllTodos,
} from "../services/api";

const todoList = ref([]);
const newTodo = ref("");

// Computed properties
const completedCount = computed(() => {
  return todoList.value.filter(todo => todo.completed).length;
});

const progressPercentage = computed(() => {
  if (todoList.value.length === 0) return 0;
  return Math.round((completedCount.value / todoList.value.length) * 100);
});

onMounted(() => {
  const storedUserData = localStorage.getItem("userData");
  if (!storedUserData) {
    router.push({ name: "Login" });
    return;
  }

  try {
    const userData = JSON.parse(storedUserData);

    if (!store.getters.user) {
      console.log("User state not populated, initializing it with data from local storage");
      store.commit("setUser", userData);
    }

    fetchTodos(userData._id);
  } catch (error) {
    console.error("Error parsing user data:", error);
    router.push({ name: "Login" });
  }
});

const fetchTodos = async (userId) => {
  try {
    const res = await getTodos(userId);
    todoList.value = res;
  } catch (error) {
    console.error("Error fetching todos:", error);
    showNotification("Failed to fetch todos. Please try again later.", "error");
  }
};

const addTodo = async () => {
  if (!newTodo.value.trim()) return;

  const todo = {
    task: newTodo.value.trim(),
    completed: false,
    created_at: Date.now(),
    completed_time: null,
  };

  try {
    await createTodo(todo, store.getters.user._id);
    fetchTodos(store.getters.user._id);
    newTodo.value = "";
    showNotification("Todo added successfully! 🎉", "success");
  } catch (error) {
    console.error("Error adding todo:", error);
    showNotification("Failed to add todo. Please try again later.", "error");
  }
};

const addTodoOnEnter = (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addTodo();
  }
};

const checkCompleted = async (index) => {
  const todo = todoList.value[index];
  todo.completed = !todo.completed;

  try {
    await updateTodo(todo);
    showNotification(todo.completed ? "Great job! Keep it up! 🎯" : "No worries, you'll get it next time! 💪", "success");
  } catch (error) {
    console.error("Error updating todo:", error);
    showNotification("Failed to update todo. Please try again later.", "error");
    // Revert the change if update failed
    todo.completed = !todo.completed;
  }
};

const deleteTodoTask = async (index) => {
  try {
    await deleteTodo(todoList.value[index]._id);
    todoList.value.splice(index, 1);
    showNotification("Todo deleted successfully!", "success");
  } catch (error) {
    console.error("Error deleting todo:", error);
    showNotification("Failed to delete todo. Please try again later.", "error");
  }
};

const deleteAll = async () => {
  if (todoList.value.length === 0) {
    showNotification("No todos to delete!", "info");
    return;
  }
  
  if (!confirm("Are you sure you want to delete all todos? This action cannot be undone.")) {
    return;
  }

  try {
    await deleteAllTodos(store.getters.user._id);
    todoList.value = [];
    showNotification("All todos deleted successfully!", "success");
  } catch (error) {
    console.error("Error deleting todos:", error);
    showNotification("Failed to delete todos. Please try again later.", "error");
  }
};

const logout = () => {
  localStorage.removeItem("userData");
  store.commit("setUser", null);
  router.push({ name: "Login" });
  showNotification("Logged out successfully!", "info");
};

const showNotification = (message, type = "info") => {
  // Create a simple notification system
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
.todo-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.todo-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-content {
  flex: 1;
}

.todo-title {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.title-icon {
  font-size: 2rem;
}

.todo-subtitle {
  color: #6c757d;
  font-size: 1.1rem;
  margin: 0.5rem 0 0 0;
  font-weight: 400;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-btn {
  border-radius: 12px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.add-todo-section {
  margin-bottom: 2rem;
}

.add-todo-form {
  width: 100%;
}

.input-group {
  display: flex;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 0.5rem;
  border: 2px solid rgba(102, 126, 234, 0.2);
  transition: all 0.3s ease;
}

.input-group:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  background: rgba(255, 255, 255, 0.95);
}

.todo-input {
  border: none;
  background: transparent;
  flex: 1;
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
  border-radius: 12px;
}

.todo-input:focus {
  outline: none;
  box-shadow: none;
}

.add-btn {
  border-radius: 12px;
  padding: 1rem 2rem;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.todo-list-section {
  margin-bottom: 2rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #6c757d;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #495057;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.todo-item {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2px solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;
  animation: slideIn 0.3s ease;
  position: relative;
  overflow: hidden;
}

.todo-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.todo-item:hover::before {
  left: 100%;
}

.todo-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: rgba(102, 126, 234, 0.3);
}

.todo-item.completed {
  background: rgba(40, 167, 69, 0.1);
  border-color: rgba(40, 167, 69, 0.3);
}

.todo-item.completed::after {
  content: '✓';
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #28a745;
  font-size: 1.2rem;
  font-weight: bold;
  opacity: 0.7;
}

.todo-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.todo-checkbox {
  position: relative;
}

.custom-checkbox {
  appearance: none;
  width: 24px;
  height: 24px;
  border: 2px solid #667eea;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

.custom-checkbox:checked {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
}

.custom-checkbox:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.checkbox-label {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.todo-text {
  font-size: 1.1rem;
  color: #495057;
  font-weight: 500;
  transition: all 0.3s ease;
  word-break: break-word;
  flex: 1;
}

.completed-text {
  text-decoration: line-through;
  color: #6c757d;
  opacity: 0.7;
}

.todo-actions {
  display: flex;
  gap: 0.5rem;
}

.delete-btn {
  border-radius: 8px;
  padding: 0.5rem;
  transition: all 0.3s ease;
  border: 2px solid #dc3545;
  color: #dc3545;
  background: transparent;
}

.delete-btn:hover {
  background: #dc3545;
  color: white;
  transform: scale(1.05);
}

.progress-section {
  border-top: 2px solid rgba(102, 126, 234, 0.1);
  padding-top: 1.5rem;
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-text {
  font-weight: 600;
  color: #495057;
  text-align: center;
}

.progress-bar-container {
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  height: 8px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .todo-card {
    padding: 1.5rem;
    margin: 1rem;
  }

  .todo-header {
    flex-direction: column;
    align-items: stretch;
  }

  .todo-title {
    font-size: 2rem;
  }

  .header-actions {
    justify-content: center;
  }

  .input-group {
    flex-direction: column;
  }

  .add-btn {
    width: 100%;
    justify-content: center;
  }

  .todo-item {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .todo-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
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

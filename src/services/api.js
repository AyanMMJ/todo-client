import axios from "axios";

// API Base URL - Change this to your local server when using MongoDB Compass
const API_BASE_URL = 'https://todo-app-server-eosin.vercel.app/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userData') 
      ? JSON.parse(localStorage.getItem('userData')).token 
      : null;
    
    if (token) {
      config.headers['x-access-token'] = token;
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export async function registerUser(userData) {
  try {
    const response = await api.post('/users/register', userData);
    return response.data.data || response.data; // Handle both new and old response formats
  } catch (error) {
    throw error.response?.data || error;
  }
}

export async function loginUser(userData) {
  try {
    const response = await api.post('/users/login', userData);
    return response.data.data || response.data; // Handle both new and old response formats
  } catch (error) {
    throw error.response?.data || error;
  }
}

export async function getTodos(userId) {
  try {
    const response = await api.get('/todos', {
      params: { userId }
    });
    return response.data.data || response.data; // Handle both new and old response formats
  } catch (error) {
    throw error.response?.data || error;
  }
}

export async function createTodo(todo, userId) {
  try {
    const response = await api.post('/todos', todo, {
      params: { userId }
    });
    return response.data.data || response.data; // Handle both new and old response formats
  } catch (error) {
    throw error.response?.data || error;
  }
}

export async function updateTodo(todo) {
  try {
    if (todo.completed) {
      todo.completed_time = Date.now();
    } else {
      todo.completed_time = null;
    }

    const response = await api.put(`/todos/${todo._id}`, todo);
    return response.data.data || response.data; // Handle both new and old response formats
  } catch (error) {
    throw error.response?.data || error;
  }
}

export async function deleteTodo(id) {
  try {
    const response = await api.delete(`/todos/${id}`);
    return response.data.data || response.data; // Handle both new and old response formats
  } catch (error) {
    throw error.response?.data || error;
  }
}

export async function deleteAllTodos(userId) {
  try {
    const response = await api.delete('/todos/delete/all', {
      params: { userId }
    });
    return response.data.data || response.data; // Handle both new and old response formats
  } catch (error) {
    throw error.response?.data || error;
  }
}

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// O IP 10.0.2.2 é um atalho especial do Emulador Android para acessar o localhost do seu PC
const api = axios.create({ 
  baseURL: 'http://10.0.2.2:3001' 
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

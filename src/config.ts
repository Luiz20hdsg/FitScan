import { Platform } from 'react-native';

// URL base da API - centralizada para fácil manutenção
// iOS usa localhost, Android emulator usa 10.0.2.2 para acessar o host
export const API_URL = Platform.OS === 'ios'
  ? 'http://localhost:8000'
  : 'http://10.0.2.2:8000';

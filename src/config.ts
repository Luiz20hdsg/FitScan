import { Platform } from 'react-native';
import Config from 'react-native-config';

/**
 * Configuração centralizada do FitScan
 * Lê variáveis de ambiente do arquivo .env via react-native-config
 */

// URL base da API - usa .env ou fallback baseado na plataforma
const getApiUrl = (): string => {
  if (Config.API_URL) {
    return Config.API_URL;
  }
  // Fallback para desenvolvimento
  return Platform.OS === 'ios'
    ? 'http://localhost:8000'
    : 'http://10.0.2.2:8000';
};

export const API_URL = getApiUrl();

// OneSignal App ID
export const ONESIGNAL_APP_ID = Config.ONESIGNAL_APP_ID || '';

// App info
export const APP_VERSION = Config.APP_VERSION || '1.0.0';
export const APP_ENV = Config.APP_ENV || 'development';
export const IS_PRODUCTION = APP_ENV === 'production';

/**
 * FitScan - Serviço de Notificações (OneSignal)
 *
 * Gerencia push notifications para engajamento do usuário:
 * - Lembretes diários de treino
 * - Motivação e dicas
 * - Re-engajamento de usuários inativos
 * - Comemorações de conquistas
 */

import { OneSignal } from 'react-native-onesignal';
import { ONESIGNAL_APP_ID } from '../config';

/**
 * Inicializa o OneSignal SDK.
 * Deve ser chamado no App.tsx antes do NavigationContainer.
 */
export function initializeNotifications(): void {
  if (!ONESIGNAL_APP_ID || ONESIGNAL_APP_ID === 'your-onesignal-app-id-here') {
    console.log('[Notifications] OneSignal App ID não configurado - notificações desativadas');
    return;
  }

  try {
    // Inicializar OneSignal
    OneSignal.initialize(ONESIGNAL_APP_ID);

    // Solicitar permissão de notificação
    OneSignal.Notifications.requestPermission(true);

    // Listener para quando o usuário clica em uma notificação
    OneSignal.Notifications.addEventListener('click', (event: any) => {
      console.log('[Notifications] Notificação clicada:', event.notification);
      // Aqui pode-se navegar para uma tela específica baseado no payload
      const data = event.notification.additionalData as Record<string, string> | undefined;
      if (data?.screen) {
        // Navegação será tratada no App.tsx via deep linking
        console.log('[Notifications] Navegar para:', data.screen);
      }
    });

    // Listener para notificações recebidas em foreground
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event: any) => {
      console.log('[Notifications] Notificação recebida em foreground');
      // Exibe a notificação mesmo com o app aberto
      event.getNotification().display();
    });

    console.log('[Notifications] OneSignal inicializado com sucesso');
  } catch (error) {
    console.error('[Notifications] Erro ao inicializar OneSignal:', error);
  }
}

/**
 * Registra tags do usuário para segmentação de notificações.
 * Usado para personalizar notificações baseado no perfil.
 */
export function setUserTags(tags: Record<string, string | number | boolean>): void {
  if (!ONESIGNAL_APP_ID || ONESIGNAL_APP_ID === 'your-onesignal-app-id-here') {
    return;
  }

  try {
    // Converter todos os valores para string para OneSignal
    const stringTags: Record<string, string> = {};
    for (const [key, value] of Object.entries(tags)) {
      stringTags[key] = String(value);
    }
    OneSignal.User.addTags(stringTags);
  } catch (error) {
    console.error('[Notifications] Erro ao definir tags:', error);
  }
}

/**
 * Define o ID externo do usuário (para vincular ao backend).
 */
export function setExternalUserId(userId: string): void {
  if (!ONESIGNAL_APP_ID || ONESIGNAL_APP_ID === 'your-onesignal-app-id-here') {
    return;
  }

  try {
    OneSignal.login(userId);
  } catch (error) {
    console.error('[Notifications] Erro ao definir External User ID:', error);
  }
}

/**
 * Remove o ID externo (ao fazer logout).
 */
export function removeExternalUserId(): void {
  if (!ONESIGNAL_APP_ID || ONESIGNAL_APP_ID === 'your-onesignal-app-id-here') {
    return;
  }

  try {
    OneSignal.logout();
  } catch (error) {
    console.error('[Notifications] Erro ao remover External User ID:', error);
  }
}

/**
 * Configura tags de engajamento baseado no uso do app.
 * Chamado em momentos-chave para segmentação no OneSignal Dashboard.
 *
 * No OneSignal Dashboard, configure os seguintes Automated Messages:
 *
 * 1. LEMBRETE DIÁRIO DE TREINO (19h)
 *    Segmento: tag "completed_onboarding" = "true"
 *    Mensagem: "Ei, {name}! Não esquece do seu treino hoje 💪"
 *
 * 2. RE-ENGAJAMENTO (3 dias sem abrir)
 *    Segmento: Last Session > 3 days ago
 *    Mensagem: "Sentimos sua falta! Seu plano personalizado está esperando por você 🎯"
 *
 * 3. MOTIVAÇÃO SEMANAL (segunda 8h)
 *    Segmento: tag "completed_onboarding" = "true"
 *    Mensagem: "Nova semana, novo treino! Que tal começar com força? ⚡"
 *
 * 4. LEMBRETE NUTRISCAN (12h)
 *    Segmento: tag "used_nutriscan" = "true"
 *    Mensagem: "Hora do almoço! 🍽️ Escaneie sua refeição para manter o controle."
 */
export function trackEngagement(event: string, metadata?: Record<string, string>): void {
  setUserTags({
    [`last_${event}`]: new Date().toISOString(),
    ...(metadata || {}),
  });
}

/**
 * Tags predefinidas para eventos de engajamento
 */
export const EngagementEvents = {
  COMPLETED_ONBOARDING: 'completed_onboarding',
  BODY_SCAN: 'body_scan',
  MEAL_SCAN: 'meal_scan',
  WORKOUT_GENERATED: 'workout_generated',
  APP_OPENED: 'app_opened',
  USED_NUTRISCAN: 'used_nutriscan',
  USED_COACH: 'used_coach',
} as const;

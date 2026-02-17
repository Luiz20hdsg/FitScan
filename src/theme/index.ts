/**
 * FitScan Design System
 * Inspirado no minimalismo de Jony Ive: clareza, profundidade sutil, espaço para respirar.
 * Paleta: degradê vibrante azul-índigo → ciano/turquesa, com fundo escuro sofisticado.
 */

export const Colors = {
  // Gradiente principal - Azul profundo → Turquesa energético
  gradientStart: '#6366F1',   // Indigo vibrante
  gradientEnd: '#06B6D4',     // Ciano/Turquesa

  // Gradiente secundário (para cards de destaque)
  gradientAccentStart: '#8B5CF6', // Violeta
  gradientAccentEnd: '#06B6D4',   // Ciano

  // Fundos
  background: '#0A0A0F',        // Quase-preto com tom azulado
  surface: '#12121A',           // Cards primários
  surfaceLight: '#1A1A28',      // Cards secundários
  surfaceHighlight: '#22223A',  // Hover/pressed states

  // Textos
  textPrimary: '#F8FAFC',       // Branco suave (não puro)
  textSecondary: '#94A3B8',     // Cinza azulado
  textMuted: '#64748B',         // Cinza mais escuro
  textOnGradient: '#FFFFFF',    // Branco puro sobre gradiente

  // Acentos
  accent: '#6366F1',            // Índigo (cor primária)
  accentLight: '#818CF8',       // Índigo claro
  success: '#10B981',           // Verde esmeralda
  warning: '#F59E0B',           // Âmbar
  error: '#EF4444',             // Vermelho
  info: '#06B6D4',              // Ciano

  // Macros (NutriScan)
  protein: '#F472B6',           // Rosa
  carbs: '#34D399',             // Verde menta
  fat: '#FBBF24',               // Dourado

  // Bordas e separadores
  border: '#1E293B',
  borderLight: '#334155',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.6)',
};

export const Gradients = {
  primary: [Colors.gradientStart, Colors.gradientEnd] as const,
  accent: [Colors.gradientAccentStart, Colors.gradientAccentEnd] as const,
  dark: ['#12121A', '#0A0A0F'] as const,
  card: ['#1A1A28', '#12121A'] as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  glow: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
};

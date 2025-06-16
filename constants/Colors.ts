export const lightColors = {
  primary: '#008080',
  accent: '#FFC107',
  secondary: '#20B2AA',
  background: '#F9F9F9',
  surface: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  textLight: '#999999',
  success: '#28A745',
  warning: '#FFC107',
  error: '#E53935',
  border: '#E0E0E0',
  divider: '#F0F0F0',
  overlay: 'rgba(0,0,0,0.5)',
  mpesaGreen: '#00A651',
};

export const darkColors = {
  primary: '#00A0A0',
  accent: '#FFD54F',
  secondary: '#26C6DA',
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textLight: '#808080',
  success: '#4CAF50',
  warning: '#FFD54F',
  error: '#F44336',
  border: '#333333',
  divider: '#2A2A2A',
  overlay: 'rgba(0,0,0,0.7)',
  mpesaGreen: '#00C853',
};

export type ThemeColors = typeof lightColors;

// Legacy export for backward compatibility
export const Colors = lightColors;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
};
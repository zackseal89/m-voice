import { StyleSheet } from 'react-native';

// Typography styles without colors - colors will be applied dynamically
export const Typography = StyleSheet.create({
  h1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 30,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
});

// Helper function to create themed typography styles
export const createThemedTypography = (colors: any) => StyleSheet.create({
  h1: {
    ...Typography.h1,
    color: colors.text,
  },
  h2: {
    ...Typography.h2,
    color: colors.text,
  },
  h3: {
    ...Typography.h3,
    color: colors.text,
  },
  h4: {
    ...Typography.h4,
    color: colors.text,
  },
  body: {
    ...Typography.body,
    color: colors.text,
  },
  bodySmall: {
    ...Typography.bodySmall,
    color: colors.textSecondary,
  },
  caption: {
    ...Typography.caption,
    color: colors.textLight,
  },
  button: {
    ...Typography.button,
  },
  buttonSmall: {
    ...Typography.buttonSmall,
  },
});
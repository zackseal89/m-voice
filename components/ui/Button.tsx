import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Spacing, BorderRadius } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/hooks/useTheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const { colors } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size styles
    if (size === 'small') {
      baseStyle.paddingVertical = Spacing.sm;
      baseStyle.paddingHorizontal = Spacing.md;
      baseStyle.minHeight = 36;
    } else if (size === 'large') {
      baseStyle.paddingVertical = Spacing.md;
      baseStyle.paddingHorizontal = Spacing.lg;
      baseStyle.minHeight = 56;
    } else {
      baseStyle.paddingVertical = Spacing.sm + 4;
      baseStyle.paddingHorizontal = Spacing.lg;
      baseStyle.minHeight = 48;
    }

    // Variant styles
    if (variant === 'primary') {
      baseStyle.backgroundColor = colors.primary;
    } else if (variant === 'secondary') {
      baseStyle.backgroundColor = colors.accent;
    } else if (variant === 'outline') {
      baseStyle.backgroundColor = 'transparent';
      baseStyle.borderWidth = 1;
      baseStyle.borderColor = colors.primary;
    } else if (variant === 'text') {
      baseStyle.backgroundColor = 'transparent';
    }

    // Disabled state
    if (disabled || loading) {
      baseStyle.opacity = 0.6;
    }

    // Full width
    if (fullWidth) {
      baseStyle.width = '100%';
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle = size === 'small' ? Typography.buttonSmall : Typography.button;
    
    let color = colors.surface;
    if (variant === 'outline' || variant === 'text') {
      color = colors.primary;
    }

    return {
      ...baseStyle,
      color,
      ...textStyle,
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'text' ? colors.primary : colors.surface}
          style={{ marginRight: Spacing.sm }}
        />
      )}
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
}
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Gradients, FontSize, FontWeight, BorderRadius, Shadow } from '../theme';

type GradientButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  variant?: 'primary' | 'accent';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: string;
};

export const GradientButton = ({
  title,
  onPress,
  loading = false,
  loadingText,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
  icon,
}: GradientButtonProps) => {
  const gradient = variant === 'accent' ? Gradients.accent : Gradients.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.wrapper, style]}>
      <LinearGradient
        colors={disabled ? [Colors.surfaceHighlight, Colors.surfaceLight] : [...gradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, disabled && styles.disabled]}>
        {loading ? (
          <>
            <ActivityIndicator color={Colors.textOnGradient} size="small" />
            {loadingText && (
              <Text style={[styles.text, styles.loadingText, textStyle]}>
                {loadingText}
              </Text>
            )}
          </>
        ) : (
          <>
            {icon && <Text style={styles.icon}>{icon}</Text>}
            <Text style={[styles.text, textStyle]}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

type OutlineButtonProps = {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: string;
};

export const OutlineButton = ({
  title,
  onPress,
  style,
  textStyle,
  icon,
}: OutlineButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.outlineButton, style]}>
      {icon && <Text style={styles.outlineIcon}>{icon}</Text>}
      <Text style={[styles.outlineText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    ...Shadow.md,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.lg,
    minHeight: 56,
    gap: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: Colors.textOnGradient,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.3,
  },
  loadingText: {
    marginLeft: 4,
  },
  icon: {
    fontSize: 20,
  },
  outlineButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    backgroundColor: 'transparent',
    minHeight: 56,
    gap: 8,
  },
  outlineText: {
    color: Colors.accentLight,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  outlineIcon: {
    fontSize: 20,
  },
});

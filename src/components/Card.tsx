import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, BorderRadius, Shadow } from '../theme';

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: boolean;
};

export const Card = ({ children, style, gradient = false }: CardProps) => {
  if (gradient) {
    return (
      <LinearGradient
        colors={[Colors.surfaceLight, Colors.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, style]}>
        {children}
      </LinearGradient>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
});

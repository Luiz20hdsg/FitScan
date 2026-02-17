import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../theme';
import { GradientButton, OutlineButton } from '../components/Buttons';
import { useUser } from '../context/UserContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type WelcomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const WelcomeScreen = ({ navigation }: WelcomeScreenProps) => {
  const { loginAsGuest } = useUser();

  const handleGetStarted = () => {
    loginAsGuest();
    navigation.replace('Onboarding');
  };

  const handleLogin = () => {
    navigation.navigate('Auth');
  };

  return (
    <LinearGradient
      colors={[Colors.background, '#0F0F1A', Colors.background]}
      style={styles.container}>
      {/* Glow decorativo no topo */}
      <View style={styles.glowContainer}>
        <LinearGradient
          colors={[Colors.gradientStart + '30', Colors.gradientEnd + '15', 'transparent']}
          style={styles.glowCircle}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>

      <View style={styles.content}>
        {/* Logo e Branding */}
        <View style={styles.brandingSection}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoGradient}>
              <Icon name="flash" size={38} color={Colors.textOnGradient} />
            </LinearGradient>
          </View>

          <Text style={styles.appName}>FitScan</Text>
          <Text style={styles.tagline}>
            Seu Personal Trainer{'\n'}e Nutricionista de Bolso
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <FeatureItem iconName="scan-outline" text="Escaneie refeições com IA" />
          <FeatureItem iconName="barbell-outline" text="Treinos personalizados" />
          <FeatureItem iconName="trending-up-outline" text="Acompanhe sua evolução" />
        </View>

        {/* Botões */}
        <View style={styles.buttonsSection}>
          <GradientButton
            title="Começar Agora"
            onPress={handleGetStarted}
          />

          <OutlineButton
            title="Já tenho uma conta"
            onPress={handleLogin}
          />

          <Text style={styles.termsText}>
            Ao continuar, você concorda com nossos{' '}
            <Text style={styles.termsLink}>Termos de Uso</Text> e{' '}
            <Text style={styles.termsLink}>Política de Privacidade</Text>
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const FeatureItem = ({ iconName, text }: { iconName: string; text: string }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIconBg}>
      <Icon name={iconName} size={22} color={Colors.accentLight} />
    </View>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glowContainer: {
    position: 'absolute',
    top: -SCREEN_HEIGHT * 0.15,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  glowCircle: {
    width: SCREEN_HEIGHT * 0.5,
    height: SCREEN_HEIGHT * 0.5,
    borderRadius: SCREEN_HEIGHT * 0.25,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['2xl'],
    paddingTop: SCREEN_HEIGHT * 0.12,
    paddingBottom: Spacing['4xl'],
  },
  brandingSection: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: Spacing.xl,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: FontSize['5xl'],
    fontWeight: FontWeight.heavy,
    color: Colors.textPrimary,
    letterSpacing: -1,
    marginBottom: Spacing.sm,
  },
  tagline: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  featuresSection: {
    gap: Spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  featureIconBg: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    flex: 1,
  },
  buttonsSection: {
    gap: Spacing.md,
    alignItems: 'center',
  },
  termsText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 16,
  },
  termsLink: {
    color: Colors.accentLight,
  },
});

export default WelcomeScreen;

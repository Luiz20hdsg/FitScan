import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Gradients, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../theme';
import { Card } from '../components/Card';

const FEATURES = [
  { icon: 'images-outline', title: 'Fotos de Evolução', desc: 'Compare antes e depois' },
  { icon: 'stats-chart-outline', title: 'Gráficos de Progresso', desc: 'Peso, gordura e macros' },
  { icon: 'trophy-outline', title: 'Conquistas', desc: 'Marcos da sua jornada' },
];

const JourneyScreen = () => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[...Gradients.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        <Icon name="trending-up-outline" size={40} color={Colors.textOnGradient} />
        <Text style={styles.headerTitle}>Jornada</Text>
        <Text style={styles.headerSubtitle}>
          Acompanhe seu progresso e evolução ao longo do tempo.
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <LinearGradient
          colors={[...Gradients.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.comingSoonBadge}>
          <Icon name="time-outline" size={14} color={Colors.textOnGradient} />
          <Text style={styles.comingSoonText}>Em breve</Text>
        </LinearGradient>

        <Text style={styles.description}>
          Estamos construindo ferramentas incríveis para você visualizar toda a sua evolução.
        </Text>

        {FEATURES.map((feature, index) => (
          <Card key={index} style={styles.featureCard}>
            <View style={styles.featureRow}>
              <LinearGradient
                colors={[...Gradients.accent]}
                style={styles.featureIconWrapper}>
                <Icon name={feature.icon} size={22} color={Colors.textOnGradient} />
              </LinearGradient>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDesc}>{feature.desc}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: Spacing['6xl'],
    paddingBottom: Spacing['3xl'],
    paddingHorizontal: Spacing['2xl'],
    borderBottomLeftRadius: BorderRadius['2xl'],
    borderBottomRightRadius: BorderRadius['2xl'],
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize['2xl'], fontWeight: FontWeight.bold,
    color: Colors.textOnGradient,
  },
  headerSubtitle: {
    fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)',
    textAlign: 'center', maxWidth: '85%',
  },
  content: {
    padding: Spacing.xl, alignItems: 'center', marginTop: -Spacing.md,
  },
  comingSoonBadge: {
    paddingHorizontal: Spacing['2xl'], paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, marginBottom: Spacing.xl,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    ...Shadow.lg,
  },
  comingSoonText: {
    color: Colors.textOnGradient, fontSize: FontSize.sm, fontWeight: FontWeight.bold,
  },
  description: {
    fontSize: FontSize.md, color: Colors.textSecondary,
    textAlign: 'center', maxWidth: '85%', lineHeight: 22, marginBottom: Spacing.xl,
  },
  featureCard: { width: '100%', marginBottom: Spacing.md },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  featureIconWrapper: {
    width: 48, height: 48, borderRadius: BorderRadius.md,
    justifyContent: 'center', alignItems: 'center',
  },
  featureText: { flex: 1 },
  featureTitle: {
    fontSize: FontSize.md, fontWeight: FontWeight.bold,
    color: Colors.textPrimary, marginBottom: 2,
  },
  featureDesc: { fontSize: FontSize.sm, color: Colors.textMuted },
});

export default JourneyScreen;

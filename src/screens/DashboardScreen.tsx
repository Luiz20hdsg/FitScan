import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Gradients, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../theme';
import { Card } from '../components/Card';
import { useUser } from '../context/UserContext';

const DashboardScreen = () => {
  const { analysisResult, userData } = useUser();

  if (!analysisResult) {
    return (
      <View style={styles.emptyContainer}>
        <LinearGradient
          colors={[Colors.surfaceLight, Colors.surface]}
          style={styles.emptyCard}>
          <Icon name="home-outline" size={56} color={Colors.accentLight} />
          <Text style={styles.emptyTitle}>Seu Dashboard</Text>
          <Text style={styles.emptyText}>
            Complete a análise corporal para ver seu diagnóstico personalizado aqui.
          </Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[...Gradients.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}>
        <View style={styles.greetingRow}>
          <Icon name="hand-right-outline" size={20} color="rgba(255,255,255,0.8)" />
          <Text style={styles.greeting}>Olá!</Text>
        </View>
        <Text style={styles.headerGoal}>{analysisResult.suggested_goal}</Text>
        <Text style={styles.headerSubtitle}>Sua meta personalizada</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Icon name="fitness-outline" size={28} color={Colors.accent} />
            <Text style={styles.statValue}>{analysisResult.estimated_biotype}</Text>
            <Text style={styles.statLabel}>Biotipo</Text>
          </Card>
          <Card style={styles.statCard}>
            <Icon name="analytics-outline" size={28} color={Colors.info} />
            <Text style={styles.statValue}>{analysisResult.estimated_fat_percentage}%</Text>
            <Text style={styles.statLabel}>Gordura</Text>
          </Card>
        </View>

        <Card style={styles.feedbackCard}>
          <View style={styles.cardHeader}>
            <Icon name="sparkles-outline" size={18} color={Colors.accentLight} />
            <Text style={styles.cardHeaderTitle}>Análise da IA</Text>
          </View>
          <Text style={styles.feedbackText}>{analysisResult.feedback}</Text>
        </Card>

        {userData.weight ? (
          <Card style={styles.dataCard}>
            <View style={styles.cardHeader}>
              <Icon name="document-text-outline" size={18} color={Colors.accentLight} />
              <Text style={styles.cardHeaderTitle}>Seus Dados</Text>
            </View>
            <View style={styles.dataGrid}>
              <DataItem label="Idade" value={`${userData.age} anos`} icon="calendar-outline" />
              <DataItem label="Altura" value={`${userData.height} cm`} icon="resize-outline" />
              <DataItem label="Peso" value={`${userData.weight} kg`} icon="scale-outline" />
            </View>
          </Card>
        ) : null}

        <View style={styles.actionsRow}>
          <TouchableOpacity activeOpacity={0.8} style={styles.actionWrapper}>
            <LinearGradient
              colors={[...Gradients.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionCard}>
              <Icon name="nutrition-outline" size={28} color={Colors.textOnGradient} />
              <Text style={styles.actionText}>{'Escanear\nRefeição'}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} style={styles.actionWrapper}>
            <LinearGradient
              colors={[...Gradients.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionCard}>
              <Icon name="barbell-outline" size={28} color={Colors.textOnGradient} />
              <Text style={styles.actionText}>{'Gerar\nTreino'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const DataItem = ({ label, value, icon }: { label: string; value: string; icon: string }) => (
  <View style={styles.dataItem}>
    <Icon name={icon} size={16} color={Colors.textMuted} style={styles.dataIcon} />
    <Text style={styles.dataValue}>{value}</Text>
    <Text style={styles.dataLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  emptyContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.background, padding: Spacing['2xl'],
  },
  emptyCard: {
    padding: Spacing['4xl'], borderRadius: BorderRadius.xl,
    alignItems: 'center', width: '100%', gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize['2xl'], fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  emptyText: {
    fontSize: FontSize.md, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 22,
  },
  headerGradient: {
    paddingTop: Spacing['6xl'], paddingBottom: Spacing['3xl'],
    paddingHorizontal: Spacing['2xl'],
    borderBottomLeftRadius: BorderRadius['2xl'],
    borderBottomRightRadius: BorderRadius['2xl'],
  },
  greetingRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs,
  },
  greeting: { fontSize: FontSize.lg, color: 'rgba(255,255,255,0.8)' },
  headerGoal: {
    fontSize: FontSize['2xl'], fontWeight: FontWeight.bold,
    color: Colors.textOnGradient, marginBottom: Spacing.xs,
  },
  headerSubtitle: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.6)' },
  content: { padding: Spacing.xl, marginTop: -Spacing.md },
  statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  statValue: {
    fontSize: FontSize.xl, fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSize.xs, color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  feedbackCard: { marginBottom: Spacing.md },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: Spacing.md, gap: Spacing.sm,
  },
  cardHeaderTitle: {
    fontSize: FontSize.sm, fontWeight: FontWeight.semibold,
    color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  feedbackText: { fontSize: FontSize.md, color: Colors.textPrimary, lineHeight: 24 },
  dataCard: { marginBottom: Spacing.xl },
  dataGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  dataItem: { alignItems: 'center', gap: Spacing.xs },
  dataIcon: { marginBottom: 2 },
  dataValue: {
    fontSize: FontSize.lg, fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  dataLabel: { fontSize: FontSize.xs, color: Colors.textMuted, textTransform: 'uppercase' },
  actionsRow: { flexDirection: 'row', gap: Spacing.md },
  actionWrapper: { flex: 1, ...Shadow.lg },
  actionCard: {
    padding: Spacing.xl, borderRadius: BorderRadius.lg,
    alignItems: 'center', minHeight: 110, justifyContent: 'center', gap: Spacing.sm,
  },
  actionText: {
    fontSize: FontSize.sm, fontWeight: FontWeight.bold,
    color: Colors.textOnGradient, textAlign: 'center', lineHeight: 18,
  },
  bottomSpacer: { height: Spacing['3xl'] },
});

export default DashboardScreen;

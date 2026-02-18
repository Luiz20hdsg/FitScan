import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Gradients, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../theme';
import { Card } from '../components/Card';
import { useUser } from '../context/UserContext';

const JourneyScreen = () => {
  const { mealHistory, workoutHistory, analysisResult, userData } = useUser();

  // Calcular estatísticas
  const today = new Date().toDateString();
  const todayMeals = mealHistory.filter(m => new Date(m.date).toDateString() === today);
  const todayCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0);
  const totalMeals = mealHistory.length;
  const totalWorkouts = workoutHistory.length;

  // Dias ativos (dias únicos com atividade)
  const activeDays = new Set([
    ...mealHistory.map(m => new Date(m.date).toDateString()),
    ...workoutHistory.map(w => new Date(w.date).toDateString()),
  ]).size;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Icon name="flame-outline" size={24} color={Colors.warning} />
            <Text style={styles.statValue}>{todayCalories}</Text>
            <Text style={styles.statLabel}>kcal hoje</Text>
          </Card>
          <Card style={styles.statCard}>
            <Icon name="restaurant-outline" size={24} color={Colors.protein} />
            <Text style={styles.statValue}>{totalMeals}</Text>
            <Text style={styles.statLabel}>refeições</Text>
          </Card>
          <Card style={styles.statCard}>
            <Icon name="barbell-outline" size={24} color={Colors.accent} />
            <Text style={styles.statValue}>{totalWorkouts}</Text>
            <Text style={styles.statLabel}>treinos</Text>
          </Card>
          <Card style={styles.statCard}>
            <Icon name="calendar-outline" size={24} color={Colors.success} />
            <Text style={styles.statValue}>{activeDays}</Text>
            <Text style={styles.statLabel}>dias ativos</Text>
          </Card>
        </View>

        {/* Body analysis summary */}
        {analysisResult && (
          <Card style={styles.bodyCard}>
            <View style={styles.cardHeader}>
              <Icon name="body-outline" size={18} color={Colors.accentLight} />
              <Text style={styles.cardHeaderTitle}>Análise Corporal</Text>
            </View>
            <View style={styles.bodyStats}>
              <View style={styles.bodyStat}>
                <Text style={styles.bodyStatValue}>{userData.weight} kg</Text>
                <Text style={styles.bodyStatLabel}>Peso</Text>
              </View>
              <View style={styles.bodyDivider} />
              <View style={styles.bodyStat}>
                <Text style={styles.bodyStatValue}>{analysisResult.estimated_fat_percentage}%</Text>
                <Text style={styles.bodyStatLabel}>Gordura</Text>
              </View>
              <View style={styles.bodyDivider} />
              <View style={styles.bodyStat}>
                <Text style={styles.bodyStatValue}>{analysisResult.estimated_biotype}</Text>
                <Text style={styles.bodyStatLabel}>Biotipo</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Recent Workouts */}
        {workoutHistory.length > 0 && (
          <View style={styles.section}>
            <View style={styles.cardHeader}>
              <Icon name="time-outline" size={18} color={Colors.accentLight} />
              <Text style={styles.cardHeaderTitle}>Últimos Treinos</Text>
            </View>
            {workoutHistory.slice(0, 5).map((workout, index) => (
              <Card key={workout.id} style={styles.historyCard}>
                <View style={styles.historyRow}>
                  <LinearGradient
                    colors={[...Gradients.primary]}
                    style={styles.historyIcon}>
                    <Icon name="barbell" size={16} color={Colors.textOnGradient} />
                  </LinearGradient>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyTitle}>{workout.title}</Text>
                    <Text style={styles.historyDate}>
                      {new Date(workout.date).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Empty state */}
        {totalMeals === 0 && totalWorkouts === 0 && (
          <Card gradient style={styles.emptyCard}>
            <Icon name="sparkles-outline" size={40} color={Colors.accentLight} />
            <Text style={styles.emptyTitle}>Comece sua jornada!</Text>
            <Text style={styles.emptyText}>
              Escaneie refeições e gere treinos para acompanhar seu progresso aqui.
            </Text>
          </Card>
        )}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
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
    padding: Spacing.xl, marginTop: -Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1, minWidth: '45%', alignItems: 'center',
    paddingVertical: Spacing.xl, gap: Spacing.xs,
  },
  statValue: {
    fontSize: FontSize.xl, fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSize.xs, color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  bodyCard: { marginBottom: Spacing.lg },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: Spacing.md, gap: Spacing.sm,
  },
  cardHeaderTitle: {
    fontSize: FontSize.sm, fontWeight: FontWeight.semibold,
    color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  bodyStats: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
  },
  bodyStat: { alignItems: 'center', gap: Spacing.xs },
  bodyStatValue: {
    fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary,
  },
  bodyStatLabel: {
    fontSize: FontSize.xs, color: Colors.textMuted, textTransform: 'uppercase',
  },
  bodyDivider: {
    width: 1, height: 40, backgroundColor: Colors.border,
  },
  section: { marginBottom: Spacing.lg },
  historyCard: { marginBottom: Spacing.sm },
  historyRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
  },
  historyIcon: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  historyInfo: { flex: 1 },
  historyTitle: {
    fontSize: FontSize.md, fontWeight: FontWeight.semibold,
    color: Colors.textPrimary, marginBottom: 2,
  },
  historyDate: { fontSize: FontSize.sm, color: Colors.textMuted },
  emptyCard: {
    alignItems: 'center', paddingVertical: Spacing['4xl'], gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary,
  },
  emptyText: {
    fontSize: FontSize.md, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 22,
  },
  bottomSpacer: { height: Spacing['3xl'] },
});

export default JourneyScreen;

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Gradients, FontSize, FontWeight, Spacing, BorderRadius } from '../theme';
import { Card } from '../components/Card';
import { GradientButton, OutlineButton } from '../components/Buttons';
import { WorkoutPlanResult } from '../types';
import { API_URL } from '../config';
import { useUser } from '../context/UserContext';

const CoachScreen = () => {
  const { addWorkoutToHistory } = useUser();
  const [trainingLocation, setTrainingLocation] = useState('');
  const [limitations, setLimitations] = useState('');
  const [loading, setLoading] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlanResult | null>(null);

  const handleGenerateWorkout = async () => {
    if (!trainingLocation.trim()) {
      Alert.alert('Local de Treino', 'Por favor, informe onde você treina.');
      return;
    }
    setLoading(true);
    setWorkoutPlan(null);

    const formData = new FormData();
    formData.append('training_location', trainingLocation.trim());
    formData.append('limitations', limitations.trim());

    try {
      const response = await fetch(`${API_URL}/generate-workout/`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => null);
        throw new Error(errorJson?.detail || `Erro do servidor: ${response.status}`);
      }

      const json: WorkoutPlanResult = await response.json();
      setWorkoutPlan(json);

      // Salvar no histórico
      addWorkoutToHistory({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        title: json.title,
      });
    } catch (error: any) {
      console.error('Erro ao gerar treino:', error);
      Alert.alert('Erro na Conexão', error.message || 'Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewWorkout = () => {
    setWorkoutPlan(null);
    setTrainingLocation('');
    setLimitations('');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      {/* Header */}
      <LinearGradient
        colors={[...Gradients.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        <Icon name="barbell-outline" size={40} color={Colors.textOnGradient} />
        <Text style={styles.headerTitle}>Coach IA</Text>
        <Text style={styles.headerSubtitle}>
          Treino personalizado adaptado ao seu corpo e objetivos.
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {!workoutPlan ? (
          <View style={styles.formContainer}>
            <Card style={styles.inputCard}>
              <View style={styles.labelRow}>
                <Icon name="location-outline" size={16} color={Colors.accentLight} />
                <Text style={styles.inputLabel}>Onde você treina?</Text>
              </View>
              <TextInput
                style={styles.input}
                value={trainingLocation}
                onChangeText={setTrainingLocation}
                placeholder="Ex: Academia, Casa, Ao ar livre"
                placeholderTextColor={Colors.textMuted}
              />
            </Card>

            <Card style={styles.inputCard}>
              <View style={styles.labelRow}>
                <Icon name="medkit-outline" size={16} color={Colors.accentLight} />
                <Text style={styles.inputLabel}>Alguma limitação ou dor?</Text>
              </View>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                multiline
                value={limitations}
                onChangeText={setLimitations}
                placeholder="Ex: Dor no joelho, problema na lombar..."
                placeholderTextColor={Colors.textMuted}
                textAlignVertical="top"
              />
            </Card>

            <GradientButton
              title="Gerar Meu Treino"
              onPress={handleGenerateWorkout}
              loading={loading}
              loadingText="Gerando treino..."
            />
          </View>
        ) : (
          <View style={styles.resultContainer}>
            {/* Plan header */}
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>{workoutPlan.title}</Text>
              <LinearGradient
                colors={[...Gradients.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.focusBadge}>
                <Icon name="flash-outline" size={14} color={Colors.textOnGradient} />
                <Text style={styles.focusText}>{workoutPlan.focus}</Text>
              </LinearGradient>
            </View>

            {/* Exercises */}
            {workoutPlan.exercises.map((exercise, index) => (
              <Card key={index} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <LinearGradient
                    colors={[...Gradients.primary]}
                    style={styles.exerciseNumber}>
                    <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                  </LinearGradient>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                </View>
                <View style={styles.exerciseDetails}>
                  <View style={styles.detailChip}>
                    <Icon name="repeat-outline" size={12} color={Colors.textSecondary} />
                    <Text style={styles.detailText}>
                      {exercise.sets} séries
                    </Text>
                  </View>
                  <View style={styles.detailChip}>
                    <Icon name="timer-outline" size={12} color={Colors.textSecondary} />
                    <Text style={styles.detailText}>
                      {exercise.reps || exercise.duration}
                    </Text>
                  </View>
                </View>
                <View style={styles.tipsRow}>
                  <Icon name="bulb-outline" size={14} color={Colors.warning} />
                  <Text style={styles.exerciseTips}>{exercise.tips}</Text>
                </View>
              </Card>
            ))}

            {/* Feedback */}
            <Card style={styles.feedbackCard}>
              <View style={styles.feedbackHeader}>
                <Icon name="clipboard-outline" size={18} color={Colors.accentLight} />
                <Text style={styles.feedbackTitle}>Observações</Text>
              </View>
              <Text style={styles.feedbackText}>{workoutPlan.feedback}</Text>
            </Card>

            <OutlineButton
              title="Gerar Novo Treino"
              onPress={handleNewWorkout}
            />
          </View>
        )}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1 },
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
  content: { padding: Spacing.xl, marginTop: -Spacing.md },
  formContainer: { gap: Spacing.md },
  inputCard: { marginBottom: 0 },
  labelRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm,
  },
  inputLabel: {
    fontSize: FontSize.sm, fontWeight: FontWeight.semibold,
    color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  input: {
    height: 50, borderColor: Colors.border, borderWidth: 1,
    borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surfaceHighlight, color: Colors.textPrimary,
    fontSize: FontSize.md,
  },
  multilineInput: { height: 100, paddingTop: Spacing.md },
  resultContainer: { gap: Spacing.md },
  planHeader: { alignItems: 'center', marginBottom: Spacing.sm },
  planTitle: {
    fontSize: FontSize.xl, fontWeight: FontWeight.bold,
    color: Colors.textPrimary, marginBottom: Spacing.sm, textAlign: 'center',
  },
  focusBadge: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
  },
  focusText: {
    fontSize: FontSize.sm, color: Colors.textOnGradient, fontWeight: FontWeight.semibold,
  },
  exerciseCard: { marginBottom: 0 },
  exerciseHeader: {
    flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md,
  },
  exerciseNumber: {
    width: 30, height: 30, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md,
  },
  exerciseNumberText: {
    color: Colors.textOnGradient, fontSize: FontSize.sm, fontWeight: FontWeight.bold,
  },
  exerciseName: {
    fontSize: FontSize.md, fontWeight: FontWeight.bold,
    color: Colors.textPrimary, flex: 1,
  },
  exerciseDetails: {
    flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm, marginLeft: 46,
  },
  detailChip: {
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm, flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
  },
  detailText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  tipsRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginLeft: 46,
  },
  exerciseTips: {
    fontSize: FontSize.sm, color: Colors.textMuted, flex: 1, lineHeight: 20,
  },
  feedbackCard: {},
  feedbackHeader: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: Spacing.md, gap: Spacing.sm,
  },
  feedbackTitle: {
    fontSize: FontSize.sm, fontWeight: FontWeight.semibold,
    color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  feedbackText: { fontSize: FontSize.md, color: Colors.textPrimary, lineHeight: 24 },
  bottomSpacer: { height: Spacing['3xl'] },
});

export default CoachScreen;

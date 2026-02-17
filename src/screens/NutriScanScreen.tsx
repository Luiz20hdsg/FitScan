import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';
import { Colors, Gradients, FontSize, FontWeight, Spacing, BorderRadius } from '../theme';
import { Card } from '../components/Card';
import { GradientButton, OutlineButton } from '../components/Buttons';
import { MealAnalysisResult } from '../types';
import { API_URL } from '../config';

const NutriScanScreen = () => {
  const [mealImage, setMealImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MealAnalysisResult | null>(null);

  const handleMealScan = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 0.8,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Erro', 'Não foi possível selecionar a imagem. Tente novamente.');
        return;
      }
      if (response.assets && response.assets[0]?.uri) {
        setMealImage(response.assets[0].uri);
        setResult(null);
      }
    });
  };

  const handleAnalyzeMeal = async () => {
    if (!mealImage) {
      Alert.alert('Nenhuma Imagem', 'Selecione uma imagem da sua refeição para analisar.');
      return;
    }
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    const filename = mealImage.split('/').pop() || 'meal.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    formData.append('image', { uri: mealImage, name: filename, type } as any);

    try {
      const response = await fetch(`${API_URL}/analyze-meal/`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => null);
        throw new Error(errorJson?.detail || `Erro do servidor: ${response.status}`);
      }

      const json: MealAnalysisResult = await response.json();
      setResult(json);
    } catch (error: any) {
      console.error('Erro na análise de refeição:', error);
      Alert.alert('Erro na Conexão', error.message || 'Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewScan = () => {
    setMealImage(null);
    setResult(null);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={[...Gradients.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        <Icon name="nutrition-outline" size={40} color={Colors.textOnGradient} />
        <Text style={styles.headerTitle}>NutriScan</Text>
        <Text style={styles.headerSubtitle}>
          Fotografe sua refeição e descubra calorias e macros com IA.
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Image picker area */}
        <Card style={styles.scanCard}>
          {mealImage ? (
            <Image source={{ uri: mealImage }} style={styles.previewImage} />
          ) : (
            <LinearGradient
              colors={[Colors.surfaceLight, Colors.surface]}
              style={styles.scanPlaceholder}>
              <Icon name="camera-outline" size={40} color={Colors.accentLight} />
              <Text style={styles.scanText}>Toque para fotografar</Text>
              <Text style={styles.scanHint}>ou selecionar da galeria</Text>
            </LinearGradient>
          )}
        </Card>

        {!result ? (
          <View style={styles.actions}>
            <OutlineButton
              title="Selecionar Foto"
              onPress={handleMealScan}
              style={styles.selectBtn}
            />
            <GradientButton
              title="Analisar Refeição"
              onPress={handleAnalyzeMeal}
              loading={loading}
              loadingText="Analisando..."
              disabled={!mealImage}
            />
          </View>
        ) : (
          <View style={styles.resultContainer}>
            {/* Meal type */}
            <Text style={styles.mealType}>{result.meal_type}</Text>

            {/* Calories card */}
            <Card gradient style={styles.caloriesCard}>
              <Icon name="flame-outline" size={24} color={Colors.warning} />
              <Text style={styles.caloriesValue}>{result.total_calories}</Text>
              <Text style={styles.caloriesLabel}>kcal estimadas</Text>
            </Card>

            {/* Macros */}
            <View style={styles.macrosRow}>
              <MacroCard
                label="Proteína"
                value={`${result.macros.protein}g`}
                color={Colors.protein}
                icon="egg-outline"
              />
              <MacroCard
                label="Carbos"
                value={`${result.macros.carbs}g`}
                color={Colors.carbs}
                icon="leaf-outline"
              />
              <MacroCard
                label="Gordura"
                value={`${result.macros.fat}g`}
                color={Colors.fat}
                icon="water-outline"
              />
            </View>

            {/* Feedback */}
            <Card style={styles.feedbackCard}>
              <View style={styles.feedbackHeader}>
                <Icon name="bulb-outline" size={18} color={Colors.warning} />
                <Text style={styles.feedbackTitle}>Feedback da IA</Text>
              </View>
              <Text style={styles.feedbackText}>{result.feedback}</Text>
            </Card>

            <OutlineButton
              title="Nova Análise"
              onPress={handleNewScan}
            />
          </View>
        )}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const MacroCard = ({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) => (
  <View style={[styles.macroCard, { borderLeftColor: color }]}>
    <Icon name={icon} size={18} color={color} />
    <Text style={[styles.macroValue, { color }]}>{value}</Text>
    <Text style={styles.macroLabel}>{label}</Text>
  </View>
);

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
  scanCard: { padding: 0, overflow: 'hidden', marginBottom: Spacing.xl },
  previewImage: { width: '100%', height: 220, borderRadius: BorderRadius.lg },
  scanPlaceholder: {
    height: 200, borderRadius: BorderRadius.md,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: Colors.accent, borderStyle: 'dashed',
    gap: Spacing.sm,
  },
  scanText: {
    fontSize: FontSize.md, fontWeight: FontWeight.semibold,
    color: Colors.accentLight,
  },
  scanHint: { fontSize: FontSize.xs, color: Colors.textMuted },
  actions: { gap: Spacing.md },
  selectBtn: { marginBottom: 0 },
  resultContainer: { gap: Spacing.md },
  mealType: {
    fontSize: FontSize.lg, fontWeight: FontWeight.bold,
    color: Colors.accentLight, textAlign: 'center', marginBottom: Spacing.xs,
  },
  caloriesCard: { alignItems: 'center', paddingVertical: Spacing['2xl'], gap: Spacing.xs },
  caloriesValue: {
    fontSize: FontSize['5xl'], fontWeight: FontWeight.heavy,
    color: Colors.textPrimary,
  },
  caloriesLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  macrosRow: { flexDirection: 'row', gap: Spacing.sm },
  macroCard: {
    flex: 1, backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md, padding: Spacing.lg,
    alignItems: 'center', borderLeftWidth: 3,
    borderWidth: 1, borderColor: Colors.border, gap: Spacing.xs,
  },
  macroValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  macroLabel: {
    fontSize: FontSize.xs, color: Colors.textMuted,
    textTransform: 'uppercase',
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

export default NutriScanScreen;

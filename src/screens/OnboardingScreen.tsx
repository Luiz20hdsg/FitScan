import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, AnalysisResult } from '../types';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../theme';
import { GradientButton } from '../components/Buttons';
import { useUser } from '../context/UserContext';
import { API_URL } from '../config';

type OnboardingScreenProps = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const OnboardingScreen = ({ navigation }: OnboardingScreenProps) => {
  const { setUserData, setAnalysisResult, setHasCompletedOnboarding } = useUser();

  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bodyImage, setBodyImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateInputs = (): boolean => {
    const ageNum = parseInt(age, 10);
    const heightNum = parseInt(height, 10);
    const weightNum = parseInt(weight, 10);

    if (!age || !height || !weight) {
      Alert.alert('Dados Incompletos', 'Preencha todos os campos.');
      return false;
    }
    if (isNaN(ageNum) || ageNum < 10 || ageNum > 120) {
      Alert.alert('Idade Inválida', 'Informe uma idade entre 10 e 120 anos.');
      return false;
    }
    if (isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
      Alert.alert('Altura Inválida', 'Informe uma altura entre 100 e 250 cm.');
      return false;
    }
    if (isNaN(weightNum) || weightNum < 30 || weightNum > 300) {
      Alert.alert('Peso Inválido', 'Informe um peso entre 30 e 300 kg.');
      return false;
    }
    if (!bodyImage) {
      Alert.alert('Foto Necessária', 'Selecione uma foto para a análise corporal.');
      return false;
    }
    return true;
  };

  const handleCreatePlan = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('age', age);
    formData.append('height', height);
    formData.append('weight', weight);

    const imageUri = bodyImage!;
    const filename = imageUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    formData.append('image', { uri: imageUri, name: filename, type } as any);

    try {
      const response = await fetch(`${API_URL}/analyze-body/`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => null);
        throw new Error(errorJson?.detail || `Erro do servidor: ${response.status}`);
      }

      const json: AnalysisResult = await response.json();
      setUserData({ age, height, weight, bodyImageUri: bodyImage });
      setAnalysisResult(json);
      setHasCompletedOnboarding(true);
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (error: any) {
      console.error('Erro na análise:', error);
      Alert.alert('Erro', error.message || 'Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleBodyScan = () => {
    const options: ImageLibraryOptions = { mediaType: 'photo', quality: 0.8 };
    launchImageLibrary(options, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
        return;
      }
      if (response.assets && response.assets[0]?.uri) {
        setBodyImage(response.assets[0].uri);
      }
    });
  };

  return (
    <LinearGradient
      colors={[Colors.background, '#0F0F1A', Colors.background]}
      style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.step}>PASSO 1 DE 1</Text>
            <Text style={styles.title}>Sobre Você</Text>
            <Text style={styles.subtitle}>
              Precisamos de algumas informações para personalizar sua experiência.
            </Text>
          </View>

          {/* Inputs */}
          <View style={styles.form}>
            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.label}>Idade</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={age}
                  onChangeText={setAge}
                  placeholder="28"
                  placeholderTextColor={Colors.textMuted}
                  maxLength={3}
                />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.label}>Peso (kg)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="75"
                  placeholderTextColor={Colors.textMuted}
                  maxLength={3}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Altura (cm)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
                placeholder="175"
                placeholderTextColor={Colors.textMuted}
                maxLength={3}
              />
            </View>
          </View>

          {/* Body Scan */}
          <View style={styles.scanSection}>
            <Text style={styles.scanTitle}>Análise Corporal</Text>
            <Text style={styles.scanSubtitle}>
              Envie uma foto com roupas de ginástica para nossa IA analisar.
            </Text>

            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleBodyScan}
              disabled={loading}
              activeOpacity={0.7}>
              {bodyImage ? (
                <Image source={{ uri: bodyImage }} style={styles.previewImage} />
              ) : (
                <LinearGradient
                  colors={[Colors.surfaceLight, Colors.surface]}
                  style={styles.scanPlaceholder}>
                  <Icon name="body-outline" size={40} color={Colors.accentLight} />
                  <Text style={styles.scanButtonText}>Selecionar Foto</Text>
                  <Text style={styles.scanHint}>Toque para abrir a galeria</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>

          {/* Submit */}
          <GradientButton
            title="Analisar e Criar Plano"
            onPress={handleCreatePlan}
            loading={loading}
            loadingText="Analisando com IA..."
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing['2xl'],
    paddingTop: Spacing['6xl'],
    paddingBottom: Spacing['4xl'],
  },
  header: {
    marginBottom: Spacing['3xl'],
  },
  step: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.accentLight,
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  form: {
    gap: Spacing.lg,
    marginBottom: Spacing['3xl'],
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  inputHalf: {
    flex: 1,
    gap: Spacing.sm,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: 52,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    fontWeight: FontWeight.medium,
  },
  scanSection: {
    marginBottom: Spacing['2xl'],
  },
  scanTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  scanSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  scanButton: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  scanPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.accent,
    borderStyle: 'dashed',
    gap: Spacing.sm,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: BorderRadius.lg,
  },
  scanButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.accentLight,
  },
  scanHint: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
});

export default OnboardingScreen;

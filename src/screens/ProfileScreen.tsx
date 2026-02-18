import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Linking, Share, Platform, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Colors, Gradients, FontSize, FontWeight, Spacing, BorderRadius } from '../theme';
import { Card } from '../components/Card';
import { GradientButton, OutlineButton } from '../components/Buttons';
import { useUser } from '../context/UserContext';
import { APP_VERSION } from '../config';

const STORE_URL = Platform.select({
  ios: 'https://apps.apple.com/app/fitscan/id000000000', // Substituir pelo ID real
  android: 'https://play.google.com/store/apps/details?id=com.fitscan',
}) || '';

const ProfileScreen = () => {
  const { userData, analysisResult, auth, logout, mealHistory, workoutHistory } = useUser();
  const navigation = useNavigation();

  const handleResetOnboarding = () => {
    Alert.alert(
      'Refazer Onboarding',
      'Deseja refazer a análise corporal inicial? Seus dados atuais serão substituídos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Refazer',
          style: 'destructive',
          onPress: () => {
            navigation.dispatch(
              CommonActions.reset({ index: 0, routes: [{ name: 'Onboarding' }] }),
            );
          },
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Deseja realmente sair? Seus dados locais serão apagados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.dispatch(
              CommonActions.reset({ index: 0, routes: [{ name: 'Welcome' }] }),
            );
          },
        },
      ],
    );
  };

  const handleRateApp = () => {
    Linking.openURL(STORE_URL).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir a loja de apps.');
    });
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        title: 'FitScan — Seu Personal Trainer com IA',
        message: `Conheça o FitScan! Análise corporal, nutrição e treinos personalizados com inteligência artificial. Baixe agora: ${STORE_URL}`,
      });
    } catch (_) {
      // User cancelled
    }
  };

  const totalMeals = mealHistory.length;
  const totalWorkouts = workoutHistory.length;
  const totalCalories = mealHistory.reduce((sum, m) => sum + (m.calories || 0), 0);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={[...Gradients.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        <View style={styles.avatarContainer}>
          {auth.email ? (
            <Text style={styles.avatarText}>{auth.email[0].toUpperCase()}</Text>
          ) : (
            <Icon name="person-outline" size={28} color={Colors.textOnGradient} />
          )}
        </View>
        <Text style={styles.headerName}>
          {auth.email ? auth.email.split('@')[0] : 'Convidado'}
        </Text>
        <Text style={styles.headerEmail}>
          {auth.isGuest ? 'Modo convidado' : auth.email || ''}
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* User data card */}
        {userData.age ? (
          <Card style={styles.dataCard}>
            <View style={styles.cardHeader}>
              <Icon name="document-text-outline" size={18} color={Colors.accentLight} />
              <Text style={styles.cardHeaderTitle}>Seus Dados</Text>
            </View>
            <InfoRow label="Idade" value={`${userData.age} anos`} icon="calendar-outline" />
            <View style={styles.divider} />
            <InfoRow label="Altura" value={`${userData.height} cm`} icon="resize-outline" />
            <View style={styles.divider} />
            <InfoRow label="Peso" value={`${userData.weight} kg`} icon="scale-outline" />
            {analysisResult && (
              <>
                <View style={styles.divider} />
                <InfoRow label="Biotipo" value={analysisResult.estimated_biotype} icon="fitness-outline" />
                <View style={styles.divider} />
                <InfoRow label="Gordura" value={`${analysisResult.estimated_fat_percentage}%`} icon="analytics-outline" />
                <View style={styles.divider} />
                <InfoRow label="Meta" value={analysisResult.suggested_goal} icon="flag-outline" highlight />
              </>
            )}
          </Card>
        ) : (
          <Card gradient style={styles.emptyCard}>
            <Icon name="information-circle-outline" size={24} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>
              Complete o onboarding para ver seus dados aqui.
            </Text>
          </Card>
        )}

        {/* Actions */}
        <OutlineButton
          title="Refazer Análise Corporal"
          onPress={handleResetOnboarding}
        />

        {/* Activity summary */}
        <Card style={styles.activityCard}>
          <View style={styles.cardHeader}>
            <Icon name="stats-chart-outline" size={18} color={Colors.accentLight} />
            <Text style={styles.cardHeaderTitle}>Sua Atividade</Text>
          </View>
          <View style={styles.activityStats}>
            <View style={styles.activityStat}>
              <Text style={styles.activityValue}>{totalMeals}</Text>
              <Text style={styles.activityLabel}>Refeições</Text>
            </View>
            <View style={styles.activityDivider} />
            <View style={styles.activityStat}>
              <Text style={styles.activityValue}>{totalCalories.toLocaleString('pt-BR')}</Text>
              <Text style={styles.activityLabel}>Calorias</Text>
            </View>
            <View style={styles.activityDivider} />
            <View style={styles.activityStat}>
              <Text style={styles.activityValue}>{totalWorkouts}</Text>
              <Text style={styles.activityLabel}>Treinos</Text>
            </View>
          </View>
        </Card>

        {/* Quick actions */}
        <Card style={styles.quickActionsCard}>
          <View style={styles.cardHeader}>
            <Icon name="apps-outline" size={18} color={Colors.accentLight} />
            <Text style={styles.cardHeaderTitle}>Ações Rápidas</Text>
          </View>
          <TouchableOpacity style={styles.actionRow} onPress={handleRateApp}>
            <View style={styles.actionLeft}>
              <Icon name="star-outline" size={20} color={Colors.warning} />
              <Text style={styles.actionText}>Avaliar na loja</Text>
            </View>
            <Icon name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.actionRow} onPress={handleShareApp}>
            <View style={styles.actionLeft}>
              <Icon name="share-social-outline" size={20} color={Colors.accentLight} />
              <Text style={styles.actionText}>Compartilhar com amigos</Text>
            </View>
            <Icon name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() =>
              Alert.alert(
                'Suporte',
                'Envie um email para suporte@fitscan.app com sua dúvida ou sugestão.',
              )
            }>
            <View style={styles.actionLeft}>
              <Icon name="help-circle-outline" size={20} color={Colors.info} />
              <Text style={styles.actionText}>Suporte & Feedback</Text>
            </View>
            <Icon name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* Logout */}
        <GradientButton
          title={auth.isGuest ? 'Criar uma conta' : 'Sair da conta'}
          onPress={auth.isGuest ? () => {
            navigation.dispatch(
              CommonActions.reset({ index: 0, routes: [{ name: 'Auth' }] }),
            );
          } : handleLogout}
          variant="accent"
        />

        {/* App info */}
        <View style={styles.appInfo}>
          <Icon name="flash" size={16} color={Colors.textMuted} />
          <Text style={styles.appInfoText}>FitScan v{APP_VERSION}</Text>
          <Text style={styles.appInfoSub}>Feito com IA para sua saúde</Text>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const InfoRow = ({ label, value, icon, highlight }: { label: string; value: string; icon: string; highlight?: boolean }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLeft}>
      <Icon name={icon} size={16} color={Colors.textMuted} />
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={[styles.infoValue, highlight && styles.infoHighlight]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: Spacing['6xl'],
    paddingBottom: Spacing['3xl'],
    paddingHorizontal: Spacing['2xl'],
    borderBottomLeftRadius: BorderRadius['2xl'],
    borderBottomRightRadius: BorderRadius['2xl'],
    alignItems: 'center',
  },
  avatarContainer: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: { fontSize: 28, color: Colors.textOnGradient, fontWeight: FontWeight.bold },
  headerName: {
    fontSize: FontSize.xl, fontWeight: FontWeight.bold,
    color: Colors.textOnGradient, marginBottom: Spacing.xs,
  },
  headerEmail: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)' },
  content: { padding: Spacing.xl, marginTop: -Spacing.md, gap: Spacing.lg },
  dataCard: {},
  cardHeader: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: Spacing.md, gap: Spacing.sm,
  },
  cardHeaderTitle: {
    fontSize: FontSize.sm, fontWeight: FontWeight.semibold,
    color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: Spacing.md,
  },
  infoLeft: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
  },
  infoLabel: { fontSize: FontSize.md, color: Colors.textMuted },
  infoValue: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  infoHighlight: { color: Colors.accentLight, maxWidth: '60%', textAlign: 'right' },
  divider: { height: 1, backgroundColor: Colors.border },
  emptyCard: { alignItems: 'center', paddingVertical: Spacing['2xl'], gap: Spacing.md },
  emptyText: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center' },
  activityCard: {},
  activityStats: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
  },
  activityStat: { alignItems: 'center', flex: 1 },
  activityValue: {
    fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.textPrimary,
  },
  activityLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  activityDivider: { width: 1, height: 32, backgroundColor: Colors.border },
  quickActionsCard: {},
  actionRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: Spacing.md,
  },
  actionLeft: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
  },
  actionText: { fontSize: FontSize.md, color: Colors.textPrimary },
  appInfo: {
    alignItems: 'center', gap: Spacing.xs, paddingTop: Spacing.md,
  },
  appInfoText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: FontWeight.medium },
  appInfoSub: { fontSize: FontSize.xs, color: Colors.textMuted },
  bottomSpacer: { height: Spacing['3xl'] },
});

export default ProfileScreen;

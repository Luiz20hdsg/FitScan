import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Colors, Gradients, FontSize, FontWeight, Spacing, BorderRadius } from '../theme';
import { Card } from '../components/Card';
import { GradientButton, OutlineButton } from '../components/Buttons';
import { useUser } from '../context/UserContext';

const ProfileScreen = () => {
  const { userData, analysisResult, auth, logout } = useUser();
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

        {/* Coming soon */}
        <Card style={styles.comingSoonCard}>
          <LinearGradient
            colors={[...Gradients.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.comingSoonBadge}>
            <Icon name="time-outline" size={12} color={Colors.textOnGradient} />
            <Text style={styles.comingSoonText}>Em breve</Text>
          </LinearGradient>
          <Text style={styles.comingSoonDesc}>
            Configurações de conta, preferências alimentares, metas personalizadas e mais.
          </Text>
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
  comingSoonCard: { alignItems: 'center', paddingVertical: Spacing['2xl'] },
  comingSoonBadge: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full, marginBottom: Spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
  },
  comingSoonText: {
    color: Colors.textOnGradient, fontSize: FontSize.xs, fontWeight: FontWeight.bold,
  },
  comingSoonDesc: {
    fontSize: FontSize.sm, color: Colors.textMuted,
    textAlign: 'center', lineHeight: 20, maxWidth: '85%',
  },
  bottomSpacer: { height: Spacing['3xl'] },
});

export default ProfileScreen;

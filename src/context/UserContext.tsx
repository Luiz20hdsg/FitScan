import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalysisResult } from '../types';
import { setUserTags, setExternalUserId, removeExternalUserId, trackEngagement, EngagementEvents } from '../services/NotificationService';

// ── Storage Keys ─────────────────────────────
const STORAGE_KEYS = {
  USER_DATA: '@fitscan_user_data',
  AUTH_STATE: '@fitscan_auth_state',
  ANALYSIS_RESULT: '@fitscan_analysis_result',
  ONBOARDING_COMPLETED: '@fitscan_onboarding_completed',
  MEAL_HISTORY: '@fitscan_meal_history',
  WORKOUT_HISTORY: '@fitscan_workout_history',
} as const;

// ── Types ────────────────────────────────────
type UserData = {
  age: string;
  height: string;
  weight: string;
  bodyImageUri: string | null;
};

type AuthState = {
  isAuthenticated: boolean;
  isGuest: boolean;
  email: string | null;
};

type MealHistoryEntry = {
  id: string;
  date: string;
  calories: number;
  imageUri?: string;
};

type WorkoutHistoryEntry = {
  id: string;
  date: string;
  title: string;
};

type UserContextType = {
  userData: UserData;
  setUserData: (data: UserData) => void;
  analysisResult: AnalysisResult | null;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (completed: boolean) => void;
  auth: AuthState;
  setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
  loginAsGuest: () => void;
  login: (email: string) => void;
  logout: () => void;
  isLoading: boolean;
  mealHistory: MealHistoryEntry[];
  addMealToHistory: (meal: MealHistoryEntry) => void;
  workoutHistory: WorkoutHistoryEntry[];
  addWorkoutToHistory: (workout: WorkoutHistoryEntry) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserDataState] = useState<UserData>({
    age: '',
    height: '',
    weight: '',
    bodyImageUri: null,
  });
  const [analysisResult, setAnalysisResultState] = useState<AnalysisResult | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboardingState] = useState(false);
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    isGuest: false,
    email: null,
  });
  const [mealHistory, setMealHistory] = useState<MealHistoryEntry[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryEntry[]>([]);

  // ── Carregar dados do AsyncStorage ─────────
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const [
          storedUserData,
          storedAuth,
          storedAnalysis,
          storedOnboarding,
          storedMeals,
          storedWorkouts,
        ] = await AsyncStorage.multiGet([
          STORAGE_KEYS.USER_DATA,
          STORAGE_KEYS.AUTH_STATE,
          STORAGE_KEYS.ANALYSIS_RESULT,
          STORAGE_KEYS.ONBOARDING_COMPLETED,
          STORAGE_KEYS.MEAL_HISTORY,
          STORAGE_KEYS.WORKOUT_HISTORY,
        ]);

        if (storedUserData[1]) {
          setUserDataState(JSON.parse(storedUserData[1]));
        }
        if (storedAuth[1]) {
          setAuth(JSON.parse(storedAuth[1]));
        }
        if (storedAnalysis[1]) {
          setAnalysisResultState(JSON.parse(storedAnalysis[1]));
        }
        if (storedOnboarding[1]) {
          setHasCompletedOnboardingState(JSON.parse(storedOnboarding[1]));
        }
        if (storedMeals[1]) {
          setMealHistory(JSON.parse(storedMeals[1]));
        }
        if (storedWorkouts[1]) {
          setWorkoutHistory(JSON.parse(storedWorkouts[1]));
        }
      } catch (error) {
        console.error('[UserContext] Erro ao carregar dados salvos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredData();
  }, []);

  // ── Setters com persistência ───────────────
  const setUserData = useCallback((data: UserData) => {
    setUserDataState(data);
    AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data)).catch(console.error);
  }, []);

  const setAnalysisResult = useCallback((result: AnalysisResult | null) => {
    setAnalysisResultState(result);
    if (result) {
      AsyncStorage.setItem(STORAGE_KEYS.ANALYSIS_RESULT, JSON.stringify(result)).catch(console.error);
    } else {
      AsyncStorage.removeItem(STORAGE_KEYS.ANALYSIS_RESULT).catch(console.error);
    }
  }, []);

  const setHasCompletedOnboarding = useCallback((completed: boolean) => {
    setHasCompletedOnboardingState(completed);
    AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, JSON.stringify(completed)).catch(console.error);
    if (completed) {
      setUserTags({ completed_onboarding: 'true' });
      trackEngagement(EngagementEvents.COMPLETED_ONBOARDING);
    }
  }, []);

  const addMealToHistory = useCallback((meal: MealHistoryEntry) => {
    setMealHistory(prev => {
      const updated = [meal, ...prev].slice(0, 50); // Manter últimos 50
      AsyncStorage.setItem(STORAGE_KEYS.MEAL_HISTORY, JSON.stringify(updated)).catch(console.error);
      return updated;
    });
    setUserTags({ used_nutriscan: 'true', total_meals_scanned: String(mealHistory.length + 1) });
    trackEngagement(EngagementEvents.MEAL_SCAN);
  }, [mealHistory.length]);

  const addWorkoutToHistory = useCallback((workout: WorkoutHistoryEntry) => {
    setWorkoutHistory(prev => {
      const updated = [workout, ...prev].slice(0, 50);
      AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(updated)).catch(console.error);
      return updated;
    });
    setUserTags({ used_coach: 'true', total_workouts: String(workoutHistory.length + 1) });
    trackEngagement(EngagementEvents.WORKOUT_GENERATED);
  }, [workoutHistory.length]);

  // ── Auth Actions ───────────────────────────
  const loginAsGuest = useCallback(() => {
    const newAuth = { isAuthenticated: true, isGuest: true, email: null };
    setAuth(newAuth);
    AsyncStorage.setItem(STORAGE_KEYS.AUTH_STATE, JSON.stringify(newAuth)).catch(console.error);
    setUserTags({ user_type: 'guest' });
  }, []);

  const login = useCallback((email: string) => {
    const newAuth = { isAuthenticated: true, isGuest: false, email };
    setAuth(newAuth);
    AsyncStorage.setItem(STORAGE_KEYS.AUTH_STATE, JSON.stringify(newAuth)).catch(console.error);
    setExternalUserId(email);
    setUserTags({ user_type: 'registered', email });
  }, []);

  const logout = useCallback(async () => {
    const newAuth: AuthState = { isAuthenticated: false, isGuest: false, email: null };
    setAuth(newAuth);
    setHasCompletedOnboardingState(false);
    setAnalysisResultState(null);
    setUserDataState({ age: '', height: '', weight: '', bodyImageUri: null });
    setMealHistory([]);
    setWorkoutHistory([]);

    removeExternalUserId();

    // Limpar tudo do AsyncStorage
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('[UserContext] Erro ao limpar dados:', error);
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        userData,
        setUserData,
        analysisResult,
        setAnalysisResult,
        hasCompletedOnboarding,
        setHasCompletedOnboarding,
        auth,
        setAuth,
        loginAsGuest,
        login,
        logout,
        isLoading,
        mealHistory,
        addMealToHistory,
        workoutHistory,
        addWorkoutToHistory,
      }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
};

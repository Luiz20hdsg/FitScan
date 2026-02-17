/**
 * Tipos compartilhados do FitScan
 */

// Resultado da análise corporal retornado pelo backend
export type AnalysisResult = {
  estimated_fat_percentage: number;
  estimated_biotype: string;
  suggested_goal: string;
  feedback: string;
};

// Resultado da análise de refeição retornado pelo backend
export type MealAnalysisResult = {
  total_calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  feedback: string;
  meal_type: string;
};

// Resultado do plano de treino retornado pelo backend
export type WorkoutExercise = {
  name: string;
  sets: number;
  reps?: string;
  duration?: string;
  tips: string;
};

export type WorkoutPlanResult = {
  title: string;
  focus: string;
  exercises: WorkoutExercise[];
  feedback: string;
};

// Tipos de navegação
export type RootStackParamList = {
  Welcome: undefined;
  Auth: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
};

export type MainTabParamList = {
  Hoje: undefined;
  NutriScan: undefined;
  Coach: undefined;
  Jornada: undefined;
  Perfil: undefined;
};

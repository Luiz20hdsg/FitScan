import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AnalysisResult } from '../types';

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

type UserContextType = {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  analysisResult: AnalysisResult | null;
  setAnalysisResult: React.Dispatch<React.SetStateAction<AnalysisResult | null>>;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: React.Dispatch<React.SetStateAction<boolean>>;
  auth: AuthState;
  setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
  loginAsGuest: () => void;
  login: (email: string) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<UserData>({
    age: '',
    height: '',
    weight: '',
    bodyImageUri: null,
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    isGuest: false,
    email: null,
  });

  const loginAsGuest = () => {
    setAuth({ isAuthenticated: true, isGuest: true, email: null });
  };

  const login = (email: string) => {
    setAuth({ isAuthenticated: true, isGuest: false, email });
  };

  const logout = () => {
    setAuth({ isAuthenticated: false, isGuest: false, email: null });
    setHasCompletedOnboarding(false);
    setAnalysisResult(null);
    setUserData({ age: '', height: '', weight: '', bodyImageUri: null });
  };

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

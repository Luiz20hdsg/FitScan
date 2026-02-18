# Documentação Completa do Projeto FitScan

## 1. Introdução

O FitScan é um aplicativo inovador que atua como um "Personal Trainer e Nutricionista de Bolso movido a Visão Computacional". Sua proposta de valor é eliminar o atrito da entrada manual de dados em aplicativos de fitness, utilizando Inteligência Artificial para analisar fotos de refeições e do corpo do usuário, gerando planos de nutrição e treino personalizados e adaptativos.

**Slogan:** "Seus olhos veem, o FitScan entende. Nutrição e Treino através da IA."

**Proposta de Valor:** A maioria dos apps de fitness exige entrada manual de dados (ex: "digitar arroz, 100g") e oferece treinos genéricos. O FitScan elimina esse atrito: o usuário tira fotos, e a IA faz o trabalho pesado de cálculo e planejamento, criando uma ponte personalizada entre o que o usuário come e como ele treina.

**Modelo de Negócio:** App pago nas lojas (App Store / Google Play). O preço de download cobre acesso completo a todas as funcionalidades, sem anúncios ou paywalls internas.

## 2. Arquitetura Geral

O FitScan é uma aplicação full-stack composta por:

*   **Frontend (Mobile App):** React Native 0.84.0 com TypeScript (Community CLI, sem Expo). Interface moderna com design system inspirado em Jony Ive, gradientes indigo→cyan.
*   **Backend (API):** Python com FastAPI. Integração real com OpenAI Vision API (GPT-4o-mini) para análise de imagens e geração de treinos.
*   **Persistência Local:** AsyncStorage para dados do usuário, histórico de refeições e treinos.
*   **Notificações:** OneSignal SDK para push notifications, engajamento e lembretes.
*   **Configuração:** react-native-config para variáveis de ambiente (.env) em ambas as plataformas.

## 3. Tecnologias Utilizadas

### Frontend
| Tecnologia | Versão | Uso |
|---|---|---|
| React Native | 0.84.0 | Framework mobile (Community CLI) |
| TypeScript | 5.x | Tipagem estática |
| React Navigation | 7.x | Navegação (native-stack + bottom-tabs) |
| react-native-linear-gradient | - | Gradientes na UI |
| react-native-vector-icons | - | Ícones Ionicons |
| react-native-image-picker | - | Câmera e galeria |
| react-native-config | - | Variáveis de ambiente (.env) |
| @react-native-async-storage/async-storage | - | Persistência local |
| react-native-onesignal | 5.x | Push notifications |

### Backend
| Tecnologia | Uso |
|---|---|
| Python 3.10+ | Linguagem principal |
| FastAPI 0.127.0 | Framework web |
| OpenAI SDK 1.x | GPT-4o-mini para Vision e Text |
| Uvicorn | Servidor ASGI |
| python-dotenv | Variáveis de ambiente |

## 4. Estrutura de Pastas

```
FitScan/
├── App.tsx                          # Root: Loading → Auth flow → MainTabs
├── .env                             # Variáveis de ambiente (não commitado)
├── .env.example                     # Template de variáveis
├── src/
│   ├── config.ts                    # Config centralizada via react-native-config
│   ├── types/
│   │   ├── index.ts                 # Tipos compartilhados
│   │   └── react-native-config.d.ts # Type declarations
│   ├── context/
│   │   └── UserContext.tsx          # Estado global + AsyncStorage persistence
│   ├── services/
│   │   └── NotificationService.ts   # OneSignal integration
│   ├── theme/
│   │   └── index.ts                 # Design system tokens
│   ├── components/
│   │   ├── Buttons.tsx              # GradientButton, OutlineButton
│   │   └── Card.tsx                 # Card component
│   ├── navigation/
│   │   └── MainTabs.tsx             # BottomTabNavigator (5 abas)
│   └── screens/
│       ├── WelcomeScreen.tsx        # Tela de boas-vindas com logo
│       ├── AuthScreen.tsx           # Login / Cadastro / Modo convidado
│       ├── OnboardingScreen.tsx     # Coleta de dados + foto corporal
│       ├── DashboardScreen.tsx      # Dashboard com diagnóstico e resumo do dia
│       ├── NutriScanScreen.tsx      # Scan de refeição com IA
│       ├── CoachScreen.tsx          # Geração de treino com IA
│       ├── JourneyScreen.tsx        # Histórico de atividades
│       └── ProfileScreen.tsx        # Perfil + ações + info do app
├── backend/
│   ├── main.py                      # API FastAPI + OpenAI Vision
│   ├── .env                         # Credenciais backend (não commitado)
│   ├── .env.example                 # Template backend
│   └── requirements.txt            # Dependências Python
├── android/                         # Projeto nativo Android
├── ios/                             # Projeto nativo iOS
├── scripts/
│   └── generate-icon.js            # Gerador de ícone do app
└── package.json
```

## 5. Fluxo de Navegação

```
App.tsx (LoadingScreen enquanto restaura dados)
├── WelcomeScreen (primeira abertura)
│   └── AuthScreen (login / cadastro / convidado)
│       └── OnboardingScreen (se não completou)
│           └── MainTabs
└── MainTabs (se já autenticado + onboarding completo)
    ├── Tab: "Hoje"      → DashboardScreen
    ├── Tab: "NutriScan" → NutriScanScreen
    ├── Tab: "Coach"     → CoachScreen
    ├── Tab: "Jornada"   → JourneyScreen
    └── Tab: "Perfil"    → ProfileScreen
```

**Lógica de rota inicial (App.tsx):**
- Se `isLoading` → mostra LoadingScreen (splash com ActivityIndicator)
- Se não autenticado → Welcome
- Se autenticado mas não fez onboarding → Onboarding
- Se autenticado + onboarding completo → MainTabs

## 6. Gerenciamento de Estado (UserContext)

### 6.1. Dados Persistidos com AsyncStorage

| Chave | Tipo | Descrição |
|---|---|---|
| `@fitscan_user_data` | `UserData` | Idade, altura, peso, URI da foto |
| `@fitscan_auth_state` | `AuthState` | Email, isAuthenticated, isGuest |
| `@fitscan_analysis_result` | `AnalysisResult` | Resultado da análise corporal |
| `@fitscan_onboarding_completed` | `boolean` | Flag de onboarding |
| `@fitscan_meal_history` | `MealHistoryEntry[]` | Histórico de refeições |
| `@fitscan_workout_history` | `WorkoutHistoryEntry[]` | Histórico de treinos |

### 6.2. Context API

| Propriedade | Tipo | Descrição |
|---|---|---|
| `userData` / `setUserData` | `UserData` | Dados do usuário |
| `analysisResult` / `setAnalysisResult` | `AnalysisResult \| null` | Análise corporal |
| `hasCompletedOnboarding` / `setHasCompletedOnboarding` | `boolean` | Flag onboarding |
| `auth` / `setAuth` | `AuthState` | Estado de autenticação |
| `loginAsGuest()` | `() => void` | Login como convidado |
| `login(email)` | `(email: string) => void` | Login com email |
| `logout()` | `() => void` | Logout + limpa AsyncStorage |
| `isLoading` | `boolean` | True enquanto restaura dados |
| `mealHistory` / `addMealToHistory` | `MealHistoryEntry[]` | Histórico de refeições |
| `workoutHistory` / `addWorkoutToHistory` | `WorkoutHistoryEntry[]` | Histórico de treinos |

### 6.3. Integração com OneSignal

- `login()` → chama `setExternalUserId(email)` + `setUserTags()`
- `logout()` → chama `removeExternalUserId()`
- Tags enviadas: `user_email`, `has_analysis`, `onboarding_completed`

## 7. Telas

### 7.1. WelcomeScreen
- Logo animado com gradiente flash (⚡)
- Botão "Começar Agora" → AuthScreen
- Design hero com gradiente indigo→cyan

### 7.2. AuthScreen
- Abas Login / Cadastro
- Validação de email e senha (min 6 chars)
- Botão "Entrar como Convidado"
- Após auth → Onboarding (ou MainTabs se já completou)

### 7.3. OnboardingScreen
- Coleta: idade, altura, peso + foto corporal (câmera/galeria)
- Validações: idade 10-120, altura 100-250cm, peso 30-300kg, foto obrigatória
- `POST /analyze-body/` com multipart/form-data
- Loading com texto descritivo
- Após sucesso: salva no context + `navigation.reset` para MainTabs

### 7.4. DashboardScreen (Aba "Hoje")
- Diagnóstico inicial (biotipo, gordura, meta, feedback)
- Resumo do dia: total de calorias e refeições do dia
- Botões de ação rápida → NutriScan e Coach
- Fallback seguro se `analysisResult === null`

### 7.5. NutriScanScreen (Aba "NutriScan")
- Seleção de foto (câmera/galeria)
- `POST /analyze-meal/` → OpenAI Vision API
- Resultado inline: card de calorias, macros coloridos, feedback
- Salva automaticamente no `mealHistory`
- Botão "Nova Análise" para limpar

### 7.6. CoachScreen (Aba "Coach")
- Formulário: local de treino + limitações
- `POST /generate-workout/` → OpenAI GPT-4o-mini
- Resultado inline: título, foco, exercícios numerados, dicas
- Salva automaticamente no `workoutHistory`
- Botão "Gerar Novo Treino"

### 7.7. JourneyScreen (Aba "Jornada")
- Stats cards: total refeições, total calorias, total treinos
- Timeline de atividades recentes (refeições + treinos combinados)
- Ordenação por data (mais recente primeiro)
- Empty state com mensagem motivacional

### 7.8. ProfileScreen (Aba "Perfil")
- Avatar com inicial do email (ou ícone para convidado)
- Card "Seus Dados" com idade, altura, peso, biotipo, gordura, meta
- Card "Sua Atividade" com stats (refeições, calorias, treinos)
- Ações rápidas: Avaliar na loja, Compartilhar, Suporte
- Botão "Refazer Análise Corporal"
- Logout / Criar conta (para convidados)
- Versão do app (FitScan v1.0.0)

## 8. Design System

### 8.1. Cores
| Token | Valor | Uso |
|---|---|---|
| `background` | `#0A0A0F` | Fundo principal |
| `surface` | `#12121A` | Cards e superfícies |
| `surfaceLight` | `#1A1A2E` | Superfícies elevadas |
| `primary` | `#6366F1` | Indigo principal |
| `primaryLight` | `#818CF8` | Indigo claro |
| `accent` | `#06B6D4` | Cyan de destaque |
| `accentLight` | `#22D3EE` | Cyan claro |
| `success` | `#10B981` | Verde |
| `warning` | `#F59E0B` | Âmbar |
| `error` | `#EF4444` | Vermelho |

### 8.2. Gradientes
- **Primary:** `#6366F1` → `#818CF8` (Indigo)
- **Accent:** `#06B6D4` → `#22D3EE` (Cyan)
- **Hero:** `#6366F1` → `#8B5CF6` → `#06B6D4` (Indigo→Violet→Cyan)

### 8.3. Componentes Reutilizáveis
- `Card` — com borda, border-radius, opção de gradiente
- `GradientButton` — botão com gradiente (primary/accent/hero)
- `OutlineButton` — botão com borda e fundo transparente

## 9. Backend API

### 9.1. Endpoints

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/` | Status da API |
| GET | `/health` | Health check com info do ambiente |
| POST | `/analyze-body/` | Análise corporal com IA |
| POST | `/analyze-meal/` | Análise nutricional com IA |
| POST | `/generate-workout/` | Geração de treino com IA |

### 9.2. Integração OpenAI

- **Modelo:** GPT-4o-mini (Vision + Text)
- **Análise corporal:** Envia imagem base64 + dados do usuário → biotipo, % gordura, meta, feedback
- **Análise nutricional:** Envia foto da refeição base64 → calorias, macros, tipo de refeição, feedback
- **Geração de treino:** Texto com dados do usuário + local + limitações → plano completo
- **Fallback:** Se `OPENAI_API_KEY` não configurada, usa simulação com cálculos de IMC e dados aleatórios

### 9.3. Variáveis de Ambiente (Backend)

```env
OPENAI_API_KEY=sk-xxx          # Chave da API OpenAI
APP_ENV=development            # development | production
ALLOWED_ORIGINS=*              # Origens permitidas para CORS
RATE_LIMIT_PER_MINUTE=30       # Limite de requests por minuto
```

## 10. Notificações (OneSignal)

### 10.1. Serviço (`NotificationService.ts`)
- `initializeNotifications(appId)` — Inicializa SDK do OneSignal
- `requestNotificationPermission()` — Solicita permissão
- `setUserTags(tags)` — Define tags do usuário para segmentação
- `setExternalUserId(id)` — Associa usuário com ID externo
- `removeExternalUserId()` — Remove associação no logout
- `trackEngagement(event)` — Rastreia eventos de engajamento

### 10.2. Eventos de Engajamento
| Evento | Quando |
|---|---|
| `APP_OPENED` | App inicializado |
| `ONBOARDING_COMPLETED` | Onboarding finalizado |
| `BODY_ANALYSIS` | Análise corporal realizada |
| `MEAL_SCANNED` | Refeição escaneada |
| `WORKOUT_GENERATED` | Treino gerado |

## 11. Configuração de Ambiente

### 11.1. Variáveis Frontend (.env)

```env
API_URL=http://localhost:8000     # URL da API backend
OPENAI_API_KEY=sk-xxx             # Chave OpenAI (opcional no frontend)
ONESIGNAL_APP_ID=xxx              # App ID do OneSignal
APP_VERSION=1.0.0                 # Versão do app
APP_ENV=development               # Ambiente
```

### 11.2. Plataformas
- **Android:** react-native-config configurado via `dotenv.gradle` em `android/app/build.gradle`
- **iOS:** react-native-config configurado via pod `react-native-config/Extension` no Podfile

## 12. Como Executar

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Configurar OPENAI_API_KEY
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### iOS
```bash
cd FitScan
npm install
cd ios && bundle exec pod install && cd ..
cp .env.example .env  # Configurar credenciais
npx react-native run-ios
```

### Android
```bash
cd FitScan
npm install
cp .env.example .env  # Configurar credenciais
npx react-native run-android
```

## 13. Modelo de Negócio

### Estratégia: App Pago
- **Modelo:** Download pago nas lojas (App Store / Google Play)
- **Preço:** Definido pelo proprietário na App Store Connect / Google Play Console
- **Inclui:** Acesso completo a todas as funcionalidades (análise corporal, NutriScan, Coach, Jornada)
- **Sem anúncios:** Experiência premium limpa
- **Sem in-app purchases:** Todas as features desbloqueadas na compra

### Funcionalidades de Retenção
- Push notifications (OneSignal) para lembretes de refeição e treino
- Histórico de atividades persistido localmente
- Compartilhamento do app (boca a boca)
- Avaliação na loja (social proof)
- Suporte via email

### Custo Operacional
- **OpenAI API:** Custo por chamada de Vision/Text (~$0.01-0.05 por análise)
- **OneSignal:** Gratuito até 10k subscribers, depois plano pago
- **Servidor:** VPS para hospedar FastAPI backend

## 14. Configurações Nativas (Permissões)

### Android (`AndroidManifest.xml`)
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```

### iOS (`Info.plist`)
```xml
<key>NSCameraUsageDescription</key>
<string>O FitScan precisa de acesso à sua câmera para análise corporal e escanear refeições.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>O FitScan precisa de acesso à galeria para selecionar fotos para análise.</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>O FitScan precisa de acesso para salvar imagens do seu progresso.</string>
```

### Android Config
- `compileSdk`: 36
- `targetSdk`: 36
- `minSdk`: 24
- `Kotlin`: 2.1.20
- `buildTools`: 36.0.0

## 15. Ícone do App

Ícone gerado programaticamente com gradiente indigo→cyan e símbolo de raio (⚡). Gerado para todos os tamanhos:

- **iOS:** 20x20 até 1024x1024 (AppIcon.appiconset)
- **Android:** mipmap-mdpi (48), mipmap-hdpi (72), mipmap-xhdpi (96), mipmap-xxhdpi (144), mipmap-xxxhdpi (192) — ic_launcher.png e ic_launcher_round.png

Script de geração: `scripts/generate-icon.js` (usa @napi-rs/canvas)

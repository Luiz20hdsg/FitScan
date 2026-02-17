# Documentação Completa do Projeto FitScan

## 1. Introdução

O FitScan é um aplicativo inovador que atua como um "Personal Trainer e Nutricionista de Bolso movido a Visão Computacional". Sua proposta de valor é eliminar o atrito da entrada manual de dados em aplicativos de fitness, utilizando Inteligência Artificial para analisar fotos de refeições e do corpo do usuário, gerando planos de nutrição e treino personalizados e adaptativos.

**Slogan:** "Seus olhos veem, o FitScan entende. Nutrição e Treino através da IA."

**Proposta de Valor:** A maioria dos apps de fitness exige entrada manual de dados (ex: "digitar arroz, 100g") e oferece treinos genéricos. O FitScan elimina esse atrito: o usuário tira fotos, e a IA faz o trabalho pesado de cálculo e planejamento, criando uma ponte personalizada entre o que o usuário come e como ele treina.

## 2. Arquitetura Geral

O FitScan é uma aplicação full-stack composta por:

*   **Frontend (Mobile App):** Desenvolvido em React Native 0.84.0 com TypeScript, para iOS e Android (sem Expo, usando React Native Community CLI). Responsável pela interface do usuário, coleta de dados (incluindo fotos) e comunicação com o backend.
*   **Backend (API):** Desenvolvido em Python com FastAPI. Atua como o "cérebro" do aplicativo, recebendo as requisições do frontend, processando-as (atualmente com simulações de IA) e retornando as análises e planos.
*   **Inteligência Artificial (IA):** Atualmente simulada no backend. A visão final prevê o uso de modelos de Visão Computacional (para análise de imagens) e um LLM (Large Language Model) como o Gemini 1.5 Pro para análise contextual e geração de feedback.
*   **Banco de Dados (Futuro):** O plano inclui PostgreSQL para dados relacionais (usuários, histórico) e um Banco de Dados Vetorial (Pinecone/Milvus) para memória contextual da IA.

## 3. Frontend (React Native)

### 3.1. Tecnologias Utilizadas

*   **React Native 0.84.0:** Framework para desenvolvimento de aplicativos móveis multiplataforma (sem Expo, Community CLI).
*   **TypeScript:** Linguagem de programação que adiciona tipagem estática ao JavaScript.
*   **React Navigation:** Biblioteca para gerenciamento de navegação entre telas e abas (`@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`).
*   **react-native-screens:** Otimização de performance para navegação nativa.
*   **react-native-safe-area-context:** Gerenciamento de áreas seguras (notch, barra de status).
*   **react-native-image-picker:** Biblioteca para acesso à câmera e galeria de imagens do dispositivo.
*   **Context API (React):** Gerenciamento de estado global da aplicação (dados do usuário e resultado da análise).

### 3.2. Estrutura de Pastas

```
FitScan/
├── App.tsx                         # Componente raiz: SafeAreaProvider + UserProvider + NavigationContainer
├── src/
│   ├── config.ts                   # Configuração centralizada (API_URL)
│   ├── types/
│   │   └── index.ts                # Tipos TypeScript compartilhados (AnalysisResult, WorkoutPlanResult, ParamLists)
│   ├── context/
│   │   └── UserContext.tsx         # Context API para estado global (userData, analysisResult)
│   ├── navigation/
│   │   └── MainTabs.tsx            # BottomTabNavigator com 5 abas
│   └── screens/
│       ├── OnboardingScreen.tsx    # Tela de primeiro acesso e coleta de dados iniciais
│       ├── DashboardScreen.tsx     # Tela principal com o diagnóstico inicial
│       ├── NutriScanScreen.tsx     # Tela para análise de refeições (com UI de resultado inline)
│       ├── CoachScreen.tsx         # Tela para geração de planos de treino (com UI de resultado inline)
│       ├── JourneyScreen.tsx       # Tela para histórico e evolução (placeholder)
│       └── ProfileScreen.tsx       # Tela de perfil com dados do usuário
├── backend/
│   ├── main.py                     # Aplicação FastAPI principal
│   └── requirements.txt           # Dependências Python
├── android/                        # Projeto nativo Android
├── ios/                            # Projeto nativo iOS
├── package.json                    # Dependências Node.js
└── tsconfig.json                   # Configuração TypeScript
```

### 3.3. Gerenciamento de Estado

O app utiliza **React Context API** para gerenciar estado global, evitando prop drilling e perda de dados entre telas.

**`src/context/UserContext.tsx`** fornece:

| Estado                    | Tipo                    | Descrição                                               |
|---------------------------|-------------------------|---------------------------------------------------------|
| `userData`                | `UserData`              | Idade, altura, peso e URI da foto corporal do usuário   |
| `analysisResult`          | `AnalysisResult \| null` | Resultado da análise corporal retornado pelo backend     |
| `hasCompletedOnboarding`  | `boolean`               | Flag indicando se o onboarding foi concluído            |

**Hook de acesso:** `useUser()` — disponível em qualquer componente dentro do `<UserProvider>`.

### 3.4. Tipos Compartilhados (`src/types/index.ts`)

| Tipo                   | Descrição                                                          |
|------------------------|--------------------------------------------------------------------|
| `AnalysisResult`       | Resultado da análise corporal (biotipo, % gordura, meta, feedback) |
| `MealAnalysisResult`   | Resultado da análise nutricional (calorias, macros, feedback)      |
| `WorkoutExercise`      | Exercício individual (nome, séries, reps/duração, dicas)           |
| `WorkoutPlanResult`    | Plano de treino completo (título, foco, exercícios, feedback)      |
| `RootStackParamList`   | Tipagem da navegação Stack (Onboarding → MainTabs)                 |
| `MainTabParamList`     | Tipagem das abas (Hoje, NutriScan, Coach, Jornada, Perfil)        |

### 3.5. Configuração Centralizada (`src/config.ts`)

A URL da API é definida uma única vez:

```typescript
export const API_URL = Platform.OS === 'ios'
  ? 'http://localhost:8000'
  : 'http://10.0.2.2:8000';
```

*   **iOS:** Usa `localhost` pois o simulador compartilha a rede do host.
*   **Android:** Usa `10.0.2.2` que é o alias para o host no emulador Android.

### 3.6. Fluxo de Navegação

```
App.tsx
├── Stack.Navigator
│   ├── OnboardingScreen (tela inicial)
│   │   └── [Após análise] → navigation.reset → MainTabs
│   └── MainTabs
│       ├── Tab: "Hoje"      → DashboardScreen
│       ├── Tab: "NutriScan" → NutriScanScreen
│       ├── Tab: "Coach"     → CoachScreen
│       ├── Tab: "Jornada"   → JourneyScreen
│       └── Tab: "Perfil"    → ProfileScreen
```

**Detalhes importantes:**
*   Após o onboarding, usa `navigation.reset()` em vez de `navigate()` para impedir o usuário de voltar à tela de onboarding com o botão "voltar".
*   Os dados da análise são armazenados no `UserContext`, não passados como parâmetros de rota, evitando crashes quando o Dashboard é acessado sem dados.

### 3.7. Telas Implementadas

Todas as telas seguem um padrão de estilo escuro (`#121212`) com acentos em verde (`#1DB954`).

#### `OnboardingScreen.tsx`
*   **Funcionalidade:** Coleta idade, altura, peso e uma foto corporal do usuário.
*   **Validações Frontend:**
    *   Idade: 10–120 anos
    *   Altura: 100–250 cm
    *   Peso: 30–300 kg
    *   Foto: obrigatória
    *   Campos numéricos com `maxLength={3}`
*   **Integração:** `POST /analyze-body/` (multipart/form-data).
*   **Após sucesso:** Salva dados no `UserContext` e faz `navigation.reset` para `MainTabs`.
*   **UI:** Loading com texto descritivo, botão desabilitado visualmente durante carregamento.

#### `DashboardScreen.tsx` (Aba "Hoje")
*   **Funcionalidade:** Exibe o diagnóstico inicial do usuário.
*   **Fallback seguro:** Se `analysisResult` for `null`, exibe tela de boas-vindas em vez de crashar.
*   **UI:** Cards com emojis e hierarquia visual: meta (verde destaque), biotipo e gordura (lado a lado), feedback, dados pessoais, botões de ação.

#### `NutriScanScreen.tsx` (Aba "NutriScan")
*   **Funcionalidade:** Selecionar/fotografar refeição e obter análise nutricional.
*   **Integração:** `POST /analyze-meal/` (multipart/form-data).
*   **UI do resultado:** Renderizado inline (não em Alert), com:
    *   Card de calorias em destaque (número grande)
    *   Macros em cards coloridos (Proteína=vermelho, Carbos=verde, Gordura=amarelo)
    *   Card de feedback da IA
    *   Botão "Nova Análise" para limpar e refazer

#### `CoachScreen.tsx` (Aba "Coach")
*   **Funcionalidade:** Informar local de treino e limitações, receber plano personalizado.
*   **Integração:** `POST /generate-workout/` (multipart/form-data).
*   **UI do resultado:** Renderizado inline (não em Alert), com:
    *   Header com título do treino e badge de foco
    *   Exercícios numerados com chips de séries/reps
    *   Dicas com emoji 💡
    *   Card de observações
    *   Botão "Gerar Novo Treino"

#### `JourneyScreen.tsx` (Aba "Jornada")
*   **Status:** Placeholder com badge "Em breve".
*   **Futuro:** Gráficos de progresso, histórico, fotos de evolução.

#### `ProfileScreen.tsx` (Aba "Perfil")
*   **Funcionalidade:** Exibe dados do usuário e resultado da análise (lidos do `UserContext`).
*   **UI:** Card com dados pessoais, botão "Refazer Análise Corporal", seção "Em breve".

### 3.8. Configurações Nativas (Permissões)

#### Android (`android/app/src/main/AndroidManifest.xml`)
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<!-- android:requestLegacyExternalStorage="true" na tag <application> -->
```

#### iOS (`ios/FitScan/Info.plist`)
```xml
<key>NSCameraUsageDescription</key>
<string>O FitScan precisa de acesso à sua câmera para realizar a análise de composição corporal e escanear suas refeições.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>O FitScan precisa de acesso à sua galeria para que você possa selecionar fotos para análise corporal e de refeições.</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>O FitScan precisa de acesso para salvar imagens em sua galeria, como seu histórico de progresso visual.</string>
```

## 4. Backend (FastAPI com Python)

### 4.1. Tecnologias Utilizadas

*   **Python 3.10+:** Linguagem de programação principal.
*   **FastAPI 0.127.0:** Framework web moderno e rápido para construir APIs.
*   **Uvicorn:** Servidor ASGI para rodar aplicações FastAPI.
*   **python-multipart:** Parsing de formulários `multipart/form-data` (upload de arquivos).
*   **CORS Middleware:** Habilitado para permitir requisições do app mobile.

### 4.2. Endpoints Implementados

| Método | Endpoint              | Descrição                                      |
|--------|-----------------------|------------------------------------------------|
| GET    | `/`                   | Verifica se a API está online (retorna versão) |
| GET    | `/health`             | Health check endpoint                          |
| POST   | `/analyze-body/`      | Análise corporal (idade, altura, peso, imagem) |
| POST   | `/analyze-meal/`      | Análise nutricional de refeição (imagem)       |
| POST   | `/generate-workout/`  | Geração de plano de treino personalizado       |

### 4.3. Validações do Backend

| Endpoint           | Validação                                           |
|--------------------|-----------------------------------------------------|
| `/analyze-body/`   | Idade: 10–120, Altura: 100–250cm, Peso: 30–300kg   |
| `/analyze-body/`   | Arquivo deve ser imagem (`content_type: image/*`)   |
| `/analyze-meal/`   | Arquivo deve ser imagem (`content_type: image/*`)   |
| `/generate-workout/`| Local de treino não pode ser vazio                  |

Validações retornam `HTTP 422` com mensagem descritiva em `detail`.

### 4.4. Detalhes dos Endpoints

#### `POST /analyze-body/`
*   **Parâmetros (Form Data):** `age` (int), `height` (int), `weight` (int), `image` (UploadFile)
*   **Simulação de IA:** Calcula IMC e retorna biotipo, meta, % gordura e feedback baseados no resultado.
*   **Retorno:** `{ estimated_fat_percentage, estimated_biotype, suggested_goal, feedback }`

#### `POST /analyze-meal/`
*   **Parâmetros (Form Data):** `image` (UploadFile)
*   **Simulação de IA:** Escolhe aleatoriamente entre 4 análises nutricionais pré-definidas.
*   **Retorno:** `{ total_calories, macros: { protein, carbs, fat }, feedback, meal_type }`

#### `POST /generate-workout/`
*   **Parâmetros (Form Data):** `training_location` (str), `limitations` (str, opcional)
*   **Simulação de IA:** Gera plano adaptativo:
    *   Se `limitations` contém "joelho" → adapta agachamento para Smith
    *   Se `limitations` contém "lombar"/"costas" → adapta para Leg Press 45°
    *   Se `training_location` contém "casa" → troca para exercícios com peso corporal
*   **Retorno:** `{ title, focus, exercises: [{ name, sets, reps/duration, tips }], feedback }`

### 4.5. Como Executar o Backend

```bash
cd FitScan/backend

# Criar ambiente virtual (recomendado)
python3 -m venv venv
source venv/bin/activate  # macOS/Linux

# Instalar dependências
pip install -r requirements.txt

# Executar
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

A documentação interativa da API estará disponível em: `http://localhost:8000/docs`

## 5. Como Executar o App

### iOS
```bash
cd FitScan/ios
bundle install
bundle exec pod install
cd ..
npx react-native run-ios
```

### Android
```bash
cd FitScan
npx react-native run-android
```

### Metro Bundler (se não iniciar automaticamente)
```bash
cd FitScan
npx react-native start
```

## 6. Melhorias em relação à versão anterior

| Aspecto                | Antes (v1)                                     | Agora (v2)                                        |
|------------------------|-------------------------------------------------|---------------------------------------------------|
| Criação do projeto     | Comando incorreto                               | `npx @react-native-community/cli@latest init`    |
| React Native           | Versão antiga                                    | 0.84.0                                            |
| Estado global          | Props via navegação (perdia ao trocar aba)       | Context API (persistente entre telas)             |
| DashboardScreen        | Crashava sem params                              | Fallback seguro com tela de boas-vindas           |
| Resultados NutriScan   | Alert (texto longo, péssima UX)                  | UI inline rica com cards coloridos                |
| Resultados Coach       | Alert (texto longo, péssima UX)                  | UI inline com exercícios numerados                |
| Navegação pós-onboarding | `navigate` (permitia voltar)                   | `navigation.reset` (impede voltar)                |
| API_URL                | Duplicada em cada tela                           | Centralizada em `config.ts`                       |
| Tipos TypeScript       | Dispersos e inconsistentes                       | Centralizados em `src/types/index.ts`             |
| Backend CORS           | Não configurado                                  | CORS habilitado                                   |
| Backend validação      | Nenhuma (valores negativos passavam)             | Validação completa com HTTP 422                   |
| Backend health check   | Inexistente                                      | `GET /health`                                     |
| Validação frontend     | Apenas "campos vazios"                           | Faixas válidas (idade, altura, peso)              |
| OnboardingScreen       | Código com linhas em branco excessivas           | Código limpo e organizado                         |
| ProfileScreen          | Placeholder sem dados                            | Exibe dados do UserContext                        |

## 7. Próximos Passos Sugeridos

*   **IA Real:** Integrar modelos de Visão Computacional (TensorFlow/PyTorch) e LLM (Gemini 1.5 Pro).
*   **Persistência:** PostgreSQL para dados de usuários + AsyncStorage para cache local.
*   **Autenticação:** Sistema de login/registro (Firebase Auth ou JWT).
*   **Jornada:** Gráficos de progresso (react-native-chart-kit), fotos antes/depois.
*   **Perfil:** Edição de dados, preferências alimentares, metas personalizadas.
*   **Notificações:** Push notifications para lembrar de registrar refeições/treinos.
*   **Câmera em tempo real:** Integração com câmera para NutriScan instantâneo.
*   **Testes:** Jest + React Native Testing Library para testes unitários e de integração.

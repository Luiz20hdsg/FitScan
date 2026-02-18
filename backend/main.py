"""
FitScan API - Backend de Produção
Personal Trainer e Nutricionista de Bolso com IA

Integra OpenAI Vision API para análise real de imagens.
Fallback para análise baseada em IMC quando a chave não está configurada.
"""

import asyncio
import base64
import json
import logging
import os
import random
import time
from collections import defaultdict
from typing import Annotated

from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Carregar variáveis de ambiente
load_dotenv()

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("fitscan")

# Configuração
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
APP_ENV = os.getenv("APP_ENV", "development")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "30"))

# Verificar se temos a chave da OpenAI
HAS_OPENAI = bool(OPENAI_API_KEY and not OPENAI_API_KEY.startswith("sk-your"))

if HAS_OPENAI:
    import openai
    client = openai.AsyncOpenAI(api_key=OPENAI_API_KEY)
    logger.info("✅ OpenAI API configurada - modo IA real ativado")
else:
    client = None
    logger.warning("⚠️  OpenAI API key não configurada - usando modo simulação")

app = FastAPI(
    title="FitScan API",
    description="Backend do FitScan - Personal Trainer e Nutricionista de Bolso com IA.",
    version="1.0.0",
    docs_url="/docs" if APP_ENV == "development" else None,
    redoc_url="/redoc" if APP_ENV == "development" else None,
)

# ── Rate Limiting ─────────────────────────────
rate_limit_store: dict[str, list[float]] = defaultdict(list)


async def check_rate_limit(request: Request):
    """Verifica rate limiting por IP."""
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    window = 60  # 1 minuto

    # Limpar entradas antigas
    rate_limit_store[client_ip] = [
        t for t in rate_limit_store[client_ip] if now - t < window
    ]

    if len(rate_limit_store[client_ip]) >= RATE_LIMIT_PER_MINUTE:
        raise HTTPException(
            status_code=429,
            detail="Muitas requisições. Tente novamente em 1 minuto.",
        )

    rate_limit_store[client_ip].append(now)


# ── CORS ──────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Middleware de segurança ───────────────────
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    if APP_ENV == "production":
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )
    return response


# ── Exception handler global ─────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Erro não tratado: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Erro interno do servidor. Tente novamente."},
    )


# ════════════════════════════════════════════════
# IA REAL - OpenAI Vision API
# ════════════════════════════════════════════════


async def analyze_body_with_ai(
    image_data: bytes, age: int, height: int, weight: int
) -> dict:
    """Análise corporal real usando OpenAI Vision API."""
    base64_image = base64.b64encode(image_data).decode("utf-8")
    bmi = round(weight / ((height / 100) ** 2), 1)

    prompt = f"""Você é um personal trainer e nutricionista profissional analisando a foto corporal de um cliente.

Dados do cliente:
- Idade: {age} anos
- Altura: {height} cm
- Peso: {weight} kg
- IMC calculado: {bmi}

Analise a foto e retorne EXATAMENTE um JSON com esta estrutura (sem markdown, sem ```):
{{
  "estimated_fat_percentage": <número entre 8 e 45>,
  "estimated_biotype": "<Ectomorfo, Mesomorfo ou Endomorfo>",
  "suggested_goal": "<meta principal sugerida em português>",
  "feedback": "<feedback detalhado e motivacional em português, 2-3 frases>"
}}

Seja preciso na estimativa do percentual de gordura baseado na imagem.
O feedback deve ser profissional, motivacional e em português brasileiro."""

    try:
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                                "detail": "low",
                            },
                        },
                    ],
                }
            ],
            max_tokens=500,
            temperature=0.3,
        )

        result_text = response.choices[0].message.content.strip()
        # Limpar possível markdown
        if result_text.startswith("```"):
            result_text = result_text.split("\n", 1)[1]
            result_text = result_text.rsplit("```", 1)[0]

        return json.loads(result_text)

    except json.JSONDecodeError as e:
        logger.error(f"Erro ao parsear resposta da IA: {e}")
        # Fallback para análise baseada em IMC
        return await simulate_body_analysis(age, height, weight)
    except Exception as e:
        logger.error(f"Erro na OpenAI API: {e}")
        return await simulate_body_analysis(age, height, weight)


async def analyze_meal_with_ai(image_data: bytes) -> dict:
    """Análise nutricional real usando OpenAI Vision API."""
    base64_image = base64.b64encode(image_data).decode("utf-8")

    prompt = """Você é um nutricionista profissional analisando a foto de uma refeição.

Analise a refeição na imagem e retorne EXATAMENTE um JSON com esta estrutura (sem markdown, sem ```):
{
  "total_calories": <número estimado de calorias>,
  "macros": {
    "protein": <gramas de proteína>,
    "carbs": <gramas de carboidratos>,
    "fat": <gramas de gordura>
  },
  "feedback": "<feedback nutricional detalhado em português, 2-3 frases com dicas>",
  "meal_type": "<tipo da refeição - ex: Almoço - Frango Grelhado com Arroz>"
}

Seja preciso nas estimativas baseado no que vê na imagem.
O feedback deve incluir sugestões práticas em português brasileiro."""

    try:
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                                "detail": "low",
                            },
                        },
                    ],
                }
            ],
            max_tokens=500,
            temperature=0.3,
        )

        result_text = response.choices[0].message.content.strip()
        if result_text.startswith("```"):
            result_text = result_text.split("\n", 1)[1]
            result_text = result_text.rsplit("```", 1)[0]

        return json.loads(result_text)

    except json.JSONDecodeError as e:
        logger.error(f"Erro ao parsear resposta da IA (meal): {e}")
        return await simulate_meal_analysis()
    except Exception as e:
        logger.error(f"Erro na OpenAI API (meal): {e}")
        return await simulate_meal_analysis()


async def generate_workout_with_ai(
    training_location: str, limitations: str, user_context: str = ""
) -> dict:
    """Geração de treino real usando OpenAI."""

    prompt = f"""Você é um personal trainer profissional criando um treino personalizado.

Informações do cliente:
- Local de treino: {training_location}
- Limitações/lesões: {limitations or 'Nenhuma informada'}
{f'- Contexto adicional: {user_context}' if user_context else ''}

Crie um plano de treino e retorne EXATAMENTE um JSON com esta estrutura (sem markdown, sem ```):
{{
  "title": "<nome do treino - ex: Treino A - Superiores>",
  "focus": "<foco principal - ex: Força e Hipertrofia>",
  "exercises": [
    {{
      "name": "<nome do exercício>",
      "sets": <número de séries>,
      "reps": "<repetições - ex: 8-12>",
      "tips": "<dica de execução em português>"
    }}
  ],
  "feedback": "<observações gerais sobre o treino, 2-3 frases em português>"
}}

Inclua 4-6 exercícios. Adapte ao local e respeite as limitações.
Se treina em casa, use exercícios com peso corporal.
As dicas devem ser práticas e em português brasileiro."""

    try:
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=800,
            temperature=0.5,
        )

        result_text = response.choices[0].message.content.strip()
        if result_text.startswith("```"):
            result_text = result_text.split("\n", 1)[1]
            result_text = result_text.rsplit("```", 1)[0]

        return json.loads(result_text)

    except json.JSONDecodeError as e:
        logger.error(f"Erro ao parsear resposta da IA (workout): {e}")
        return await simulate_workout_generation(training_location, limitations)
    except Exception as e:
        logger.error(f"Erro na OpenAI API (workout): {e}")
        return await simulate_workout_generation(training_location, limitations)


# ════════════════════════════════════════════════
# SIMULAÇÃO (Fallback quando não há chave OpenAI)
# ════════════════════════════════════════════════


async def simulate_body_analysis(age: int, height: int, weight: int) -> dict:
    """Análise corporal simulada baseada em IMC."""
    await asyncio.sleep(1.5)
    bmi = round(weight / ((height / 100) ** 2), 1)

    if bmi < 18.5:
        return {
            "estimated_fat_percentage": random.randint(10, 16),
            "estimated_biotype": "Ectomorfo",
            "suggested_goal": "Ganho de Massa Muscular (Bulking)",
            "feedback": (
                f"Seu IMC é {bmi}. Você tem um metabolismo rápido, característico "
                "de um ectomorfo. Nosso plano focará em um superávit calórico e "
                "treinos de força para ganho de massa muscular."
            ),
        }
    elif bmi < 25:
        return {
            "estimated_fat_percentage": random.randint(18, 24),
            "estimated_biotype": "Mesomorfo",
            "suggested_goal": "Recomposição Corporal",
            "feedback": (
                f"Seu IMC é {bmi}, que é considerado saudável. Você parece ter "
                "uma boa base muscular. Nosso foco será a recomposição corporal: "
                "ganhar massa magra enquanto reduzimos gordura."
            ),
        }
    elif bmi < 30:
        return {
            "estimated_fat_percentage": random.randint(25, 32),
            "estimated_biotype": "Endomorfo",
            "suggested_goal": "Emagrecimento com Preservação de Massa",
            "feedback": (
                f"Seu IMC é {bmi}, indicando sobrepeso. Nosso objetivo será um "
                "déficit calórico controlado para queimar gordura, combinado com "
                "musculação para preservar seus músculos."
            ),
        }
    else:
        return {
            "estimated_fat_percentage": random.randint(30, 40),
            "estimated_biotype": "Endomorfo",
            "suggested_goal": "Emagrecimento e Saúde Articular",
            "feedback": (
                f"Seu IMC é {bmi}, indicando obesidade. Nossa prioridade é sua "
                "saúde. Iniciaremos com déficit calórico e exercícios de baixo "
                "impacto para proteger suas articulações."
            ),
        }


async def simulate_meal_analysis() -> dict:
    """Análise nutricional simulada."""
    await asyncio.sleep(1.5)
    options = [
        {
            "total_calories": 750,
            "macros": {"protein": 40, "carbs": 80, "fat": 30},
            "feedback": "Ótima fonte de proteína! A porção de arroz está adequada. "
            "Tente um molho mais leve na próxima vez.",
            "meal_type": "Almoço - Frango Grelhado com Arroz e Salada",
        },
        {
            "total_calories": 550,
            "macros": {"protein": 35, "carbs": 60, "fat": 20},
            "feedback": "Refeição equilibrada! Boa combinação de nutrientes. "
            "Considere adicionar mais vegetais para aumentar fibras.",
            "meal_type": "Almoço - Carne Moída com Purê e Legumes",
        },
        {
            "total_calories": 400,
            "macros": {"protein": 25, "carbs": 30, "fat": 15},
            "feedback": "Excelente opção para um lanche ou refeição leve! "
            "Boa proporção de proteínas e carboidratos complexos.",
            "meal_type": "Jantar - Salmão Assado com Batata Doce",
        },
    ]
    return random.choice(options)


async def simulate_workout_generation(
    training_location: str, limitations: str
) -> dict:
    """Geração de treino simulada."""
    await asyncio.sleep(1.5)

    is_home = "casa" in training_location.lower()
    has_knee = "joelho" in (limitations or "").lower()
    has_back = any(w in (limitations or "").lower() for w in ["lombar", "costas"])

    if is_home:
        exercises = [
            {"name": "Agachamento Sumô", "sets": 3, "reps": "15-20",
             "tips": "Pés afastados, pontas para fora."},
            {"name": "Afundo", "sets": 3, "reps": "10-12 por perna",
             "tips": "Tronco reto, joelho de trás quase no chão."},
            {"name": "Elevação de Quadril", "sets": 3, "reps": "15-20",
             "tips": "Contraia o glúteo na subida."},
            {"name": "Flexão de Braço", "sets": 3, "reps": "10-15",
             "tips": "Corpo alinhado, desça até o peito quase tocar o chão."},
            {"name": "Prancha", "sets": 3, "reps": "30-60s",
             "tips": "Corpo alinhado, sem deixar o quadril cair."},
        ]
    else:
        exercises = [
            {"name": "Agachamento Livre" if not has_knee else "Leg Press 45°",
             "sets": 3, "reps": "8-12",
             "tips": "Core ativado, coluna reta." if not has_knee else "Costas apoiadas, cuidado com os joelhos."},
            {"name": "Leg Press" if not has_back else "Cadeira Extensora",
             "sets": 3, "reps": "10-15",
             "tips": "Não trave os joelhos." if not has_back else "Movimento controlado."},
            {"name": "Cadeira Extensora", "sets": 3, "reps": "12-15",
             "tips": "Controle o movimento, sem balançar."},
            {"name": "Stiff", "sets": 3, "reps": "10-12",
             "tips": "Joelhos levemente flexionados."},
            {"name": "Prancha", "sets": 3, "reps": "30-60s",
             "tips": "Corpo alinhado, sem deixar o quadril cair."},
        ]

    feedback = "Treino focado em fortalecer a parte inferior e core. "
    if has_knee:
        feedback += "Exercícios adaptados para proteger seus joelhos. "
    if has_back:
        feedback += "Exercícios adaptados para proteger sua lombar. "
    if is_home:
        feedback += "Adaptado para casa, usando peso corporal."

    return {
        "title": "Treino A - Inferiores e Core",
        "focus": "Força e Estabilidade",
        "exercises": exercises,
        "feedback": feedback.strip(),
    }


# ════════════════════════════════════════════════
# ENDPOINTS
# ════════════════════════════════════════════════


@app.get("/")
def read_root():
    """Endpoint raiz - verificar se a API está online."""
    return {
        "message": "FitScan API",
        "version": "1.0.0",
        "ai_mode": "openai" if HAS_OPENAI else "simulation",
    }


@app.get("/health")
def health_check():
    """Health check para monitoramento."""
    return {
        "status": "ok",
        "ai_available": HAS_OPENAI,
        "environment": APP_ENV,
    }


@app.post("/analyze-body/")
async def analyze_body(
    request: Request,
    age: Annotated[int, Form()],
    height: Annotated[int, Form()],
    weight: Annotated[int, Form()],
    image: UploadFile = File(...),
):
    """Recebe dados do usuário e imagem para análise corporal com IA."""
    await check_rate_limit(request)

    # Validação
    if not (10 <= age <= 120):
        raise HTTPException(status_code=422, detail="Idade deve estar entre 10 e 120 anos.")
    if not (100 <= height <= 250):
        raise HTTPException(status_code=422, detail="Altura deve estar entre 100 e 250 cm.")
    if not (30 <= weight <= 300):
        raise HTTPException(status_code=422, detail="Peso deve estar entre 30 e 300 kg.")
    if image.content_type and not image.content_type.startswith("image/"):
        raise HTTPException(status_code=422, detail="O arquivo enviado deve ser uma imagem.")

    logger.info(f"Análise corporal: Idade={age}, Altura={height}cm, Peso={weight}kg")

    if HAS_OPENAI:
        image_data = await image.read()
        result = await analyze_body_with_ai(image_data, age, height, weight)
    else:
        result = await simulate_body_analysis(age, height, weight)

    logger.info(f"Análise concluída: {result.get('estimated_biotype', 'N/A')}")
    return result


@app.post("/analyze-meal/")
async def analyze_meal(
    request: Request,
    image: UploadFile = File(...),
):
    """Recebe imagem de refeição e retorna análise nutricional com IA."""
    await check_rate_limit(request)

    if image.content_type and not image.content_type.startswith("image/"):
        raise HTTPException(status_code=422, detail="O arquivo enviado deve ser uma imagem.")

    logger.info(f"Análise de refeição: {image.filename}")

    if HAS_OPENAI:
        image_data = await image.read()
        result = await analyze_meal_with_ai(image_data)
    else:
        result = await simulate_meal_analysis()

    logger.info(f"Análise concluída: {result.get('total_calories', 'N/A')} kcal")
    return result


@app.post("/generate-workout/")
async def generate_workout(
    request: Request,
    training_location: Annotated[str, Form()],
    limitations: Annotated[str, Form()] = "",
):
    """Gera plano de treino personalizado com IA."""
    await check_rate_limit(request)

    if not training_location.strip():
        raise HTTPException(status_code=422, detail="Informe o local de treino.")

    logger.info(f"Gerando treino: Local='{training_location}', Limitações='{limitations}'")

    if HAS_OPENAI:
        result = await generate_workout_with_ai(training_location, limitations)
    else:
        result = await simulate_workout_generation(training_location, limitations)

    logger.info(f"Plano gerado: {result.get('title', 'N/A')}")
    return result

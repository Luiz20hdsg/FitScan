import asyncio
import random
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated

app = FastAPI(
    title="FitScan API",
    description="O cérebro por trás do seu Personal Trainer e Nutricionista de Bolso.",
    version="0.2.0",
)

# Habilitar CORS para permitir requisições do app mobile
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def run_body_analysis_ai(age: int, height: int, weight: int):
    """
    Função de SIMULAÇÃO de IA para o BodyInsights.
    Calcula o IMC e retorna uma análise baseada nele.
    """
    await asyncio.sleep(2)

    bmi = round(weight / ((height / 100) ** 2), 1)

    biotype = "Mesomorfo"
    goal = "Recomposição Corporal"
    fat_percentage = 22
    feedback = (
        f"Seu IMC é {bmi}, que é considerado saudável. "
        "Você parece ter uma boa base muscular. Nosso foco será a recomposição "
        "corporal: ganhar massa magra enquanto reduzimos gordura."
    )

    if bmi < 18.5:
        biotype = "Ectomorfo"
        goal = "Ganho de Massa Muscular (Bulking)"
        fat_percentage = 15
        feedback = (
            f"Seu IMC é {bmi}. Você tem um metabolismo rápido, característico de "
            "um ectomorfo. Nosso plano focará em um superávit calórico e treinos de "
            "força para ganho de massa muscular."
        )
    elif 25 <= bmi < 30:
        biotype = "Endomorfo"
        goal = "Emagrecimento com Preservação de Massa"
        fat_percentage = 28
        feedback = (
            f"Seu IMC é {bmi}, indicando sobrepeso. Você tem facilidade em ganhar "
            "peso, uma característica de endomorfos. Nosso objetivo será um déficit "
            "calórico controlado para queimar gordura, combinado com musculação para "
            "preservar seus músculos."
        )
    elif bmi >= 30:
        biotype = "Endomorfo"
        goal = "Emagrecimento e Saúde Articular"
        fat_percentage = 35
        feedback = (
            f"Seu IMC é {bmi}, indicando obesidade. Nossa prioridade máxima é sua "
            "saúde. Iniciaremos com um plano focado em déficit calórico e exercícios "
            "de baixo impacto para proteger suas articulações enquanto iniciamos o "
            "processo de emagrecimento."
        )

    return {
        "estimated_fat_percentage": fat_percentage,
        "estimated_biotype": biotype,
        "suggested_goal": goal,
        "feedback": feedback,
    }


async def run_meal_analysis_ai(image: UploadFile):
    """
    Função de SIMULAÇÃO de IA para o NutriScan.
    Retorna uma análise nutricional simulada baseada na imagem.
    """
    await asyncio.sleep(2)

    meal_options = [
        {
            "total_calories": 750,
            "macros": {"protein": 40, "carbs": 80, "fat": 30},
            "feedback": (
                "Ótima fonte de proteína! A porção de arroz está adequada, "
                "mas cuidado com o óleo na salada. Tente um molho mais leve "
                "na próxima vez."
            ),
            "meal_type": "Almoço - Frango Grelhado com Arroz e Salada",
        },
        {
            "total_calories": 1100,
            "macros": {"protein": 50, "carbs": 120, "fat": 50},
            "feedback": (
                "Refeição bem calórica! O Virado à Paulista é delicioso, "
                "mas rico em gorduras. Considere um jantar mais leve e com "
                "mais vegetais para equilibrar o dia."
            ),
            "meal_type": "Almoço - Virado à Paulista",
        },
        {
            "total_calories": 400,
            "macros": {"protein": 25, "carbs": 30, "fat": 15},
            "feedback": (
                "Excelente opção para um lanche ou refeição leve! Boa "
                "proporção de proteínas e carboidratos complexos. Continue assim!"
            ),
            "meal_type": "Jantar - Salmão Assado com Batata Doce",
        },
        {
            "total_calories": 550,
            "macros": {"protein": 35, "carbs": 60, "fat": 20},
            "feedback": (
                "Refeição equilibrada! Boa combinação de nutrientes. "
                "Considere adicionar mais vegetais para aumentar a saciedade "
                "e a ingestão de fibras."
            ),
            "meal_type": "Almoço - Carne Moída com Purê e Legumes",
        },
    ]

    return random.choice(meal_options)


async def run_workout_generation_ai(training_location: str, limitations: str):
    """
    Função de SIMULAÇÃO de IA para o CoachGen.
    Gera um plano de treino simulado baseado nas preferências.
    """
    await asyncio.sleep(2)

    workout_plan = {
        "title": "Treino A - Inferiores e Core",
        "focus": "Força e Estabilidade",
        "exercises": [
            {
                "name": "Agachamento Livre",
                "sets": 3,
                "reps": "8-12",
                "tips": "Mantenha o core ativado e a coluna reta.",
            },
            {
                "name": "Leg Press",
                "sets": 3,
                "reps": "10-15",
                "tips": "Não trave os joelhos na extensão máxima.",
            },
            {
                "name": "Cadeira Extensora",
                "sets": 3,
                "reps": "12-15",
                "tips": "Controle o movimento, sem balançar.",
            },
            {
                "name": "Prancha",
                "sets": 3,
                "duration": "30-60s",
                "tips": "Mantenha o corpo alinhado, sem deixar o quadril cair.",
            },
        ],
        "feedback": (
            "Este treino foca em fortalecer a parte inferior do corpo e o core, "
            "essencial para a postura e prevenção de lesões. Adaptações foram "
            "feitas com base nas suas informações."
        ),
    }

    limitations_lower = limitations.lower() if limitations else ""

    if "joelho" in limitations_lower:
        workout_plan["exercises"][0]["name"] = "Agachamento no Smith"
        workout_plan["exercises"][0]["tips"] += (
            " Use o Smith para maior estabilidade e controle da carga nos joelhos."
        )
        workout_plan["feedback"] += " Exercícios adaptados para proteger seus joelhos."

    if "lombar" in limitations_lower or "costas" in limitations_lower:
        workout_plan["exercises"][0]["name"] = "Leg Press 45°"
        workout_plan["exercises"][0]["tips"] = (
            "O Leg Press reduz a carga na lombar. Mantenha as costas apoiadas no encosto."
        )
        workout_plan["feedback"] += " Exercícios adaptados para proteger sua lombar."

    if "casa" in training_location.lower():
        workout_plan["exercises"] = [
            {
                "name": "Agachamento Sumô (peso corporal)",
                "sets": 3,
                "reps": "15-20",
                "tips": "Mantenha os pés afastados e pontas para fora.",
            },
            {
                "name": "Afundo",
                "sets": 3,
                "reps": "10-12 por perna",
                "tips": "Mantenha o tronco reto e o joelho de trás quase tocando o chão.",
            },
            {
                "name": "Elevação de Quadril (Glute Bridge)",
                "sets": 3,
                "reps": "15-20",
                "tips": "Contraia bem o glúteo na subida.",
            },
            {
                "name": "Prancha",
                "sets": 3,
                "duration": "30-60s",
                "tips": "Mantenha o corpo alinhado, sem deixar o quadril cair.",
            },
        ]
        workout_plan["feedback"] += (
            " O treino foi adaptado para ser realizado em casa, "
            "utilizando apenas o peso corporal."
        )

    return workout_plan


@app.get("/")
def read_root():
    """Endpoint raiz para verificar se a API está online."""
    return {"message": "Bem-vindo à API do FitScan", "version": "0.2.0"}


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


@app.post("/analyze-body/")
async def analyze_body(
    age: Annotated[int, Form()],
    height: Annotated[int, Form()],
    weight: Annotated[int, Form()],
    image: UploadFile = File(...),
):
    """
    Recebe os dados do usuário e a imagem para análise corporal.
    """
    # Validação de input
    if age < 10 or age > 120:
        raise HTTPException(status_code=422, detail="Idade deve estar entre 10 e 120 anos.")
    if height < 100 or height > 250:
        raise HTTPException(status_code=422, detail="Altura deve estar entre 100 e 250 cm.")
    if weight < 30 or weight > 300:
        raise HTTPException(status_code=422, detail="Peso deve estar entre 30 e 300 kg.")

    # Validar que o arquivo é uma imagem
    if image.content_type and not image.content_type.startswith("image/"):
        raise HTTPException(status_code=422, detail="O arquivo enviado deve ser uma imagem.")

    print(f"Análise corporal: Idade {age}, Altura {height}cm, Peso {weight}kg")

    analysis_result = await run_body_analysis_ai(age, height, weight)

    print(f"Análise concluída. Biotipo: {analysis_result['estimated_biotype']}")
    return analysis_result


@app.post("/analyze-meal/")
async def analyze_meal(
    image: UploadFile = File(...),
):
    """
    Recebe a imagem de uma refeição e retorna a análise nutricional (simulada).
    """
    # Validar que o arquivo é uma imagem
    if image.content_type and not image.content_type.startswith("image/"):
        raise HTTPException(status_code=422, detail="O arquivo enviado deve ser uma imagem.")

    print(f"Análise de refeição: {image.filename}")

    meal_analysis_result = await run_meal_analysis_ai(image)

    print(f"Análise concluída. Calorias: {meal_analysis_result['total_calories']}")
    return meal_analysis_result


@app.post("/generate-workout/")
async def generate_workout(
    training_location: Annotated[str, Form()],
    limitations: Annotated[str, Form()] = "",
):
    """
    Recebe as preferências de treino e retorna um plano de treino (simulado).
    """
    if not training_location.strip():
        raise HTTPException(status_code=422, detail="Informe o local de treino.")

    print(f"Gerando treino: Local '{training_location}', Limitações '{limitations}'")

    workout_plan = await run_workout_generation_ai(training_location, limitations)

    print(f"Plano gerado: {workout_plan['title']}")
    return workout_plan

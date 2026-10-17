/**
 * SERVICIO DEL ASISTENTE TÁCTICO "MAYA"
 * Inspirado en la ingeniería inversa de Desafío 21 (Gemini 2.5 Flash Lite) y
 * sincronizado con el estado real de entrenamiento y nutrición de fitness-evolution.
 */

export interface MayaUserContext {
  userName: string;
  weightKg: number;
  heightCm: number;
  goalType: string;
  dailyKcalTarget: number;
  dailyProteinTarget: number;
  consumedKcalToday: number;
  consumedProteinToday: number;
  currentRoutineTitle: string;
  waterGlassesToday: number;
  sleepHoursToday?: number;
}

export interface MayaMessage {
  id: string;
  sender: 'user' | 'maya';
  text: string;
  timestamp: number;
}

const MAYA_SYSTEM_PROMPT = `Eres MAYA, la copiloto y entrenadora táctica militar de élite en "Fitness Evolution".
Tu especialidad abarca:
1. Calistenia militar y progresiones corporales (fuerza, resistencia, dominadas, flexiones, planchas).
2. Entrenamiento con pesos y equipamiento (mancuernas, TRX, barras, bandas, kettlebells).
3. Nutrición cuantitativa exacta (macronutrientes, déficit para definición, superávit para masa muscular, alimentos latinoamericanos/peruanos).
4. Prevención de lesiones y sustitución biomecánica de ejercicios (alternativas seguras cuando hay molestias articulares).

Tono y personalidad:
- Disciplinada, directa, motivadora, analítica y orientada a resultados concretos.
- No das rodeos innecesarios. Hablas con precisión táctica.
- Si el usuario te pregunta qué comer para completar sus macros, dale cantidades exactas de alimentos de su contexto.
- Si le duele una articulación en un ejercicio, dale inmediatamente una variante biomecánica de menor estrés.`;

export async function askMaya(
  userPrompt: string,
  context: MayaUserContext,
  history: MayaMessage[] = [],
  apiKey?: string
): Promise<string> {
  const effectiveKey = apiKey || (typeof process !== 'undefined' ? process.env?.VITE_GEMINI_API_KEY : '') || '';

  const recentHistoryText = history.slice(-4).map((m) => `${m.sender === 'user' ? 'Usuario' : 'Maya'}: ${m.text}`).join('\n');
  const historyBlock = recentHistoryText ? `\n[HISTORIAL RECIENTE]:\n${recentHistoryText}\n` : '';

  // Preparar el bloque de telemetría del usuario
  const telemetry = `
[TELEMETRÍA EN TIEMPO REAL DEL USUARIO]:
- Operador: ${context.userName}
- Peso: ${context.weightKg} kg | Estatura: ${context.heightCm} cm
- Objetivo táctico: ${context.goalType}
- Presupuesto calórico: ${context.dailyKcalTarget} kcal (Consumidas hoy: ${context.consumedKcalToday} kcal)
- Objetivo de proteína: ${context.dailyProteinTarget} g (Consumida hoy: ${context.consumedProteinToday} g)
- Protocolo de entrenamiento activo: ${context.currentRoutineTitle}
- Hidratación hoy: ${context.waterGlassesToday} vasos de agua (${context.waterGlassesToday * 250} ml)
${context.sleepHoursToday ? `- Registro de sueño: ${context.sleepHoursToday} horas` : ''}
`;

  if (effectiveKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${effectiveKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: `${MAYA_SYSTEM_PROMPT}\n\n${telemetry}${historyBlock}\nConsulta del usuario: ${userPrompt}` }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.6,
              maxOutputTokens: 600
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) return reply.trim();
      }
    } catch (err) {
      console.warn('Error llamando a Gemini API, activando motor táctico heurístico:', err);
    }
  }

  // MOTOR HEURÍSTICO TÁCTICO INTEGRADO (Funciona 100% offline y sin API key)
  const query = userPrompt.toLowerCase();

  // 1. Consultas sobre proteína restante o qué comer
  if (query.includes('proteina') || query.includes('comer') || query.includes('alimento') || query.includes('hambre') || query.includes('cena')) {
    const remainingP = Math.max(0, Math.round(context.dailyProteinTarget - context.consumedProteinToday));
    const remainingKcal = Math.max(0, Math.round(context.dailyKcalTarget - context.consumedKcalToday));

    if (remainingP > 10) {
      return `Operador ${context.userName}, reporte de suministros:\n` +
        `Te faltan exactamente **${remainingP}g de proteína** y dispones de **${remainingKcal} kcal** en tu cuota de hoy.\n\n` +
        `Recomendaciones tácticas inmediatas con alta biodisponibilidad:\n` +
        `1. **150g de pechuga de pollo a la plancha**: aporta ~46g de proteína y solo 240 kcal.\n` +
        `2. **1 lata de atún en agua (escurrido 120g)**: aporta ~31g de proteína y 140 kcal.\n` +
        `3. **3 claras de huevo + 1 huevo entero**: aporta ~20g de proteína y ~150 kcal.\n` +
        `4. **150g de quesillo fresco o yogur griego natural**: ~15g de proteína.\n\n` +
        `Elige una de estas opciones para asegurar la síntesis proteica sin exceder tus calorías.`;
    } else {
      return `¡Objetivo proteico alcanzado, ${context.userName}! Has completado tus requerimientos de aminoácidos con **${context.consumedProteinToday}g**. Si aún tienes hambre, prioriza ensaladas verdes con limón o una infusión caliente sin azúcar.`;
    }
  }

  // 2. Dolores articulares o sustitución de ejercicios
  if (query.includes('muñeca') || query.includes('hombro') || query.includes('rodilla') || query.includes('dolor') || query.includes('molestia')) {
    if (query.includes('muñeca')) {
      return `Atención táctica, ${context.userName}: si sientes sobrecarga en las muñecas durante las flexiones o planchas:\n` +
        `- **Opción A:** Realiza las flexiones apoyando sobre los nudillos o usando barras paralelas/agarraderas (mantiene la articulación en posición neutra a 180°).\n` +
        `- **Opción B:** Sustituye temporalmente por fondos en paralelas o flexiones sobre banca inclinada para reducir la palanca articular.`;
    }
    if (query.includes('hombro')) {
      return `Protocolo de protección de hombro activado:\n` +
        `- En flexiones: mantén los codos a un ángulo de 45° respecto al torso (forma de flecha, jamás en T a 90°).\n` +
        `- En dominadas: utiliza agarre neutro o supino (chin-up) para descomprimir el espacio subacromial.`;
    }
    if (query.includes('rodilla')) {
      return `Ajuste biomecánico para rodilla:\n` +
        `- En sentadillas: abre ligeramente la punta de los pies (15-30°) y enfócate en empujar la cadera hacia atrás (bisagra de cadera) sin dejar que las rodillas colapsen hacia adentro.\n` +
        `- Alternativa de bajo impacto: puente de glúteos en suelo o sentadilla goblet isométrica a 90°.`;
    }
    return `Regla militar primordial: entrena con dureza pero con inteligencia. Si hay dolor punzante en una articulación, detén la serie. Indica qué ejercicio específico estabas ejecutando para darte la variante biomecánica equivalente.`;
  }

  // 3. Motivación / Estado de la rutina de 21 días
  if (query.includes('rutina') || query.includes('entreno') || query.includes('dia') || query.includes('desafio') || query.includes('empezar')) {
    return `Protocolo activo: **${context.currentRoutineTitle}**.\n\n` +
      `La disciplina no negocia con la pereza. Tu cuerpo se adapta a la tensión que le exiges. Si la sesión parece difícil, reduce el ritmo pero completa cada repetición con rango de movimiento estricto.\n\n` +
      `¿Deseas iniciar el temporizador de la sesión ahora o revisar los ejercicios asignados?`;
  }

  // 4. Agua e hidratación
  if (query.includes('agua') || query.includes('hidratacion') || query.includes('sed')) {
    const mlToday = context.waterGlassesToday * 250;
    const targetMl = Math.round(context.weightKg * 35);
    return `Estado de hidratación: Llevas **${mlToday} ml** (${context.waterGlassesToday} vasos) de una meta estimada de **${targetMl} ml**.\n` +
      `Una deshidratación de apenas 2% reduce tu fuerza muscular en más de un 10%. Bebe un vaso de agua ahora para mantener la conductividad celular y la recuperación metabólica.`;
  }

  // Respuesta táctica general
  return `Aquí Maya, ${context.userName}. Recibido el reporte. Estamos monitoreando tu protocolo **${context.currentRoutineTitle}** y tu meta de **${context.dailyKcalTarget} kcal**.\n\n` +
    `Estoy lista para asistirte en técnica de ejercicios, ajustes de carga, opciones de comida o manejo de descansos. ¿Cuál es tu consulta operativa?`;
}

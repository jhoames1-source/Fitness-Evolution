/**
 * ENCICLOPEDIA DE SUPLEMENTACIÓN DEPORTIVA (A-Z)
 * Extraída y reconstruida a partir de la ingeniería inversa de Gym Fitness Workout (com.jleoapps.gymtotal).
 * Provee evidencia científica, dosificación clínica, momento de toma y objetivos recomendados.
 */

export interface Supplement {
  id: string;
  name: string;
  category: 'fuerza_masa' | 'recuperacion' | 'resistencia' | 'salud_bienestar' | 'quemadores';
  evidenceLevel: 'A (Evidencia Sólida)' | 'B (Evidencia Moderada)' | 'C (Evidencia Preliminar)';
  dosage: string;
  timing: string;
  benefits: string[];
  scientificSummary: string;
  precautions?: string;
}

export const SUPPLEMENTS: Supplement[] = [
  {
    id: 'creatina_monohidrato',
    name: 'Creatina Monohidratada (Creapure®)',
    category: 'fuerza_masa',
    evidenceLevel: 'A (Evidencia Sólida)',
    dosage: '3 a 5 g diarios (o 0.05 g por kg de peso corporal). Fase de carga de 20g opcional pero no obligatoria.',
    timing: 'En cualquier momento del día de forma constante, preferentemente post-entreno con carbohidratos o proteínas.',
    benefits: [
      'Aumento de fuerza explosiva y potencia en fosfágenos (ATP-PC)',
      'Mayor volumen celular e hidratación intramuscular',
      'Acelera la recuperación entre series de alta intensidad',
      'Efectos neuroprotectores y cognitivos comprobados'
    ],
    scientificSummary: 'Es el suplemento con mayor respaldo ergogénico del mundo (ISSN). Resintetiza fosfocreatina en el músculo, permitiendo 1-2 repeticiones extra en series de fallo muscular.',
  },
  {
    id: 'proteina_whey_isolate',
    name: 'Proteína de Suero Aislada (Whey Isolate 90%)',
    category: 'fuerza_masa',
    evidenceLevel: 'A (Evidencia Sólida)',
    dosage: '25 a 35 g por toma (~20-28 g de proteína neta).',
    timing: 'Post-entrenamiento o entre comidas para alcanzar el requerimiento diario de 1.6-2.2 g/kg.',
    benefits: [
      'Rápida absorción y biodisponibilidad de aminoácidos esenciales',
      'Alto contenido de Leucina (>2.7g) para activar la vía mTOR',
      'Mínimo aporte de grasas, lactosa y carbohidratos (<1g)'
    ],
    scientificSummary: 'Proteína de digestión ultrarrápida obtenida por microfiltración de flujo cruzado (CFM). Estimula al máximo la síntesis proteica miofibrilar (MPS).',
  },
  {
    id: 'bcaa_aminoacidos',
    name: 'Aminoácidos Ramificados (BCAA 2:1:1)',
    category: 'recuperacion',
    evidenceLevel: 'B (Evidencia Moderada)',
    dosage: '5 a 10 g antes o durante el entrenamiento.',
    timing: 'Intra-entrenamiento o en ayunas.',
    benefits: [
      'Reduce la degradación proteica en entrenamientos en ayunas prolongados',
      'Disminuye la fatiga central compitiendo con el triptófano en la barrera hematoencefálica',
      'Atenúa el dolor muscular tardío (DOMS)'
    ],
    scientificSummary: 'Formulación de Leucina, Isoleucina y Valina en proporción 2:1:1. Si ya se consume suficiente proteína completa en la dieta diaria, su impacto es complementario.',
  },
  {
    id: 'citrulina_malato',
    name: 'L-Citrulina Malato (2:1)',
    category: 'resistencia',
    evidenceLevel: 'A (Evidencia Sólida)',
    dosage: '6 a 8 g.',
    timing: '30 a 45 minutos antes del entrenamiento.',
    benefits: [
      'Incrementa los niveles plasmáticos de L-Arginina y Óxido Nítrico (NO)',
      'Aumenta el flujo sanguíneo y la congestión muscular (pump)',
      'Facilita la eliminación de amoníaco y lactato durante series intensas',
      'Mejora el volumen total de repeticiones en press y sentadillas'
    ],
    scientificSummary: 'Precursor superior de óxido nítrico frente a la arginina oral directa, ya que no sufre degradación hepática por la enzima arginasa.',
  },
  {
    id: 'beta_alanina',
    name: 'Beta-Alanina',
    category: 'resistencia',
    evidenceLevel: 'A (Evidencia Sólida)',
    dosage: '3.2 a 6.4 g diarios (repartidos en 2 tomas para evitar parestesia).',
    timing: 'Diario, independientemente de la hora de entreno (efecto acumulativo).',
    benefits: [
      'Aumenta la concentración de carnosina intramuscular en más de un 60%',
      'Actúa como amortiguador (buffer) del pH contra la acidosis láctica',
      'Especialmente eficaz en esfuerzos de alta intensidad de 60 a 240 segundos (Calistenia, HIIT, EMOM)'
    ],
    scientificSummary: 'Limita la sensación de ardor o quemazón muscular en series largas de calistenia y superseries, retrasando el fallo por fatiga periférica.',
    precautions: 'Puede causar parestesia inofensiva (hormigueo leve en rostro y manos) transitoria.'
  },
  {
    id: 'cafeina_anhidra',
    name: 'Cafeína Anhidra / Pre-Workout',
    category: 'resistencia',
    evidenceLevel: 'A (Evidencia Sólida)',
    dosage: '3 a 6 mg por kg de peso corporal (aprox. 150 a 300 mg).',
    timing: '45 a 60 minutos antes de la sesión de entrenamiento.',
    benefits: [
      'Bloquea los receptores de adenosina en el sistema nervioso central',
      'Incrementa el estado de alerta, foco y reclutamiento de unidades motoras',
      'Reduce la percepción subjetiva del esfuerzo (RPE)'
    ],
    scientificSummary: 'Antagonista competitivo de adenosina. Potencia la fuerza isométrica y la resistencia anaeróbica. Se recomienda ciclar su uso para evitar tolerancia.',
    precautions: 'Evitar su toma en las 6 horas previas al descanso nocturno.'
  },
  {
    id: 'glutamina',
    name: 'L-Glutamina',
    category: 'recuperacion',
    evidenceLevel: 'B (Evidencia Moderada)',
    dosage: '5 a 10 g post-entreno o antes de dormir.',
    timing: 'Post-entrenamiento o por la noche.',
    benefits: [
      'Mantiene la integridad de la mucosa y la barrera intestinal',
      'Apoya la función del sistema inmunológico en deportistas con alto volumen',
      'Favorece la resíntesis de glucógeno en combinación con carbohidratos'
    ],
    scientificSummary: 'Es el aminoácido más abundante en el organismo. Aunque el músculo puede sintetizarlo, en periodos de sobreentrenamiento o déficit severo es condicionalmente esencial.',
  },
  {
    id: 'omega_3_fish_oil',
    name: 'Omega 3 EPA / DHA (Aceite de Pescado)',
    category: 'salud_bienestar',
    evidenceLevel: 'A (Evidencia Sólida)',
    dosage: '2 a 3 g totales diarios (asegurando al menos 1000 mg de EPA y 500 mg de DHA).',
    timing: 'Junto con una comida principal que contenga grasas para optimizar su absorción.',
    benefits: [
      'Poderosa acción antiinflamatoria en tendones y articulaciones',
      'Sensibiliza los receptores a la insulina en el tejido muscular',
      'Favorece la salud cardiovascular y el perfil lipídico (reduce triglicéridos)'
    ],
    scientificSummary: 'Ácidos grasos poliinsaturados esenciales que modulan la respuesta a eicosanoides inflamatorios derivados del esfuerzo muscular repetido.',
  },
  {
    id: 'magnesio_bisglicinato',
    name: 'Bisglicinato de Magnesio / ZMA',
    category: 'salud_bienestar',
    evidenceLevel: 'A (Evidencia Sólida)',
    dosage: '200 a 400 mg de magnesio elemental.',
    timing: '30 a 60 minutos antes de acostarse.',
    benefits: [
      'Optimiza la fase de sueño profundo de ondas lentas (fase delta)',
      'Relajación muscular y prevención de calambres nocturnos',
      'Cofactor en más de 300 reacciones enzimáticas, incluyendo síntesis de ATP'
    ],
    scientificSummary: 'Quelado con glicina para máxima biodisponibilidad y cero efectos laxantes. Esencial para la recuperación del sistema nervioso simpático tras entrenar.',
  },
  {
    id: 'caseina_micelar',
    name: 'Caseína Micelar Nocturna',
    category: 'fuerza_masa',
    evidenceLevel: 'A (Evidencia Sólida)',
    dosage: '30 a 40 g.',
    timing: '30 minutos antes de dormir o en periodos de ayuno prolongado.',
    benefits: [
      'Digestión lenta sostenida de hasta 7-8 horas',
      'Aporte continuo de aminoácidos durante el ayuno nocturno',
      'Elevada textura saciante para fases de definición'
    ],
    scientificSummary: 'Forma micelas en el estómago que coagulan en presencia del ácido clorhídrico, liberando dipéptidos y aminoácidos de forma ultra gradual.',
  }
];

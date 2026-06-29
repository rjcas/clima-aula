// ─── Catálogos ────────────────────────────────────────────────────────────────

export const COURSES = [
  { id: '1', label: '1er año', year: 1, division: '' },
  { id: '2', label: '2do año', year: 2, division: '' },
  { id: '3', label: '3er año', year: 3, division: '' },
  { id: '4', label: '4to año', year: 4, division: '' },
  { id: '5', label: '5to año', year: 5, division: '' },
  { id: '6', label: '6to año', year: 6, division: '' },
]

export const SUBJECTS = [
  'Matemática', 'Lengua y Literatura', 'Historia', 'Geografía',
  'Biología', 'Física', 'Química', 'Inglés',
  'Educación Física', 'Arte', 'Música', 'Informática',
]

export const TEACHERS = [
  { id: 'T01', name: 'Prof. García',    pin: '1111', role: 'docente'    },
  { id: 'T02', name: 'Prof. Rodríguez', pin: '2222', role: 'docente'    },
  { id: 'T03', name: 'Prof. Martínez',  pin: '3333', role: 'docente'    },
  { id: 'T04', name: 'Prof. López',     pin: '4444', role: 'preceptor'  },
]

// ─── Dimensiones de evaluación ────────────────────────────────────────────────

export const DIMENSIONS = [
  {
    id: 'clima',
    label: 'Clima y dinámica',
    icon: '🌤️',
    description: 'Respeto de consignas, nivel de conversación, ausencia de interrupciones',
    scale: ['Muy deficiente', 'Deficiente', 'Adecuado', 'Muy bueno', 'Excelente'],
    roles: ['docente'],
  },
  {
    id: 'espacio',
    label: 'Cuidado del espacio',
    icon: '🏫',
    description: 'Bancos ordenados, sin residuos, respeto del mobiliario y paredes',
    scale: ['Muy descuidado', 'Descuidado', 'Aceptable', 'Muy cuidado', 'Excelente cuidado'],
    roles: ['docente'],
  },
  {
    id: 'participacion',
    label: 'Participación',
    icon: '✋',
    description: 'Atención, realización de actividades, aprovechamiento del tiempo',
    scale: ['Muy bajo', 'Bajo', 'Adecuado', 'Alto', 'Sobresaliente'],
    roles: ['docente'],
  },
  {
    id: 'convivencia',
    label: 'Convivencia y vínculos',
    icon: '🤝',
    description: 'Inclusión, buen trato, ausencia de burlas o exclusión',
    scale: ['Muy problemática', 'Problemática', 'Aceptable', 'Buena', 'Excelente'],
    roles: ['preceptor'],
  },
]

// Devuelve las dimensiones que le corresponden a un rol
export const getDimensionsForRole = (role) =>
  DIMENSIONS.filter(d => d.roles.includes(role))

export const SEED_EVALUATIONS = []

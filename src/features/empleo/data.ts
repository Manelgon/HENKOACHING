export type EstadoSolicitud = 'nuevo' | 'revisando' | 'entrevista' | 'descartado' | 'contratado'

export type Oferta = {
  id: number
  titulo: string
  empresa: string
  ubicacion: string
  modalidad: 'Presencial' | 'Híbrido' | 'Remoto'
  jornada: 'Completa' | 'Parcial'
  sector: string
  salario: string
  fecha: string
  activa: boolean
  desc: string
  requisitos: string[]
  ofrecemos: string[]
}

export type Solicitud = {
  id: number
  candidato: string
  ofertaId: number
  estado: EstadoSolicitud
  fecha: string
  cv: string
}

export const OFERTAS: Oferta[] = [
  {
    id: 1, titulo: 'Responsable de Operaciones', empresa: 'Grupo Mediterráneo', ubicacion: 'Palma, Mallorca',
    modalidad: 'Presencial', jornada: 'Completa', sector: 'Operaciones', salario: '32.000 – 38.000 €/año',
    fecha: '20 abr 2026', activa: true,
    desc: 'Buscamos un/a Responsable de Operaciones para liderar la gestión diaria de nuestra empresa en plena fase de crecimiento. La persona seleccionada trabajará directamente con la dirección para estructurar procesos, mejorar la eficiencia operativa y coordinar equipos multidisciplinares.',
    requisitos: ['Experiencia mínima de 3 años en roles similares', 'Capacidad de liderazgo y gestión de equipos', 'Orientación a resultados y metodología de trabajo estructurada', 'Conocimientos de herramientas de gestión de proyectos', 'Español nativo, inglés valorable'],
    ofrecemos: ['Incorporación a empresa en crecimiento', 'Salario competitivo según valía', 'Horario flexible', 'Formación continua a cargo de la empresa'],
  },
  {
    id: 2, titulo: 'Técnico/a de Selección de Personal', empresa: 'TechMallorca SL', ubicacion: 'Palma, Mallorca',
    modalidad: 'Híbrido', jornada: 'Completa', sector: 'Recursos Humanos', salario: '26.000 – 30.000 €/año',
    fecha: '18 abr 2026', activa: true,
    desc: 'Incorporamos a nuestro equipo un/a Técnico/a de Selección con experiencia en procesos de selección end-to-end, especialmente en perfiles técnicos y digitales.',
    requisitos: ['Grado en RRHH, Psicología o similar', 'Mínimo 2 años en selección', 'Manejo de ATS y LinkedIn Recruiter', 'Excelentes habilidades comunicativas'],
    ofrecemos: ['2 días de teletrabajo', 'Ticket restaurante', 'Plan de carrera estructurado'],
  },
  {
    id: 3, titulo: 'Director/a de Desarrollo de Negocio', empresa: 'Inmobiliaria Ruiz', ubicacion: 'Mallorca',
    modalidad: 'Presencial', jornada: 'Completa', sector: 'Comercial', salario: '45.000 – 55.000 €/año',
    fecha: '15 abr 2026', activa: true,
    desc: 'Buscamos un perfil directivo con visión estratégica para liderar el área de desarrollo de negocio en una empresa inmobiliaria consolidada en Mallorca.',
    requisitos: ['10+ años de experiencia en roles directivos', 'Experiencia en sector inmobiliario o similar', 'Red de contactos en Mallorca valorable', 'Inglés nivel alto'],
    ofrecemos: ['Vehículo de empresa', 'Variable por objetivos', 'Posición de alto impacto'],
  },
  {
    id: 4, titulo: 'HR Business Partner', empresa: 'Restaurantes Ona', ubicacion: 'Mallorca',
    modalidad: 'Híbrido', jornada: 'Completa', sector: 'Recursos Humanos', salario: '30.000 – 36.000 €/año',
    fecha: '10 abr 2026', activa: true,
    desc: 'Posición clave para acompañar el crecimiento de nuestra cadena de restaurantes desde la función de RRHH, siendo el nexo entre dirección y equipos operativos.',
    requisitos: ['Experiencia como HRBP o similar', 'Conocimiento de sector hostelería valorable', 'Alta capacidad de influencia', 'Catalán valorable'],
    ofrecemos: ['Integración en proyecto gastronómico de referencia', 'Comidas incluidas', 'Flexibilidad horaria'],
  },
  {
    id: 5, titulo: 'Coordinador/a de Equipos', empresa: 'Ferrer e Hijos', ubicacion: 'Inca, Mallorca',
    modalidad: 'Presencial', jornada: 'Completa', sector: 'Operaciones', salario: '28.000 – 32.000 €/año',
    fecha: '5 abr 2026', activa: false,
    desc: 'Empresa familiar en proceso de modernización busca Coordinador/a para gestionar equipos de producción y mejorar los procesos internos.',
    requisitos: ['Experiencia en coordinación de equipos', 'Perfil resolutivo y metódico', 'Disponibilidad para trabajar en Inca'],
    ofrecemos: ['Empresa sólida y estable', 'Posibilidad de crecimiento'],
  },
]

export const SOLICITUDES_MOCK: Solicitud[] = [
  { id: 1, candidato: 'María García',   ofertaId: 1, estado: 'revisando', fecha: '21 abr', cv: 'cv_maria.pdf' },
  { id: 2, candidato: 'Carlos Ruiz',    ofertaId: 1, estado: 'entrevista', fecha: '20 abr', cv: 'cv_carlos.pdf' },
  { id: 3, candidato: 'Laura Martínez', ofertaId: 2, estado: 'nuevo',      fecha: '19 abr', cv: 'cv_laura.pdf' },
  { id: 4, candidato: 'Tomás Ferrer',   ofertaId: 3, estado: 'descartado', fecha: '16 abr', cv: 'cv_tomas.pdf' },
  { id: 5, candidato: 'Ana Bibiloni',   ofertaId: 1, estado: 'nuevo',      fecha: '22 abr', cv: 'cv_ana.pdf' },
]

export const MIS_SOLICITUDES: { ofertaId: number; estado: EstadoSolicitud; fecha: string }[] = [
  { ofertaId: 1, estado: 'entrevista', fecha: '20 abr' },
  { ofertaId: 2, estado: 'nuevo',      fecha: '18 abr' },
]

export type EstadoMeta = { label: string; badge: string }

export const ESTADO_SOL: Record<EstadoSolicitud, EstadoMeta> = {
  nuevo:      { label: 'Nueva',       badge: 'bg-henko-greenblue text-henko-turquoise' },
  revisando:  { label: 'Revisando',   badge: 'bg-henko-yellow text-yellow-900' },
  entrevista: { label: 'Entrevista',  badge: 'bg-henko-purple text-white' },
  descartado: { label: 'Descartado',  badge: 'bg-black/5 text-gray-500' },
  contratado: { label: 'Contratado',  badge: 'bg-henko-turquoise text-white' },
}

export const SECTORES = ['Todos', 'Operaciones', 'Recursos Humanos', 'Comercial'] as const
export const MODALIDADES = ['Todas', 'Presencial', 'Híbrido', 'Remoto'] as const

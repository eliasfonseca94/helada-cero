/**
 * Entidades del negocio: la parcela agrícola que se quiere proteger de heladas.
 * Pilar 1 del Hito 2: interfaces puras + enumeraciones estrictas, cero `any`.
 */

/** Tipo de cultivo. Enum estricto: no se aceptan cadenas libres. */
export enum TipoCultivo {
  HORTALIZA = "HORTALIZA",
  FRUTAL = "FRUTAL",
  PRADERA = "PRADERA",
  CEREAL = "CEREAL",
}

/** Localidades soportadas en la Araucanía. El enum controla el selector del formulario. */
export enum Localidad {
  FREIRE = "FREIRE",
  TEMUCO = "TEMUCO",
  LAUTARO = "LAUTARO",
  VILLARRICA = "VILLARRICA",
}

/** Coordenada geográfica WGS84. */
export interface Coordenada {
  latitud: number;
  longitud: number;
}

/** Parcela monitoreada por el usuario. */
export interface Parcela {
  id: string;
  nombre: string;
  cultivo: TipoCultivo;
  localidad: Localidad;
  coordenada: Coordenada;
  /** Temperatura mínima (°C) bajo la cual el cultivo sufre daño. */
  umbralCritico: number;
}

/** Catálogo de coordenadas por localidad. Readonly: nadie lo muta en tiempo de ejecución. */
export const COORDENADAS: Readonly<Record<Localidad, Coordenada>> = {
  [Localidad.FREIRE]: { latitud: -38.954, longitud: -72.627 },
  [Localidad.TEMUCO]: { latitud: -38.739, longitud: -72.598 },
  [Localidad.LAUTARO]: { latitud: -38.532, longitud: -72.44 },
  [Localidad.VILLARRICA]: { latitud: -39.281, longitud: -72.227 },
};

/** Etiquetas legibles para la interfaz, derivadas del enum. */
export const NOMBRE_LOCALIDAD: Readonly<Record<Localidad, string>> = {
  [Localidad.FREIRE]: "Freire",
  [Localidad.TEMUCO]: "Temuco",
  [Localidad.LAUTARO]: "Lautaro",
  [Localidad.VILLARRICA]: "Villarrica",
};

export const NOMBRE_CULTIVO: Readonly<Record<TipoCultivo, string>> = {
  [TipoCultivo.HORTALIZA]: "Hortaliza",
  [TipoCultivo.FRUTAL]: "Frutal",
  [TipoCultivo.PRADERA]: "Pradera",
  [TipoCultivo.CEREAL]: "Cereal",
};

/**
 * Guardia de tipo: convierte una cadena del DOM en un miembro del enum.
 * Devuelve null si el valor no pertenece al enum, en vez de confiar en un `as`.
 */
export function aLocalidad(valor: string): Localidad | null {
  return Object.values(Localidad).includes(valor as Localidad)
    ? (valor as Localidad)
    : null;
}

export function aTipoCultivo(valor: string): TipoCultivo | null {
  return Object.values(TipoCultivo).includes(valor as TipoCultivo)
    ? (valor as TipoCultivo)
    : null;
}

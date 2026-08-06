/**
 * Contrato de datos del servicio externo (Open-Meteo) y modelo de dominio propio.
 * La respuesta cruda de la API nunca circula por la aplicación: se mapea a
 * `DiaPronostico` antes de tocar el DOM.
 */

/** Nivel de riesgo de helada. Controla color, texto y orden de prioridad en la UI. */
export enum NivelRiesgo {
  SEGURO = "SEGURO",
  VIGILANCIA = "VIGILANCIA",
  RIESGO = "RIESGO",
  HELADA = "HELADA",
}

/** Etiquetas de interfaz para cada nivel. */
export const ETIQUETA_RIESGO: Readonly<Record<NivelRiesgo, string>> = {
  [NivelRiesgo.SEGURO]: "Sin riesgo",
  [NivelRiesgo.VIGILANCIA]: "Vigilancia",
  [NivelRiesgo.RIESGO]: "Riesgo",
  [NivelRiesgo.HELADA]: "Helada",
};

/** Bloque diario tal como lo entrega Open-Meteo: arreglos paralelos indexados por día. */
export interface BloqueDiarioApi {
  time: string[];
  temperature_2m_min: number[];
  temperature_2m_max: number[];
}

/** Respuesta completa del endpoint /v1/forecast. */
export interface RespuestaClimaApi {
  latitude: number;
  longitude: number;
  timezone: string;
  daily: BloqueDiarioApi;
}

/** Respuesta de error de Open-Meteo (HTTP 400). */
export interface ErrorClimaApi {
  error: boolean;
  reason: string;
}

/** Modelo de dominio: un día ya interpretado según el umbral de la parcela. */
export interface DiaPronostico {
  fecha: string;
  minima: number;
  maxima: number;
  riesgo: NivelRiesgo;
}

/** Resultado agregado de una consulta al servicio de clima. */
export interface Pronostico {
  zonaHoraria: string;
  dias: DiaPronostico[];
}

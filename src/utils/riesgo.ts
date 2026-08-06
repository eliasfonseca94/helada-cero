import { NivelRiesgo } from "../models/pronostico";

/** Margen de anticipación: bajo umbral + este delta ya se considera vigilancia. */
const MARGEN_VIGILANCIA = 3;

/**
 * Clasifica la mínima de un día contra el umbral crítico de la parcela.
 * Bajo 0 °C siempre es helada, sin importar el umbral declarado.
 */
export function clasificarRiesgo(minima: number, umbralCritico: number): NivelRiesgo {
  if (minima <= 0) {
    return NivelRiesgo.HELADA;
  }
  if (minima <= umbralCritico) {
    return NivelRiesgo.RIESGO;
  }
  if (minima <= umbralCritico + MARGEN_VIGILANCIA) {
    return NivelRiesgo.VIGILANCIA;
  }
  return NivelRiesgo.SEGURO;
}

/** Convierte "2026-08-07" en "jue 7 ago" usando la configuración regional chilena. */
export function formatearFecha(isoFecha: string): string {
  const partes = isoFecha.split("-").map((parte) => Number.parseInt(parte, 10));
  const [anio, mes, dia] = partes;
  if (anio === undefined || mes === undefined || dia === undefined) {
    return isoFecha;
  }
  const fecha = new Date(anio, mes - 1, dia);
  return fecha.toLocaleDateString("es-CL", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** Devuelve el nivel de riesgo más severo de una lista. */
export function riesgoMasAlto(niveles: NivelRiesgo[]): NivelRiesgo {
  const severidad: Record<NivelRiesgo, number> = {
    [NivelRiesgo.SEGURO]: 0,
    [NivelRiesgo.VIGILANCIA]: 1,
    [NivelRiesgo.RIESGO]: 2,
    [NivelRiesgo.HELADA]: 3,
  };
  return niveles.reduce<NivelRiesgo>(
    (peor, actual) => (severidad[actual] > severidad[peor] ? actual : peor),
    NivelRiesgo.SEGURO,
  );
}

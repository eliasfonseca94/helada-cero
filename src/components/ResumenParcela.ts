import type { Parcela } from "../models/parcela";
import { NOMBRE_CULTIVO, NOMBRE_LOCALIDAD } from "../models/parcela";
import type { DiaPronostico } from "../models/pronostico";
import { ETIQUETA_RIESGO, NivelRiesgo } from "../models/pronostico";
import { riesgoMasAlto } from "../utils/riesgo";
import { escaparHtml } from "../utils/texto";

/** Encabezado con el veredicto de la semana para la parcela consultada. */
export function generarResumenHtml(parcela: Parcela, dias: DiaPronostico[]): string {
  const peor = riesgoMasAlto(dias.map((dia) => dia.riesgo));
  const nochesCriticas = dias.filter(
    (dia) => dia.riesgo === NivelRiesgo.RIESGO || dia.riesgo === NivelRiesgo.HELADA,
  ).length;

  const veredicto =
    nochesCriticas === 0
      ? "Ninguna noche baja del umbral en los próximos 7 días."
      : `${nochesCriticas} noche(s) bajo ${parcela.umbralCritico} °C en los próximos 7 días.`;

  return `
    <div class="resumen" data-riesgo="${peor}">
      <p class="resumen__eyebrow">${NOMBRE_LOCALIDAD[parcela.localidad]} · ${NOMBRE_CULTIVO[parcela.cultivo]}</p>
      <h2 class="resumen__titulo">${escaparHtml(parcela.nombre)}</h2>
      <p class="resumen__veredicto">${veredicto}</p>
      <p class="resumen__nivel">Nivel máximo: <strong>${ETIQUETA_RIESGO[peor]}</strong></p>
    </div>
  `;
}

import type { Parcela } from "../models/parcela";
import type { DiaPronostico } from "../models/pronostico";
import { NivelRiesgo } from "../models/pronostico";
import { riesgoMasAlto } from "../utils/riesgo";
import { escaparHtml } from "../utils/texto";
import { obtenerTextosActuales } from "../i18n/textos";

/** Encabezado con el veredicto de la semana para la parcela consultada. */
export function generarResumenHtml(parcela: Parcela, dias: DiaPronostico[]): string {
  const textos = obtenerTextosActuales();
  const peor = riesgoMasAlto(dias.map((dia) => dia.riesgo));
  const nochesCriticas = dias.filter(
    (dia) => dia.riesgo === NivelRiesgo.RIESGO || dia.riesgo === NivelRiesgo.HELADA,
  ).length;

  const veredicto =
    nochesCriticas === 0
      ? textos.resumenVeredictoSinNoches
      : textos.resumenVeredictoConNoches(nochesCriticas, parcela.umbralCritico);

  return `
    <div class="resumen" data-riesgo="${peor}">
      <p class="resumen__eyebrow">${textos.localidades[parcela.localidad]} · ${textos.cultivos[parcela.cultivo]}</p>
      <h2 class="resumen__titulo">${escaparHtml(parcela.nombre)}</h2>
      <p class="resumen__veredicto">${veredicto}</p>
      <p class="resumen__nivel">${textos.resumenNivelMaximo} <strong>${textos.riesgos[peor]}</strong></p>
    </div>
  `;
}

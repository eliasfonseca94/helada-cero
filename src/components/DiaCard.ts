import type { DiaPronostico } from "../models/pronostico";
import { formatearFecha } from "../utils/riesgo";
import { escaparHtml } from "../utils/texto";
import { obtenerTextosActuales } from "../i18n/textos";

/**
 * Devuelve el marcado de una tarjeta de día.
 * El nivel de riesgo viaja como `data-riesgo`, así el color lo resuelve el CSS
 * y no se mezcla lógica de presentación con lógica de negocio.
 */
export function generarDiaCardHtml(dia: DiaPronostico, indice: number): string {
  const textos = obtenerTextosActuales();
  return `
    <article class="dia" data-riesgo="${dia.riesgo}" style="--retardo: ${indice * 45}ms">
      <p class="dia__fecha">${escaparHtml(formatearFecha(dia.fecha))}</p>
      <p class="dia__minima">${dia.minima.toFixed(1)}<span class="dia__unidad">°C</span></p>
      <p class="dia__maxima">${textos.diaMaximaEtiqueta(dia.maxima.toFixed(1))}</p>
      <p class="dia__riesgo">${textos.riesgos[dia.riesgo]}</p>
    </article>
  `;
}

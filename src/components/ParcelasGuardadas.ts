import type { Parcela } from "../models/parcela";
import { escaparHtml } from "../utils/texto";
import { obtenerTextosActuales } from "../i18n/textos";

/**
 * Lista de parcelas ya persistidas en el backend. Cada fila expone tres
 * acciones mediante `data-accion` + `data-id`; `main.ts` las captura con un
 * único listener delegado en el `<ul>` contenedor en vez de uno por botón.
 */
export function generarListaParcelasGuardadasHtml(
  parcelas: Parcela[],
  idEnEdicion: string | null,
): string {
  const textos = obtenerTextosActuales();

  if (parcelas.length === 0) {
    return `<li class="vacio">${textos.guardadasVacio}</li>`;
  }

  return parcelas
    .map((parcela) => {
      const enEdicion = parcela.id === idEnEdicion;
      return `
        <li class="parcela-guardada${enEdicion ? " parcela-guardada--activa" : ""}">
          <div class="parcela-guardada__info">
            <p class="parcela-guardada__nombre">${escaparHtml(parcela.nombre)}</p>
            <p class="parcela-guardada__detalle">
              ${textos.localidades[parcela.localidad]} · ${textos.cultivos[parcela.cultivo]} · ${parcela.umbralCritico} °C
            </p>
          </div>
          <div class="parcela-guardada__acciones">
            <button type="button" class="boton-mini" data-accion="ver" data-id="${escaparHtml(parcela.id)}">
              ${textos.accionVer}
            </button>
            <button type="button" class="boton-mini" data-accion="editar" data-id="${escaparHtml(parcela.id)}">
              ${textos.accionEditar}
            </button>
            <button
              type="button"
              class="boton-mini boton-mini--peligro"
              data-accion="eliminar"
              data-id="${escaparHtml(parcela.id)}"
            >
              ${textos.accionEliminar}
            </button>
          </div>
        </li>
      `;
    })
    .join("");
}

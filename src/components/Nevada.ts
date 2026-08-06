/**
 * Capa decorativa: cristales de hielo que caen por toda la pantalla.
 *
 * Las trayectorias se derivan del índice con pasos primos en vez de
 * `Math.random()`: el resultado se ve irregular pero es determinista, así el
 * fondo se renderiza igual en cada carga y en cada build.
 */

/** Trayectoria resuelta de un cristal. El CSS la consume por custom properties. */
interface Cristal {
  /** Posición horizontal en % del ancho de la ventana. */
  x: number;
  /** Altura en % donde arranca la caída: reparte hielo arriba, al medio y abajo. */
  y: number;
  escala: number;
  demoraSegundos: number;
  duracionSegundos: number;
}

const CANTIDAD_CRISTALES = 26;

function construirCristal(indice: number): Cristal {
  return {
    x: (indice * 37) % 99,
    y: (indice * 61) % 96,
    escala: 0.45 + ((indice * 17) % 65) / 100,
    demoraSegundos: ((indice * 23) % 75) / 10,
    duracionSegundos: 5 + ((indice * 29) % 48) / 10,
  };
}

function generarCristalHtml(cristal: Cristal): string {
  return `<span class="cristal" style="--x: ${cristal.x}%; --y: ${cristal.y}%; --escala: ${cristal.escala}; --demora: ${cristal.demoraSegundos}s; --duracion: ${cristal.duracionSegundos}s"></span>`;
}

/** Devuelve el marcado completo de la nevada. */
export function generarNevadaHtml(cantidad: number = CANTIDAD_CRISTALES): string {
  return Array.from({ length: cantidad }, (_valor, indice) =>
    generarCristalHtml(construirCristal(indice)),
  ).join("");
}

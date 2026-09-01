/**
 * Estado del idioma activo: qué idioma está eligiendo el usuario, cómo se
 * persiste entre visitas y cómo se avisa al resto de la app cuando cambia.
 *
 * Se guarda en `localStorage` (por eso el `try/catch`: en una ventana privada
 * o con el almacenamiento bloqueado, `localStorage` puede lanzar en vez de
 * simplemente fallar). Si no hay nada guardado, el idioma por defecto es
 * español — el público principal de la app es la Región de la Araucanía.
 */

export type Idioma = "es" | "en";

const CLAVE_ALMACENAMIENTO = "helada-cero:idioma";

function esIdioma(valor: unknown): valor is Idioma {
  return valor === "es" || valor === "en";
}

function leerIdiomaGuardado(): Idioma {
  try {
    const guardado = window.localStorage.getItem(CLAVE_ALMACENAMIENTO);
    return esIdioma(guardado) ? guardado : "es";
  } catch {
    return "es";
  }
}

let idiomaActual: Idioma = leerIdiomaGuardado();

/** Idioma activo en este momento. */
export function obtenerIdioma(): Idioma {
  return idiomaActual;
}

const escuchadores = new Set<(idioma: Idioma) => void>();

/** Registra una función para que se ejecute cada vez que el idioma cambie. */
export function alCambiarIdioma(callback: (idioma: Idioma) => void): void {
  escuchadores.add(callback);
}

/** Cambia el idioma activo, lo persiste y notifica a todos los suscriptores. */
export function establecerIdioma(idioma: Idioma): void {
  if (idioma === idiomaActual) {
    return;
  }
  idiomaActual = idioma;
  try {
    window.localStorage.setItem(CLAVE_ALMACENAMIENTO, idioma);
  } catch {
    // El idioma sigue cambiando en memoria aunque no se pueda persistir.
  }
  escuchadores.forEach((callback) => callback(idioma));
}

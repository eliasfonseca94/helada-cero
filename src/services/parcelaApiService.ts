/**
 * Cliente HTTP del microservicio propio (Spring Boot + PostgreSQL, ver
 * `backend/`). A diferencia de `climaService.ts` (que consulta un tercero),
 * este servicio es el que guarda, lee, actualiza y elimina las parcelas del
 * usuario — el ciclo de dato real de la Integración Full-Stack.
 */
import {
  aLocalidad,
  aTipoCultivo,
  COORDENADAS,
  type DatosParcela,
  type Parcela,
} from "../models/parcela";
import { obtenerTextosActuales } from "../i18n/textos";

const URL_BASE = `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"}/api/v1/parcelas`;

/** Mismo corte de espera que climaService: sin esto, un backend caído deja la UI colgada. */
const ESPERA_MAXIMA_MS = 5000;

/** Forma cruda que devuelve el backend para una parcela (ver ParcelaResponse.java). */
interface ParcelaApi {
  id: string;
  nombre: string;
  cultivo: string;
  localidad: string;
  latitud: number;
  longitud: number;
  umbralCritico: number;
}

/** Forma del error unificado que devuelve GlobalExceptionHandler. */
interface ErrorApi {
  mensaje: string;
}

function esParcelaApiValida(datos: unknown): datos is ParcelaApi {
  if (typeof datos !== "object" || datos === null) {
    return false;
  }
  const posible = datos as Partial<ParcelaApi>;
  return (
    typeof posible.id === "string" &&
    typeof posible.nombre === "string" &&
    typeof posible.cultivo === "string" &&
    typeof posible.localidad === "string" &&
    typeof posible.umbralCritico === "number"
  );
}

function esErrorApi(datos: unknown): datos is ErrorApi {
  if (typeof datos !== "object" || datos === null) {
    return false;
  }
  return typeof (datos as Partial<ErrorApi>).mensaje === "string";
}

/**
 * Traduce el JSON crudo del backend al modelo de dominio. La coordenada no
 * viaja desde `ParcelaApi.latitud/longitud` a propósito: se resuelve
 * localmente desde `COORDENADAS`, la misma fuente de verdad que usa el
 * formulario — así ambos lados del stack están garantizados a coincidir.
 */
function aDominio(api: ParcelaApi): Parcela | null {
  const localidad = aLocalidad(api.localidad);
  const cultivo = aTipoCultivo(api.cultivo);
  if (localidad === null || cultivo === null) {
    return null;
  }
  return {
    id: api.id,
    nombre: api.nombre,
    cultivo,
    localidad,
    coordenada: COORDENADAS[localidad],
    umbralCritico: api.umbralCritico,
  };
}

async function pedirConEspera(url: string, opciones: RequestInit): Promise<Response> {
  const controlador = new AbortController();
  const cronometro = window.setTimeout(() => controlador.abort(), ESPERA_MAXIMA_MS);

  try {
    return await fetch(url, { ...opciones, signal: controlador.signal });
  } catch (error: unknown) {
    if (controlador.signal.aborted) {
      throw new Error(obtenerTextosActuales().errorServidorSinRespuesta);
    }
    throw error;
  } finally {
    window.clearTimeout(cronometro);
  }
}

/**
 * Ojo: si el backend sí respondió (con un `ErrorResponse`), su `mensaje`
 * viaja tal cual como lo escribió `GlobalExceptionHandler` — siempre en
 * español, porque el backend no tiene su propia capa de idiomas. Solo el
 * mensaje de respaldo (cuando no hay cuerpo interpretable) sale traducido.
 */
async function describirRespuestaFallida(respuesta: Response): Promise<string> {
  try {
    const cuerpo: unknown = await respuesta.json();
    if (esErrorApi(cuerpo)) {
      return cuerpo.mensaje;
    }
  } catch {
    // Cuerpo vacío o que no es JSON: se cae al mensaje genérico de abajo.
  }
  return obtenerTextosActuales().apiErrorHttp(respuesta.status);
}

/** GET /api/v1/parcelas — lee todas las parcelas guardadas por el usuario. */
export async function listarParcelasGuardadas(): Promise<Parcela[]> {
  const respuesta = await pedirConEspera(URL_BASE, { method: "GET" });

  if (!respuesta.ok) {
    throw new Error(await describirRespuestaFallida(respuesta));
  }

  const datos: unknown = await respuesta.json();
  if (!Array.isArray(datos)) {
    throw new Error(obtenerTextosActuales().apiErrorListaInvalida);
  }

  // Una parcela con un enum que el cliente todavía no reconoce se descarta
  // en vez de romper el resto del listado — mismo criterio que climaService
  // al descartar un día incompleto del pronóstico.
  return datos
    .filter(esParcelaApiValida)
    .map(aDominio)
    .filter((parcela): parcela is Parcela => parcela !== null);
}

/** POST /api/v1/parcelas — guarda una parcela nueva. */
export async function guardarParcela(datos: DatosParcela): Promise<Parcela> {
  const respuesta = await pedirConEspera(URL_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  if (!respuesta.ok) {
    throw new Error(await describirRespuestaFallida(respuesta));
  }

  const cuerpo: unknown = await respuesta.json();
  if (!esParcelaApiValida(cuerpo)) {
    throw new Error(obtenerTextosActuales().apiErrorParcelaInvalida);
  }
  const parcela = aDominio(cuerpo);
  if (parcela === null) {
    throw new Error(obtenerTextosActuales().apiErrorEnumDesconocido);
  }
  return parcela;
}

/** PUT /api/v1/parcelas/{id} — reemplaza una parcela existente. */
export async function actualizarParcelaGuardada(id: string, datos: DatosParcela): Promise<Parcela> {
  const respuesta = await pedirConEspera(`${URL_BASE}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  if (!respuesta.ok) {
    throw new Error(await describirRespuestaFallida(respuesta));
  }

  const cuerpo: unknown = await respuesta.json();
  if (!esParcelaApiValida(cuerpo)) {
    throw new Error(obtenerTextosActuales().apiErrorParcelaInvalida);
  }
  const parcela = aDominio(cuerpo);
  if (parcela === null) {
    throw new Error(obtenerTextosActuales().apiErrorEnumDesconocido);
  }
  return parcela;
}

/** DELETE /api/v1/parcelas/{id} — elimina una parcela guardada. */
export async function eliminarParcelaGuardada(id: string): Promise<void> {
  const respuesta = await pedirConEspera(`${URL_BASE}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!respuesta.ok) {
    throw new Error(await describirRespuestaFallida(respuesta));
  }
}

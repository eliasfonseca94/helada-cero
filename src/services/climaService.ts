import type { Parcela } from "../models/parcela";
import type {
  DiaPronostico,
  ErrorClimaApi,
  Pronostico,
  RespuestaClimaApi,
} from "../models/pronostico";
import { clasificarRiesgo } from "../utils/riesgo";
import { obtenerTextosActuales } from "../i18n/textos";

const URL_BASE = "https://api.open-meteo.com/v1/forecast";
const ZONA_HORARIA = "America/Santiago";
const DIAS_PRONOSTICO = 7;

/** Tiempo máximo que se le concede al servicio antes de cortar la espera. */
const ESPERA_MAXIMA_MS = 5000;

/** Construye la URL del endpoint sin concatenar cadenas a mano. */
function construirUrl(parcela: Parcela): string {
  const parametros = new URLSearchParams({
    latitude: parcela.coordenada.latitud.toString(),
    longitude: parcela.coordenada.longitud.toString(),
    daily: "temperature_2m_min,temperature_2m_max",
    timezone: ZONA_HORARIA,
    forecast_days: DIAS_PRONOSTICO.toString(),
  });
  return `${URL_BASE}?${parametros.toString()}`;
}

/**
 * Verifica que el JSON recibido tenga la forma esperada antes de tratarlo
 * como `RespuestaClimaApi`. Sin esta guardia, un cambio en la API produciría
 * un `undefined` silencioso al renderizar.
 */
function esRespuestaValida(datos: unknown): datos is RespuestaClimaApi {
  if (typeof datos !== "object" || datos === null) {
    return false;
  }
  const posible = datos as Partial<RespuestaClimaApi>;
  const diario = posible.daily;
  return (
    diario !== undefined &&
    Array.isArray(diario.time) &&
    Array.isArray(diario.temperature_2m_min) &&
    Array.isArray(diario.temperature_2m_max) &&
    diario.time.length > 0
  );
}

/** Reconoce el cuerpo de error que publica Open-Meteo ante una consulta inválida. */
function esErrorApi(datos: unknown): datos is ErrorClimaApi {
  if (typeof datos !== "object" || datos === null) {
    return false;
  }
  const posible = datos as Partial<ErrorClimaApi>;
  return posible.error === true && typeof posible.reason === "string";
}

/**
 * Traduce una respuesta HTTP no exitosa al mensaje más específico disponible:
 * el `reason` que manda la API si viene, o el código HTTP como respaldo.
 */
async function describirRespuestaFallida(respuesta: Response): Promise<string> {
  const textos = obtenerTextosActuales();
  try {
    const cuerpo: unknown = await respuesta.json();
    if (esErrorApi(cuerpo)) {
      return textos.climaErrorRechazo(cuerpo.reason);
    }
  } catch {
    // Cuerpo vacío o que no es JSON: se cae al mensaje genérico de abajo.
  }
  return textos.climaErrorHttp(respuesta.status);
}

/**
 * Dispara el fetch con un corte de espera propio. `fetch` no tiene timeout
 * nativo: sin esto, un servidor que acepta la conexión y nunca responde deja
 * la interfaz en "Consultando…" para siempre.
 */
async function pedirConEspera(url: string): Promise<Response> {
  const controlador = new AbortController();
  const cronometro = window.setTimeout(() => controlador.abort(), ESPERA_MAXIMA_MS);

  try {
    return await fetch(url, { signal: controlador.signal });
  } catch (error: unknown) {
    // Un abort no es un fallo de red, es nuestro propio corte por tiempo.
    if (controlador.signal.aborted) {
      throw new Error(obtenerTextosActuales().errorServidorSinRespuesta);
    }
    throw error;
  } finally {
    window.clearTimeout(cronometro);
  }
}

/** Mapea los arreglos paralelos de la API al modelo de dominio. */
function mapearDias(respuesta: RespuestaClimaApi, umbralCritico: number): DiaPronostico[] {
  const { time, temperature_2m_min, temperature_2m_max } = respuesta.daily;

  return time.reduce<DiaPronostico[]>((acumulado, fecha, indice) => {
    const minima = temperature_2m_min[indice];
    const maxima = temperature_2m_max[indice];

    // Si algún índice viene incompleto, se descarta el día en vez de renderizar NaN.
    if (minima === undefined || maxima === undefined) {
      return acumulado;
    }

    acumulado.push({
      fecha,
      minima,
      maxima,
      riesgo: clasificarRiesgo(minima, umbralCritico),
    });
    return acumulado;
  }, []);
}

/**
 * Consulta el pronóstico de 7 días para una parcela.
 * Lanza un Error descriptivo ante espera agotada, fallo de red, HTTP no exitoso
 * o payload corrupto. Quien llama solo tiene que leer `.message`.
 */
export async function obtenerPronostico(parcela: Parcela): Promise<Pronostico> {
  const respuesta = await pedirConEspera(construirUrl(parcela));

  if (!respuesta.ok) {
    throw new Error(await describirRespuestaFallida(respuesta));
  }

  const datos: unknown = await respuesta.json();

  if (!esRespuestaValida(datos)) {
    throw new Error(obtenerTextosActuales().climaErrorFormatoInvalido);
  }

  const dias = mapearDias(datos, parcela.umbralCritico);

  if (dias.length === 0) {
    throw new Error(obtenerTextosActuales().climaErrorSinTemperaturas);
  }

  return { zonaHoraria: datos.timezone, dias };
}

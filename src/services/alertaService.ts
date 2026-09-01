import type { Parcela } from "../models/parcela";
import type { DiaPronostico } from "../models/pronostico";
import { NivelRiesgo } from "../models/pronostico";
import { obtenerTextosActuales } from "../i18n/textos";

/** Cuerpo que se enviaría a un backend real de notificaciones. */
export interface SolicitudAlerta {
  parcelaId: string;
  nombreParcela: string;
  email: string;
  umbralCritico: number;
  diasEnRiesgo: string[];
}

/** Confirmación devuelta por el servicio de notificaciones. */
export interface ConfirmacionAlerta {
  folio: string;
  mensaje: string;
}

const LATENCIA_SIMULADA_MS = 1400;

/**
 * Forma mínima aceptable de un correo: algo, arroba, dominio con punto y TLD.
 * No se persigue la RFC 5322 completa; la verdad definitiva la tiene el
 * servidor de correo al momento de enviar.
 */
const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Guardia reutilizable para validar la dirección antes de suscribir. */
export function esEmailValido(valor: string): boolean {
  return PATRON_EMAIL.test(valor);
}

function esperar(milisegundos: number): Promise<void> {
  return new Promise((resolver) => window.setTimeout(resolver, milisegundos));
}

/**
 * Simula el envío (POST) de una suscripción de alerta a un servicio externo.
 * El Hito 2 no exige backend propio, así que la latencia y la validación del
 * servidor se modelan aquí para ejercitar el mismo flujo async/await + try/catch.
 */
export async function registrarAlerta(
  parcela: Parcela,
  dias: DiaPronostico[],
  email: string,
): Promise<ConfirmacionAlerta> {
  const diasEnRiesgo = dias
    .filter((dia) => dia.riesgo === NivelRiesgo.RIESGO || dia.riesgo === NivelRiesgo.HELADA)
    .map((dia) => dia.fecha);

  const solicitud: SolicitudAlerta = {
    parcelaId: parcela.id,
    nombreParcela: parcela.nombre,
    email: email.trim().toLowerCase(),
    umbralCritico: parcela.umbralCritico,
    diasEnRiesgo,
  };

  await esperar(LATENCIA_SIMULADA_MS);

  const textos = obtenerTextosActuales();

  // Validaciones del lado del "servidor": entran al catch de quien llama.
  if (!esEmailValido(solicitud.email)) {
    throw new Error(textos.alertaErrorEmailRechazado);
  }

  if (solicitud.diasEnRiesgo.length === 0) {
    throw new Error(textos.alertaErrorSinNochesRiesgo);
  }

  return {
    folio: `AL-${Date.now().toString(36).toUpperCase()}`,
    mensaje: textos.alertaConfirmacion(
      solicitud.email,
      solicitud.diasEnRiesgo.length,
      parcela.umbralCritico,
      parcela.nombre,
    ),
  };
}

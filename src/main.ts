import "./style.css";

import { EstadoSolicitud, TonoMensaje } from "./models/estado";
import {
  COORDENADAS,
  aLocalidad,
  aTipoCultivo,
  type Parcela,
} from "./models/parcela";
import type { DiaPronostico } from "./models/pronostico";
import { generarDiaCardHtml } from "./components/DiaCard";
import { generarNevadaHtml } from "./components/Nevada";
import { generarResumenHtml } from "./components/ResumenParcela";
import { obtenerPronostico } from "./services/climaService";
import { esEmailValido, registrarAlerta } from "./services/alertaService";
import { escaparHtml } from "./utils/texto";

/* ── Estado de la aplicación ─────────────────────────────────────────── */

interface EstadoApp {
  parcela: Parcela | null;
  dias: DiaPronostico[];
  estadoPronostico: EstadoSolicitud;
  estadoAlerta: EstadoSolicitud;
}

const estado: EstadoApp = {
  parcela: null,
  dias: [],
  estadoPronostico: EstadoSolicitud.INACTIVO,
  estadoAlerta: EstadoSolicitud.INACTIVO,
};

/* ── Utilidades de errores ───────────────────────────────────────────── */

/**
 * Normaliza lo capturado en un catch. `catch (error: unknown)` es la forma
 * estricta: TypeScript no garantiza que lo lanzado sea un Error.
 */
function describirError(error: unknown): string {
  if (error instanceof TypeError) {
    return "No hay conexión con el servicio meteorológico. Revisa tu red y reintenta.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Ocurrió un fallo inesperado al procesar la solicitud.";
}

/* ── Captura de nodos con guardias de nulidad ────────────────────────── */

const formularioParcela = document.getElementById("form-parcela") as HTMLFormElement | null;
const contenedorPronostico = document.getElementById("contenedor-pronostico");
const contenedorResumen = document.getElementById("contenedor-resumen");
const bloqueErrorFormulario = document.getElementById("bloque-error-formulario");
const bloqueAlerta = document.getElementById("bloque-alerta");
const mensajeAlerta = document.getElementById("mensaje-alerta");
const botonConsultar = document.getElementById("btn-consultar") as HTMLButtonElement | null;
const botonAlerta = document.getElementById("btn-alerta") as HTMLButtonElement | null;
const entradaEmail = document.getElementById("txt-email") as HTMLInputElement | null;
const capaNevada = document.getElementById("nevada");

// Los campos del formulario: aserción especializada + `| null`, igual que el
// resto. Ninguna lectura del DOM asume que el nodo existe.
const entradaNombre = document.getElementById("txt-nombre") as HTMLInputElement | null;
const entradaUmbral = document.getElementById("txt-umbral") as HTMLInputElement | null;
const selectorLocalidad = document.getElementById("sel-localidad") as HTMLSelectElement | null;
const selectorCultivo = document.getElementById("sel-cultivo") as HTMLSelectElement | null;

/* ── Renderizado ─────────────────────────────────────────────────────── */

function mostrarErrorFormulario(texto: string): void {
  if (bloqueErrorFormulario === null) {
    return;
  }
  bloqueErrorFormulario.textContent = texto;
}

function pintarPronostico(dias: DiaPronostico[]): void {
  if (contenedorPronostico === null) {
    return;
  }
  contenedorPronostico.innerHTML = dias
    .map((dia, indice) => generarDiaCardHtml(dia, indice))
    .join("");
}

function pintarResumen(html: string): void {
  if (contenedorResumen === null) {
    return;
  }
  contenedorResumen.innerHTML = html;
}

/** Traduce el enum de estado a lo que ve el usuario. Una sola fuente de verdad. */
function renderEstadoPronostico(mensajeError?: string): void {
  if (contenedorPronostico === null) {
    return;
  }

  switch (estado.estadoPronostico) {
    case EstadoSolicitud.CARGANDO:
      pintarResumen("");
      contenedorPronostico.innerHTML = `
        <p class="cargando">
          <span class="cargando__pulso" aria-hidden="true"></span>
          Consultando las mínimas de los próximos 7 días…
        </p>`;
      if (bloqueAlerta !== null) {
        bloqueAlerta.hidden = true;
      }
      break;

    case EstadoSolicitud.ERROR:
      pintarResumen("");
      contenedorPronostico.innerHTML = `
        <div class="alerta-error" role="alert">
          <p class="alerta-error__titulo">No se pudo traer el pronóstico</p>
          <p class="alerta-error__detalle">${escaparHtml(mensajeError ?? "Error desconocido.")}</p>
        </div>`;
      if (bloqueAlerta !== null) {
        bloqueAlerta.hidden = true;
      }
      break;

    case EstadoSolicitud.EXITO:
      if (estado.parcela !== null) {
        pintarResumen(generarResumenHtml(estado.parcela, estado.dias));
      }
      pintarPronostico(estado.dias);
      if (bloqueAlerta !== null) {
        bloqueAlerta.hidden = false;
      }
      break;

    case EstadoSolicitud.INACTIVO:
      contenedorPronostico.innerHTML = `
        <p class="vacio">Sin consulta todavía. Completa el formulario para traer los datos.</p>`;
      if (bloqueAlerta !== null) {
        bloqueAlerta.hidden = true;
      }
      break;
  }

  if (botonConsultar !== null) {
    const cargando = estado.estadoPronostico === EstadoSolicitud.CARGANDO;
    botonConsultar.disabled = cargando;
    botonConsultar.textContent = cargando ? "Consultando…" : "Ver pronóstico";
  }
}

function renderEstadoAlerta(texto: string, tono: TonoMensaje): void {
  if (mensajeAlerta === null) {
    return;
  }
  // textContent, no innerHTML: el texto se muestra literal, nunca se interpreta.
  mensajeAlerta.textContent = texto;
  mensajeAlerta.dataset["tono"] = tono;

  if (botonAlerta !== null) {
    const cargando = estado.estadoAlerta === EstadoSolicitud.CARGANDO;
    botonAlerta.disabled = cargando;
    botonAlerta.textContent = cargando ? "Registrando…" : "Activar aviso de helada";
  }
}

/* ── Extracción y validación del formulario ──────────────────────────── */

/** Construye una Parcela válida o null si los datos no pasan la validación. */
function leerParcelaDesdeFormulario(): Parcela | null {
  if (
    entradaNombre === null ||
    entradaUmbral === null ||
    selectorLocalidad === null ||
    selectorCultivo === null
  ) {
    mostrarErrorFormulario("No se pudieron leer los campos del formulario. Recarga la página.");
    return null;
  }

  const nombre = entradaNombre.value.trim();
  const umbralCritico = Number.parseFloat(entradaUmbral.value);
  const localidad = aLocalidad(selectorLocalidad.value);
  const cultivo = aTipoCultivo(selectorCultivo.value);

  if (nombre.length === 0) {
    mostrarErrorFormulario("Ponle un nombre a la parcela para identificar la alerta.");
    return null;
  }
  if (Number.isNaN(umbralCritico)) {
    mostrarErrorFormulario("Ingresa el umbral crítico en grados Celsius.");
    return null;
  }
  if (umbralCritico < -5 || umbralCritico > 10) {
    mostrarErrorFormulario("El umbral crítico debe estar entre -5 °C y 10 °C.");
    return null;
  }
  if (localidad === null || cultivo === null) {
    mostrarErrorFormulario("Selecciona una localidad y un cultivo válidos.");
    return null;
  }

  mostrarErrorFormulario("");

  return {
    id: `parcela-${Date.now().toString(36)}`,
    nombre,
    cultivo,
    localidad,
    coordenada: COORDENADAS[localidad],
    umbralCritico,
  };
}

/* ── Flujos asíncronos ───────────────────────────────────────────────── */

async function consultarPronostico(parcela: Parcela): Promise<void> {
  estado.parcela = parcela;
  estado.estadoPronostico = EstadoSolicitud.CARGANDO;
  // Cada consulta nueva deja la suscripción en cero: el mensaje anterior
  // hablaba de un pronóstico que ya no está en pantalla.
  estado.estadoAlerta = EstadoSolicitud.INACTIVO;
  renderEstadoAlerta("", TonoMensaje.NEUTRO);
  renderEstadoPronostico();

  try {
    const pronostico = await obtenerPronostico(parcela);
    estado.dias = pronostico.dias;
    estado.estadoPronostico = EstadoSolicitud.EXITO;
    renderEstadoPronostico();
    renderEstadoAlerta("", TonoMensaje.NEUTRO);
  } catch (error: unknown) {
    console.error("Fallo al consultar el pronóstico:", error);
    estado.dias = [];
    estado.estadoPronostico = EstadoSolicitud.ERROR;
    renderEstadoPronostico(describirError(error));
  }
}

async function activarAlerta(): Promise<void> {
  if (estado.parcela === null) {
    return;
  }

  // Validación en el cliente: evita un viaje al servicio si el correo no sirve.
  const email = entradaEmail === null ? "" : entradaEmail.value.trim();

  if (email.length === 0) {
    estado.estadoAlerta = EstadoSolicitud.ERROR;
    renderEstadoAlerta("Ingresa tu mail para recibir las alertas vía email.", TonoMensaje.ERROR);
    entradaEmail?.focus();
    return;
  }
  if (!esEmailValido(email)) {
    estado.estadoAlerta = EstadoSolicitud.ERROR;
    renderEstadoAlerta(
      "Ese correo no tiene un formato válido. Ejemplo: nombre@dominio.cl",
      TonoMensaje.ERROR,
    );
    entradaEmail?.focus();
    return;
  }

  estado.estadoAlerta = EstadoSolicitud.CARGANDO;
  renderEstadoAlerta("Enviando la suscripción al servicio de avisos…", TonoMensaje.NEUTRO);

  try {
    const confirmacion = await registrarAlerta(estado.parcela, estado.dias, email);
    estado.estadoAlerta = EstadoSolicitud.EXITO;
    renderEstadoAlerta(
      `${confirmacion.mensaje} Folio ${confirmacion.folio}.`,
      TonoMensaje.EXITO,
    );
  } catch (error: unknown) {
    console.error("Fallo al registrar la alerta:", error);
    estado.estadoAlerta = EstadoSolicitud.ERROR;
    renderEstadoAlerta(describirError(error), TonoMensaje.ERROR);
  }
}

/* ── Escuchadores ────────────────────────────────────────────────────── */

if (formularioParcela !== null) {
  formularioParcela.addEventListener("submit", (evento: Event) => {
    evento.preventDefault();

    const parcela = leerParcelaDesdeFormulario();
    if (parcela === null) {
      return;
    }

    void consultarPronostico(parcela);
  });

  // Validación reactiva: el error del formulario se retira apenas el usuario
  // vuelve a escribir, en vez de quedarse hasta el siguiente envío.
  formularioParcela.addEventListener("input", () => {
    mostrarErrorFormulario("");
  });
}

if (botonAlerta !== null) {
  botonAlerta.addEventListener("click", () => {
    void activarAlerta();
  });
}

// Lo mismo para el correo, pero solo cuando el valor ya es válido: así el
// mensaje no parpadea mientras la dirección está a medio escribir.
if (entradaEmail !== null) {
  entradaEmail.addEventListener("input", () => {
    if (estado.estadoAlerta !== EstadoSolicitud.ERROR) {
      return;
    }
    if (esEmailValido(entradaEmail.value.trim())) {
      estado.estadoAlerta = EstadoSolicitud.INACTIVO;
      renderEstadoAlerta("", TonoMensaje.NEUTRO);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (capaNevada !== null) {
    capaNevada.innerHTML = generarNevadaHtml();
  }
  renderEstadoPronostico();
});

import "./style.css";

import { EstadoSolicitud, TonoMensaje } from "./models/estado";
import {
  aLocalidad,
  aTipoCultivo,
  TipoCultivo,
  type DatosParcela,
  type Parcela,
} from "./models/parcela";
import type { DiaPronostico } from "./models/pronostico";
import { generarDiaCardHtml } from "./components/DiaCard";
import { generarNevadaHtml } from "./components/Nevada";
import { generarResumenHtml } from "./components/ResumenParcela";
import { generarListaParcelasGuardadasHtml } from "./components/ParcelasGuardadas";
import { obtenerPronostico } from "./services/climaService";
import { esEmailValido, registrarAlerta } from "./services/alertaService";
import {
  actualizarParcelaGuardada,
  eliminarParcelaGuardada,
  guardarParcela,
  listarParcelasGuardadas,
} from "./services/parcelaApiService";
import { escaparHtml } from "./utils/texto";
import { alCambiarIdioma, establecerIdioma, obtenerIdioma } from "./i18n/idioma";
import { obtenerTextosActuales } from "./i18n/textos";

/* ── Estado de la aplicación ─────────────────────────────────────────── */

interface EstadoApp {
  parcela: Parcela | null;
  dias: DiaPronostico[];
  estadoPronostico: EstadoSolicitud;
  estadoAlerta: EstadoSolicitud;
  /** Parcelas ya persistidas en el backend (ciclo de dato Full-Stack). */
  parcelasGuardadas: Parcela[];
  /** Id de la parcela que el formulario está editando, o null si es una creación. */
  idEnEdicion: string | null;
}

const estado: EstadoApp = {
  parcela: null,
  dias: [],
  estadoPronostico: EstadoSolicitud.INACTIVO,
  estadoAlerta: EstadoSolicitud.INACTIVO,
  parcelasGuardadas: [],
  idEnEdicion: null,
};

/* ── Utilidades de errores ───────────────────────────────────────────── */

/**
 * Normaliza lo capturado en un catch. `catch (error: unknown)` es la forma
 * estricta: TypeScript no garantiza que lo lanzado sea un Error. Se comparte
 * entre las llamadas a Open-Meteo y al backend propio: ambas son `fetch`.
 */
function describirError(error: unknown): string {
  const textos = obtenerTextosActuales();
  if (error instanceof TypeError) {
    return textos.errorSinConexion;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return textos.errorInesperado;
}

/* ── Captura de nodos con guardias de nulidad ────────────────────────── */

const formularioParcela = document.getElementById("form-parcela") as HTMLFormElement | null;
const contenedorPronostico = document.getElementById("contenedor-pronostico");
const contenedorResumen = document.getElementById("contenedor-resumen");
const bloqueErrorFormulario = document.getElementById("bloque-error-formulario");
const bloqueAlerta = document.getElementById("bloque-alerta");
const mensajeAlerta = document.getElementById("mensaje-alerta");
const botonConsultar = document.getElementById("btn-consultar") as HTMLButtonElement | null;
const botonCancelarEdicion = document.getElementById("btn-cancelar-edicion") as HTMLButtonElement | null;
const botonAlerta = document.getElementById("btn-alerta") as HTMLButtonElement | null;
const entradaEmail = document.getElementById("txt-email") as HTMLInputElement | null;
const capaNevada = document.getElementById("nevada");
const tituloFormulario = document.getElementById("titulo-formulario");
const tituloResultados = document.getElementById("titulo-resultados");
const tituloGuardadasEl = document.getElementById("titulo-guardadas");
const cabeceraEyebrow = document.getElementById("cabecera-eyebrow");
const cabeceraBajada = document.getElementById("cabecera-bajada");
const labelNombre = document.getElementById("label-nombre");
const labelLocalidad = document.getElementById("label-localidad");
const labelCultivo = document.getElementById("label-cultivo");
const labelUmbral = document.getElementById("label-umbral");
const ayudaUmbral = document.getElementById("ayuda-umbral");
const labelEmail = document.getElementById("label-email");
const ayudaEmail = document.getElementById("ayuda-email");
const pieTexto = document.getElementById("pie-texto");
const optHortaliza = document.getElementById("opt-hortaliza");
const optFrutal = document.getElementById("opt-frutal");
const optPradera = document.getElementById("opt-pradera");
const optCereal = document.getElementById("opt-cereal");

// Los campos del formulario: aserción especializada + `| null`, igual que el
// resto. Ninguna lectura del DOM asume que el nodo existe.
const entradaNombre = document.getElementById("txt-nombre") as HTMLInputElement | null;
const entradaUmbral = document.getElementById("txt-umbral") as HTMLInputElement | null;
const selectorLocalidad = document.getElementById("sel-localidad") as HTMLSelectElement | null;
const selectorCultivo = document.getElementById("sel-cultivo") as HTMLSelectElement | null;

// Lista de parcelas guardadas en el backend (leer/actualizar/eliminar).
const contenedorListaGuardadas = document.getElementById("lista-parcelas-guardadas");
const bloqueErrorGuardadas = document.getElementById("bloque-error-guardadas");

// Selector de idioma.
const botonIdiomaEs = document.getElementById("btn-idioma-es") as HTMLButtonElement | null;
const botonIdiomaEn = document.getElementById("btn-idioma-en") as HTMLButtonElement | null;

/* ── Internacionalización ─────────────────────────────────────────────── */

/** Aplica el idioma activo a todo el marcado estático de index.html. */
function aplicarTextosEstaticos(): void {
  const textos = obtenerTextosActuales();

  document.title = textos.tituloDocumento;
  document.querySelector('meta[name="description"]')?.setAttribute("content", textos.descripcionDocumento);

  if (cabeceraEyebrow !== null) cabeceraEyebrow.textContent = textos.cabeceraEyebrow;
  if (cabeceraBajada !== null) cabeceraBajada.textContent = textos.cabeceraBajada;

  if (tituloFormulario !== null) tituloFormulario.textContent = textos.tituloFormulario;
  if (labelNombre !== null) labelNombre.textContent = textos.labelNombre;
  if (entradaNombre !== null) entradaNombre.placeholder = textos.placeholderNombre;
  if (labelLocalidad !== null) labelLocalidad.textContent = textos.labelLocalidad;
  if (labelCultivo !== null) labelCultivo.textContent = textos.labelCultivo;
  if (optHortaliza !== null) optHortaliza.textContent = textos.cultivos[TipoCultivo.HORTALIZA];
  if (optFrutal !== null) optFrutal.textContent = textos.cultivos[TipoCultivo.FRUTAL];
  if (optPradera !== null) optPradera.textContent = textos.cultivos[TipoCultivo.PRADERA];
  if (optCereal !== null) optCereal.textContent = textos.cultivos[TipoCultivo.CEREAL];
  if (labelUmbral !== null) labelUmbral.textContent = textos.labelUmbral;
  if (ayudaUmbral !== null) ayudaUmbral.textContent = textos.ayudaUmbral;

  if (tituloGuardadasEl !== null) tituloGuardadasEl.textContent = textos.tituloGuardadas;
  if (tituloResultados !== null) tituloResultados.textContent = textos.tituloResultados;

  if (labelEmail !== null) labelEmail.textContent = textos.labelEmail;
  if (entradaEmail !== null) entradaEmail.placeholder = textos.placeholderEmail;
  if (ayudaEmail !== null) ayudaEmail.textContent = textos.ayudaEmail;

  // Contenido de confianza (lo escribimos nosotros, no el usuario): el único
  // lugar de la app donde se usa innerHTML con una cadena que no pasó por
  // escaparHtml, porque necesita conservar el enlace a Open-Meteo.
  if (pieTexto !== null) pieTexto.innerHTML = textos.pieHtml;
}

function sincronizarBotonesIdioma(): void {
  const idioma = obtenerIdioma();
  botonIdiomaEs?.setAttribute("aria-pressed", idioma === "es" ? "true" : "false");
  botonIdiomaEn?.setAttribute("aria-pressed", idioma === "en" ? "true" : "false");
}

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

/** Sincroniza el texto/estado del botón de guardar y el de cancelar edición. */
function sincronizarBotonConsultar(): void {
  const textos = obtenerTextosActuales();
  const cargando = estado.estadoPronostico === EstadoSolicitud.CARGANDO;

  if (botonConsultar !== null) {
    botonConsultar.disabled = cargando;
    botonConsultar.textContent = cargando
      ? textos.botonGuardando
      : estado.idEnEdicion === null
        ? textos.botonGuardar
        : textos.botonActualizar;
  }

  if (botonCancelarEdicion !== null) {
    botonCancelarEdicion.textContent = textos.botonCancelarEdicion;
    botonCancelarEdicion.hidden = estado.idEnEdicion === null;
  }
}

/** Traduce el enum de estado a lo que ve el usuario. Una sola fuente de verdad. */
function renderEstadoPronostico(mensajeError?: string): void {
  if (contenedorPronostico === null) {
    return;
  }
  const textos = obtenerTextosActuales();

  switch (estado.estadoPronostico) {
    case EstadoSolicitud.CARGANDO:
      pintarResumen("");
      contenedorPronostico.innerHTML = `
        <p class="cargando">
          <span class="cargando__pulso" aria-hidden="true"></span>
          ${escaparHtml(textos.resultadosCargando)}
        </p>`;
      if (bloqueAlerta !== null) {
        bloqueAlerta.hidden = true;
      }
      break;

    case EstadoSolicitud.ERROR:
      pintarResumen("");
      contenedorPronostico.innerHTML = `
        <div class="alerta-error" role="alert">
          <p class="alerta-error__titulo">${escaparHtml(textos.errorSolicitudTitulo)}</p>
          <p class="alerta-error__detalle">${escaparHtml(mensajeError ?? textos.errorInesperado)}</p>
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
      contenedorPronostico.innerHTML = `<p class="vacio">${escaparHtml(textos.resultadosVacio)}</p>`;
      if (bloqueAlerta !== null) {
        bloqueAlerta.hidden = true;
      }
      break;
  }

  sincronizarBotonConsultar();
}

/** Sincroniza el texto/estado del botón de suscripción a la alerta. */
function sincronizarBotonAlerta(): void {
  if (botonAlerta === null) {
    return;
  }
  const textos = obtenerTextosActuales();
  const cargando = estado.estadoAlerta === EstadoSolicitud.CARGANDO;
  botonAlerta.disabled = cargando;
  botonAlerta.textContent = cargando ? textos.botonRegistrandoAlerta : textos.botonActivarAlerta;
}

function renderEstadoAlerta(texto: string, tono: TonoMensaje): void {
  if (mensajeAlerta === null) {
    return;
  }
  // textContent, no innerHTML: el texto se muestra literal, nunca se interpreta.
  mensajeAlerta.textContent = texto;
  mensajeAlerta.dataset["tono"] = tono;
  sincronizarBotonAlerta();
}

/** Repinta el listado de parcelas guardadas según el estado actual. */
function renderListaGuardadas(): void {
  if (contenedorListaGuardadas === null) {
    return;
  }
  contenedorListaGuardadas.innerHTML = generarListaParcelasGuardadasHtml(
    estado.parcelasGuardadas,
    estado.idEnEdicion,
  );
}

/* ── Extracción, validación y precarga del formulario ────────────────── */

/** Lee y valida los datos del formulario; null si algo no pasa la validación. */
function leerDatosParcelaDesdeFormulario(): DatosParcela | null {
  const textos = obtenerTextosActuales();

  if (
    entradaNombre === null ||
    entradaUmbral === null ||
    selectorLocalidad === null ||
    selectorCultivo === null
  ) {
    mostrarErrorFormulario(textos.errorCamposIlegibles);
    return null;
  }

  const nombre = entradaNombre.value.trim();
  const umbralCritico = Number.parseFloat(entradaUmbral.value);
  const localidad = aLocalidad(selectorLocalidad.value);
  const cultivo = aTipoCultivo(selectorCultivo.value);

  if (nombre.length === 0) {
    mostrarErrorFormulario(textos.errorNombreVacio);
    return null;
  }
  if (Number.isNaN(umbralCritico)) {
    mostrarErrorFormulario(textos.errorUmbralNoNumerico);
    return null;
  }
  if (umbralCritico < -5 || umbralCritico > 10) {
    mostrarErrorFormulario(textos.errorUmbralFueraDeRango);
    return null;
  }
  if (localidad === null || cultivo === null) {
    mostrarErrorFormulario(textos.errorSeleccionInvalida);
    return null;
  }

  mostrarErrorFormulario("");

  return { nombre, cultivo, localidad, umbralCritico };
}

/** Precarga el formulario con una parcela ya guardada (ver / editar). */
function cargarParcelaEnFormulario(parcela: Parcela): void {
  if (entradaNombre !== null) {
    entradaNombre.value = parcela.nombre;
  }
  if (selectorLocalidad !== null) {
    selectorLocalidad.value = parcela.localidad;
  }
  if (selectorCultivo !== null) {
    selectorCultivo.value = parcela.cultivo;
  }
  if (entradaUmbral !== null) {
    entradaUmbral.value = parcela.umbralCritico.toString();
  }
  mostrarErrorFormulario("");
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

/**
 * Ciclo completo de la Integración Full-Stack: persiste la parcela en el
 * microservicio (POST si es nueva, PUT si se está editando una guardada) y,
 * solo si eso tiene éxito, dispara la consulta del pronóstico. Un fallo del
 * backend detiene el flujo aquí — nunca se llama a Open-Meteo con datos que
 * no quedaron guardados.
 */
async function guardarYConsultar(datos: DatosParcela): Promise<void> {
  estado.estadoPronostico = EstadoSolicitud.CARGANDO;
  estado.estadoAlerta = EstadoSolicitud.INACTIVO;
  renderEstadoAlerta("", TonoMensaje.NEUTRO);
  renderEstadoPronostico();

  try {
    const idEditado = estado.idEnEdicion;
    const parcela =
      idEditado === null
        ? await guardarParcela(datos)
        : await actualizarParcelaGuardada(idEditado, datos);

    estado.idEnEdicion = null;
    await cargarParcelasGuardadas();
    await consultarPronostico(parcela);
  } catch (error: unknown) {
    console.error("Fallo al guardar la parcela:", error);
    estado.estadoPronostico = EstadoSolicitud.ERROR;
    renderEstadoPronostico(describirError(error));
  }
}

/** GET al backend: refresca la lista de parcelas guardadas (rama "leer" del ciclo de dato). */
async function cargarParcelasGuardadas(): Promise<void> {
  try {
    estado.parcelasGuardadas = await listarParcelasGuardadas();
    if (bloqueErrorGuardadas !== null) {
      bloqueErrorGuardadas.textContent = "";
    }
  } catch (error: unknown) {
    console.error("Fallo al listar las parcelas guardadas:", error);
    if (bloqueErrorGuardadas !== null) {
      bloqueErrorGuardadas.textContent = describirError(error);
    }
  }
  renderListaGuardadas();
}

async function eliminarGuardada(id: string): Promise<void> {
  try {
    await eliminarParcelaGuardada(id);
    if (estado.idEnEdicion === id) {
      estado.idEnEdicion = null;
      renderEstadoPronostico();
    }
    await cargarParcelasGuardadas();
  } catch (error: unknown) {
    console.error("Fallo al eliminar la parcela:", error);
    if (bloqueErrorGuardadas !== null) {
      bloqueErrorGuardadas.textContent = describirError(error);
    }
  }
}

async function activarAlerta(): Promise<void> {
  if (estado.parcela === null) {
    return;
  }
  const textos = obtenerTextosActuales();

  // Validación en el cliente: evita un viaje al servicio si el correo no sirve.
  const email = entradaEmail === null ? "" : entradaEmail.value.trim();

  if (email.length === 0) {
    estado.estadoAlerta = EstadoSolicitud.ERROR;
    renderEstadoAlerta(textos.errorEmailVacio, TonoMensaje.ERROR);
    entradaEmail?.focus();
    return;
  }
  if (!esEmailValido(email)) {
    estado.estadoAlerta = EstadoSolicitud.ERROR;
    renderEstadoAlerta(textos.errorEmailInvalido, TonoMensaje.ERROR);
    entradaEmail?.focus();
    return;
  }

  estado.estadoAlerta = EstadoSolicitud.CARGANDO;
  renderEstadoAlerta(textos.alertaEnviando, TonoMensaje.NEUTRO);

  try {
    const confirmacion = await registrarAlerta(estado.parcela, estado.dias, email);
    estado.estadoAlerta = EstadoSolicitud.EXITO;
    renderEstadoAlerta(
      `${confirmacion.mensaje}${textos.alertaFolio(confirmacion.folio)}`,
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

    const datos = leerDatosParcelaDesdeFormulario();
    if (datos === null) {
      return;
    }

    void guardarYConsultar(datos);
  });

  // Validación reactiva: el error del formulario se retira apenas el usuario
  // vuelve a escribir, en vez de quedarse hasta el siguiente envío.
  formularioParcela.addEventListener("input", () => {
    mostrarErrorFormulario("");
  });
}

if (botonCancelarEdicion !== null) {
  botonCancelarEdicion.addEventListener("click", () => {
    estado.idEnEdicion = null;
    formularioParcela?.reset();
    mostrarErrorFormulario("");
    renderEstadoPronostico();
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

// Un único listener delegado en el <ul>: cada botón trae su acción y su id
// en data-attributes, así que no hace falta engancharse fila por fila cada
// vez que la lista se repinta.
if (contenedorListaGuardadas !== null) {
  contenedorListaGuardadas.addEventListener("click", (evento: Event) => {
    const objetivo = evento.target;
    if (!(objetivo instanceof Element)) {
      return;
    }
    const boton = objetivo.closest("button[data-accion]");
    if (!(boton instanceof HTMLButtonElement)) {
      return;
    }
    const id = boton.dataset["id"];
    const accion = boton.dataset["accion"];
    if (id === undefined || accion === undefined) {
      return;
    }
    const parcela = estado.parcelasGuardadas.find((candidata) => candidata.id === id);
    if (parcela === undefined) {
      return;
    }

    if (accion === "ver") {
      estado.idEnEdicion = null;
      cargarParcelaEnFormulario(parcela);
      void consultarPronostico(parcela);
    } else if (accion === "editar") {
      estado.idEnEdicion = parcela.id;
      cargarParcelaEnFormulario(parcela);
      renderEstadoPronostico();
      entradaNombre?.focus();
    } else if (accion === "eliminar") {
      void eliminarGuardada(parcela.id);
    }
  });
}

// Selector de idioma: dos botones, uno por idioma. `establecerIdioma` no hace
// nada si ya es el idioma activo, así que no hace falta comprobarlo acá.
botonIdiomaEs?.addEventListener("click", () => establecerIdioma("es"));
botonIdiomaEn?.addEventListener("click", () => establecerIdioma("en"));

// Cuando el idioma cambia: se traduce todo el marcado estático, se
// sincronizan los botones cuyo texto depende del idioma, y se regenera todo
// el contenido dinámico que se puede reconstruir sin perder información
// (lista guardada, tarjetas del pronóstico, resumen). Un mensaje de error o
// de confirmación que ya se mostró (formulario, alerta) se deja tal cual: no
// hay forma de "retraducir" un texto ya renderizado sin guardar también su
// forma cruda, y perderlo sería peor que dejarlo en el idioma en que salió.
alCambiarIdioma((idioma) => {
  document.documentElement.lang = idioma === "es" ? "es-CL" : "en";
  aplicarTextosEstaticos();
  sincronizarBotonesIdioma();
  sincronizarBotonConsultar();
  sincronizarBotonAlerta();
  renderListaGuardadas();
  if (estado.estadoPronostico !== EstadoSolicitud.ERROR) {
    renderEstadoPronostico();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  if (capaNevada !== null) {
    capaNevada.innerHTML = generarNevadaHtml();
  }
  document.documentElement.lang = obtenerIdioma() === "es" ? "es-CL" : "en";
  aplicarTextosEstaticos();
  sincronizarBotonesIdioma();
  renderEstadoPronostico();
  void cargarParcelasGuardadas();
});

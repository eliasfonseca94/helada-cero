/**
 * Todo el texto visible de la interfaz, en los dos idiomas soportados.
 * Ningún componente ni servicio escribe una cadena de UI a mano: la pide acá
 * con `obtenerTextosActuales()`. Así, cambiar de idioma es tan simple como
 * cambiar qué objeto de este archivo se está leyendo — nada más se recalcula
 * a mano en ningún otro archivo.
 */
import type { Localidad, TipoCultivo } from "../models/parcela";
import { Localidad as EnumLocalidad, TipoCultivo as EnumTipoCultivo } from "../models/parcela";
import type { NivelRiesgo } from "../models/pronostico";
import { NivelRiesgo as EnumNivelRiesgo } from "../models/pronostico";
import { obtenerIdioma } from "./idioma";

export interface Textos {
  /* ── Documento y cabecera ─────────────────────────────────────────── */
  tituloDocumento: string;
  descripcionDocumento: string;
  cabeceraEyebrow: string;
  cabeceraBajada: string;

  /* ── Formulario ───────────────────────────────────────────────────── */
  tituloFormulario: string;
  labelNombre: string;
  placeholderNombre: string;
  labelLocalidad: string;
  labelCultivo: string;
  cultivos: Record<TipoCultivo, string>;
  labelUmbral: string;
  ayudaUmbral: string;
  botonGuardar: string;
  botonActualizar: string;
  botonGuardando: string;
  botonCancelarEdicion: string;

  /* ── Validación del formulario ───────────────────────────────────── */
  errorCamposIlegibles: string;
  errorNombreVacio: string;
  errorUmbralNoNumerico: string;
  errorUmbralFueraDeRango: string;
  errorSeleccionInvalida: string;

  /* ── Parcelas guardadas ───────────────────────────────────────────── */
  tituloGuardadas: string;
  guardadasVacio: string;
  accionVer: string;
  accionEditar: string;
  accionEliminar: string;

  /* ── Resultados / pronóstico ──────────────────────────────────────── */
  tituloResultados: string;
  resultadosVacio: string;
  resultadosCargando: string;
  errorSolicitudTitulo: string;
  diaMaximaEtiqueta: (valorFormateado: string) => string;
  resumenNivelMaximo: string;
  resumenVeredictoSinNoches: string;
  resumenVeredictoConNoches: (noches: number, umbralCritico: number) => string;
  riesgos: Record<NivelRiesgo, string>;
  localidades: Record<Localidad, string>;

  /* ── Alerta por correo ────────────────────────────────────────────── */
  labelEmail: string;
  placeholderEmail: string;
  ayudaEmail: string;
  botonActivarAlerta: string;
  botonRegistrandoAlerta: string;
  errorEmailVacio: string;
  errorEmailInvalido: string;
  alertaEnviando: string;
  alertaConfirmacion: (email: string, nochesEnRiesgo: number, umbralCritico: number, nombreParcela: string) => string;
  alertaFolio: (folio: string) => string;

  /* ── Pie de página ────────────────────────────────────────────────── */
  pieHtml: string;

  /* ── Mensajes de error compartidos (servicios) ───────────────────── */
  errorSinConexion: string;
  errorInesperado: string;
  errorServidorSinRespuesta: string;
  climaErrorRechazo: (razon: string) => string;
  climaErrorHttp: (status: number) => string;
  climaErrorFormatoInvalido: string;
  climaErrorSinTemperaturas: string;
  apiErrorHttp: (status: number) => string;
  apiErrorListaInvalida: string;
  apiErrorParcelaInvalida: string;
  apiErrorEnumDesconocido: string;
  alertaErrorEmailRechazado: string;
  alertaErrorSinNochesRiesgo: string;
}

const CULTIVOS_ES: Record<TipoCultivo, string> = {
  [EnumTipoCultivo.HORTALIZA]: "Hortaliza",
  [EnumTipoCultivo.FRUTAL]: "Frutal",
  [EnumTipoCultivo.PRADERA]: "Pradera",
  [EnumTipoCultivo.CEREAL]: "Cereal",
};

const CULTIVOS_EN: Record<TipoCultivo, string> = {
  [EnumTipoCultivo.HORTALIZA]: "Vegetable",
  [EnumTipoCultivo.FRUTAL]: "Fruit tree",
  [EnumTipoCultivo.PRADERA]: "Pasture",
  [EnumTipoCultivo.CEREAL]: "Grain",
};

// Freire, Temuco, Lautaro y Villarrica son topónimos: no se traducen, son el
// mismo nombre propio en cualquier idioma. Se repite el mapa en ambos
// idiomas de todas formas para que ambos objetos `Textos` sean completos y
// no haya que hacer una excepción especial en los componentes que los leen.
const LOCALIDADES: Record<Localidad, string> = {
  [EnumLocalidad.FREIRE]: "Freire",
  [EnumLocalidad.TEMUCO]: "Temuco",
  [EnumLocalidad.LAUTARO]: "Lautaro",
  [EnumLocalidad.VILLARRICA]: "Villarrica",
};

const RIESGOS_ES: Record<NivelRiesgo, string> = {
  [EnumNivelRiesgo.SEGURO]: "Sin riesgo",
  [EnumNivelRiesgo.VIGILANCIA]: "Vigilancia",
  [EnumNivelRiesgo.RIESGO]: "Riesgo",
  [EnumNivelRiesgo.HELADA]: "Helada",
};

const RIESGOS_EN: Record<NivelRiesgo, string> = {
  [EnumNivelRiesgo.SEGURO]: "Safe",
  [EnumNivelRiesgo.VIGILANCIA]: "Watch",
  [EnumNivelRiesgo.RIESGO]: "At risk",
  [EnumNivelRiesgo.HELADA]: "Frost",
};

const ES: Textos = {
  tituloDocumento: "Helada Cero · Alerta de heladas para la Araucanía",
  descripcionDocumento:
    "Consulta el pronóstico de mínimas de 7 días y detecta las noches que ponen en riesgo tu cultivo.",
  cabeceraEyebrow: "Estación de pronóstico · Región de La Araucanía",
  cabeceraBajada:
    "Ingresa tu parcela y su umbral crítico. Te muestro las mínimas de los próximos siete días y marco las noches en que el cultivo queda expuesto.",

  tituloFormulario: "Datos de la parcela",
  labelNombre: "Nombre de la parcela",
  placeholderNombre: "Potrero norte",
  labelLocalidad: "Localidad",
  labelCultivo: "Cultivo",
  cultivos: CULTIVOS_ES,
  labelUmbral: "Umbral crítico (°C)",
  ayudaUmbral: "Temperatura mínima bajo la cual tu cultivo sufre daño.",
  botonGuardar: "Guardar y ver pronóstico",
  botonActualizar: "Actualizar y ver pronóstico",
  botonGuardando: "Guardando…",
  botonCancelarEdicion: "Cancelar edición",

  errorCamposIlegibles: "No se pudieron leer los campos del formulario. Recarga la página.",
  errorNombreVacio: "Ponle un nombre a la parcela para identificar la alerta.",
  errorUmbralNoNumerico: "Ingresa el umbral crítico en grados Celsius.",
  errorUmbralFueraDeRango: "El umbral crítico debe estar entre -5 °C y 10 °C.",
  errorSeleccionInvalida: "Selecciona una localidad y un cultivo válidos.",

  tituloGuardadas: "Parcelas guardadas",
  guardadasVacio: "Aún no has guardado ninguna parcela.",
  accionVer: "Ver pronóstico",
  accionEditar: "Editar",
  accionEliminar: "Eliminar",

  tituloResultados: "Pronóstico de mínimas",
  resultadosVacio: "Sin consulta todavía. Completa el formulario para traer los datos.",
  resultadosCargando: "Guardando la parcela y consultando las mínimas de los próximos 7 días…",
  errorSolicitudTitulo: "No se pudo completar la solicitud",
  diaMaximaEtiqueta: (valor) => `máx ${valor} °C`,
  resumenNivelMaximo: "Nivel máximo:",
  resumenVeredictoSinNoches: "Ninguna noche baja del umbral en los próximos 7 días.",
  resumenVeredictoConNoches: (noches, umbral) =>
    `${noches} noche(s) bajo ${umbral} °C en los próximos 7 días.`,
  riesgos: RIESGOS_ES,
  localidades: LOCALIDADES,

  labelEmail: "Ingresa tu mail para recibir las alertas vía email",
  placeholderEmail: "tu.correo@ejemplo.cl",
  ayudaEmail: "Te escribimos a esa dirección cada noche que quede bajo tu umbral crítico.",
  botonActivarAlerta: "Activar aviso de helada",
  botonRegistrandoAlerta: "Registrando…",
  errorEmailVacio: "Ingresa tu mail para recibir las alertas vía email.",
  errorEmailInvalido: "Ese correo no tiene un formato válido. Ejemplo: nombre@dominio.cl",
  alertaEnviando: "Enviando la suscripción al servicio de avisos…",
  alertaConfirmacion: (email, noches, umbral, nombreParcela) =>
    `Listo: enviaremos a ${email} el aviso de ${noches} noche(s) bajo ${umbral} °C en ${nombreParcela}.`,
  alertaFolio: (folio) => ` Folio ${folio}.`,

  pieHtml:
    'Datos meteorológicos de <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a> bajo licencia CC BY 4.0.',

  errorSinConexion: "No hay conexión con el servidor. Revisa tu red y reintenta.",
  errorInesperado: "Ocurrió un fallo inesperado al procesar la solicitud.",
  errorServidorSinRespuesta: "El servidor presenta problemas, vuelve a intentarlo mas tarde",
  climaErrorRechazo: (razon) => `El servicio meteorológico rechazó la consulta: ${razon}`,
  climaErrorHttp: (status) =>
    `El servicio meteorológico respondió con código ${status}. Reintenta en unos minutos.`,
  climaErrorFormatoInvalido: "La respuesta del servicio no trae datos diarios utilizables.",
  climaErrorSinTemperaturas: "No hay temperaturas disponibles para esta coordenada.",
  apiErrorHttp: (status) => `El servidor respondió con código ${status}. Reintenta en unos minutos.`,
  apiErrorListaInvalida: "La respuesta del servidor no trae una lista de parcelas utilizable.",
  apiErrorParcelaInvalida: "El servidor no devolvió una parcela utilizable.",
  apiErrorEnumDesconocido: "El servidor devolvió una parcela con un cultivo o localidad desconocidos.",
  alertaErrorEmailRechazado:
    "El servicio de correo rechazó la dirección. Revisa que esté bien escrita e inténtalo de nuevo.",
  alertaErrorSinNochesRiesgo:
    "No hay días bajo el umbral en esta ventana. La alerta no se registró porque no habría nada que notificar.",
};

const EN: Textos = {
  tituloDocumento: "Helada Cero · Frost alerts for the Araucanía",
  descripcionDocumento:
    "Check the 7-day minimum-temperature forecast and spot the nights that put your crop at risk.",
  cabeceraEyebrow: "Forecast station · Araucanía Region",
  cabeceraBajada:
    "Enter your plot and its critical threshold. I'll show you the minimums for the next seven days and flag the nights the crop is exposed.",

  tituloFormulario: "Plot details",
  labelNombre: "Plot name",
  placeholderNombre: "North paddock",
  labelLocalidad: "Town",
  labelCultivo: "Crop",
  cultivos: CULTIVOS_EN,
  labelUmbral: "Critical threshold (°C)",
  ayudaUmbral: "Minimum temperature below which your crop is damaged.",
  botonGuardar: "Save and view forecast",
  botonActualizar: "Update and view forecast",
  botonGuardando: "Saving…",
  botonCancelarEdicion: "Cancel edit",

  errorCamposIlegibles: "The form fields couldn't be read. Reload the page.",
  errorNombreVacio: "Give the plot a name so the alert can be identified.",
  errorUmbralNoNumerico: "Enter the critical threshold in degrees Celsius.",
  errorUmbralFueraDeRango: "The critical threshold must be between -5 °C and 10 °C.",
  errorSeleccionInvalida: "Select a valid town and crop.",

  tituloGuardadas: "Saved plots",
  guardadasVacio: "You haven't saved any plot yet.",
  accionVer: "View forecast",
  accionEditar: "Edit",
  accionEliminar: "Delete",

  tituloResultados: "Minimum forecast",
  resultadosVacio: "No forecast yet. Fill out the form to get the data.",
  resultadosCargando: "Saving the plot and fetching the minimums for the next 7 days…",
  errorSolicitudTitulo: "The request could not be completed",
  diaMaximaEtiqueta: (valor) => `max ${valor} °C`,
  resumenNivelMaximo: "Highest level:",
  resumenVeredictoSinNoches: "No night drops below the threshold in the next 7 days.",
  resumenVeredictoConNoches: (noches, umbral) =>
    `${noches} night(s) below ${umbral} °C in the next 7 days.`,
  riesgos: RIESGOS_EN,
  localidades: LOCALIDADES,

  labelEmail: "Enter your email to receive frost alerts",
  placeholderEmail: "your.email@example.com",
  ayudaEmail: "We'll write to that address every night that falls below your critical threshold.",
  botonActivarAlerta: "Enable frost alert",
  botonRegistrandoAlerta: "Submitting…",
  errorEmailVacio: "Enter your email to receive the alerts.",
  errorEmailInvalido: "That email isn't valid. Example: name@domain.com",
  alertaEnviando: "Submitting your subscription to the alert service…",
  alertaConfirmacion: (email, noches, umbral, nombreParcela) =>
    `Done: we'll email ${email} the alert for ${noches} night(s) below ${umbral} °C at ${nombreParcela}.`,
  alertaFolio: (folio) => ` Reference ${folio}.`,

  pieHtml:
    'Weather data from <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a> under a CC BY 4.0 license.',

  errorSinConexion: "There's no connection to the server. Check your network and try again.",
  errorInesperado: "An unexpected error occurred while processing the request.",
  errorServidorSinRespuesta: "The server is having trouble, try again in a moment",
  climaErrorRechazo: (razon) => `The weather service rejected the request: ${razon}`,
  climaErrorHttp: (status) => `The weather service responded with code ${status}. Try again in a few minutes.`,
  climaErrorFormatoInvalido: "The service response doesn't include usable daily data.",
  climaErrorSinTemperaturas: "No temperatures are available for this location.",
  apiErrorHttp: (status) => `The server responded with code ${status}. Try again in a few minutes.`,
  apiErrorListaInvalida: "The server's response didn't include a usable list of plots.",
  apiErrorParcelaInvalida: "The server didn't return a usable plot.",
  apiErrorEnumDesconocido: "The server returned a plot with an unknown crop or town.",
  alertaErrorEmailRechazado: "The mail service rejected the address. Check it's typed correctly and try again.",
  alertaErrorSinNochesRiesgo:
    "No days fall below the threshold in this window. The alert wasn't registered because there'd be nothing to notify.",
};

const DICCIONARIOS = { es: ES, en: EN } as const;

/** Textos del idioma activo en este momento (ver `i18n/idioma.ts`). */
export function obtenerTextosActuales(): Textos {
  return DICCIONARIOS[obtenerIdioma()];
}

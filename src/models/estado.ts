/**
 * Estados posibles de cualquier operación asíncrona de la aplicación.
 * Se usa un enum en vez de banderas booleanas sueltas (`cargando`, `hayError`)
 * para que sea imposible representar un estado contradictorio.
 */
export enum EstadoSolicitud {
  INACTIVO = "INACTIVO",
  CARGANDO = "CARGANDO",
  EXITO = "EXITO",
  ERROR = "ERROR",
}

/**
 * Tono visual de un mensaje de retroalimentación.
 * Viaja al DOM como `data-tono` y el color lo resuelve el CSS. Es un enum y no
 * una cadena libre ni un `boolean esError`: el tono es un estado de la interfaz
 * y los estados de esta aplicación se modelan con enumeraciones.
 */
export enum TonoMensaje {
  NEUTRO = "NEUTRO",
  EXITO = "EXITO",
  ERROR = "ERROR",
}

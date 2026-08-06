/**
 * Escapado de texto para interpolación segura en plantillas HTML.
 *
 * Los componentes arman marcado con plantillas de cadena, así que todo dato que
 * no sea una constante del código —lo que escribe el usuario y lo que devuelve
 * la API— tiene que pasar por aquí antes de entrar al DOM. Sin esto, una parcela
 * llamada `<img src=x onerror=alert(1)>` ejecutaría código al renderizar.
 */

const REEMPLAZOS: Readonly<Record<string, string>> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escaparHtml(valor: string): string {
  return valor.replace(/[&<>"']/g, (caracter) => REEMPLAZOS[caracter] ?? caracter);
}

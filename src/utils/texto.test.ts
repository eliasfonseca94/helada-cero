import { describe, expect, it } from "vitest";
import { escaparHtml } from "./texto";

describe("escaparHtml", () => {
  it("neutraliza una etiqueta con manejador de evento inyectado", () => {
    expect(escaparHtml('<img src=x onerror="alert(1)">')).toBe(
      "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;",
    );
  });

  it("escapa comillas simples y el símbolo &", () => {
    expect(escaparHtml(`O'Higgins & Cía`)).toBe("O&#39;Higgins &amp; Cía");
  });

  it("deja intacto un texto sin caracteres especiales", () => {
    expect(escaparHtml("Parcela Los Álamos")).toBe("Parcela Los Álamos");
  });

  it("devuelve una cadena vacía para una entrada vacía", () => {
    expect(escaparHtml("")).toBe("");
  });
});

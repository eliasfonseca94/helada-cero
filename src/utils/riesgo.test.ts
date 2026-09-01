import { describe, expect, it } from "vitest";
import { NivelRiesgo } from "../models/pronostico";
import { clasificarRiesgo, formatearFecha, riesgoMasAlto } from "./riesgo";
import { establecerIdioma } from "../i18n/idioma";

describe("clasificarRiesgo", () => {
  it("clasifica como HELADA cualquier mínima <= 0°C, sin importar el umbral", () => {
    expect(clasificarRiesgo(0, -5)).toBe(NivelRiesgo.HELADA);
    expect(clasificarRiesgo(-3, -10)).toBe(NivelRiesgo.HELADA);
  });

  it("clasifica como RIESGO cuando la mínima cae en o bajo el umbral (pero sobre 0°C)", () => {
    expect(clasificarRiesgo(2, 2)).toBe(NivelRiesgo.RIESGO);
    expect(clasificarRiesgo(1.5, 2)).toBe(NivelRiesgo.RIESGO);
  });

  it("clasifica como VIGILANCIA dentro del margen de anticipación (umbral + 3°C)", () => {
    expect(clasificarRiesgo(5, 2)).toBe(NivelRiesgo.VIGILANCIA);
    expect(clasificarRiesgo(4.9, 2)).toBe(NivelRiesgo.VIGILANCIA);
  });

  it("clasifica como SEGURO fuera del margen de vigilancia", () => {
    expect(clasificarRiesgo(5.1, 2)).toBe(NivelRiesgo.SEGURO);
    expect(clasificarRiesgo(15, 2)).toBe(NivelRiesgo.SEGURO);
  });
});

describe("riesgoMasAlto", () => {
  it("devuelve SEGURO para una lista vacía", () => {
    expect(riesgoMasAlto([])).toBe(NivelRiesgo.SEGURO);
  });

  it("devuelve el nivel más severo presente en la lista, sin importar el orden", () => {
    expect(
      riesgoMasAlto([NivelRiesgo.SEGURO, NivelRiesgo.HELADA, NivelRiesgo.VIGILANCIA]),
    ).toBe(NivelRiesgo.HELADA);
    expect(riesgoMasAlto([NivelRiesgo.RIESGO, NivelRiesgo.SEGURO])).toBe(NivelRiesgo.RIESGO);
  });
});

describe("formatearFecha", () => {
  it("formatea en español por defecto", () => {
    establecerIdioma("es");
    // 2026-08-07 es viernes.
    expect(formatearFecha("2026-08-07")).toMatch(/ago/i);
  });

  it("formatea en inglés cuando el idioma activo es 'en'", () => {
    establecerIdioma("en");
    expect(formatearFecha("2026-08-07")).toMatch(/aug/i);
    establecerIdioma("es"); // deja el estado global como lo encontró.
  });

  it("devuelve la fecha ISO tal cual si viene incompleta o corrupta", () => {
    expect(formatearFecha("2026-08")).toBe("2026-08");
  });
});

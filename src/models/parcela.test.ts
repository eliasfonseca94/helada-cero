import { describe, expect, it } from "vitest";
import { aLocalidad, aTipoCultivo, Localidad, TipoCultivo } from "./parcela";

describe("aLocalidad", () => {
  it("acepta cualquier miembro válido del enum", () => {
    expect(aLocalidad("FREIRE")).toBe(Localidad.FREIRE);
    expect(aLocalidad("VILLARRICA")).toBe(Localidad.VILLARRICA);
  });

  it("rechaza una cadena que no pertenece al enum, sin lanzar", () => {
    expect(aLocalidad("SANTIAGO")).toBeNull();
    expect(aLocalidad("")).toBeNull();
    expect(aLocalidad("freire")).toBeNull(); // sensible a mayúsculas: el enum es todo en mayúsculas.
  });
});

describe("aTipoCultivo", () => {
  it("acepta cualquier miembro válido del enum", () => {
    expect(aTipoCultivo("FRUTAL")).toBe(TipoCultivo.FRUTAL);
    expect(aTipoCultivo("CEREAL")).toBe(TipoCultivo.CEREAL);
  });

  it("rechaza una cadena que no pertenece al enum, sin lanzar", () => {
    expect(aTipoCultivo("VIÑA")).toBeNull();
    expect(aTipoCultivo("")).toBeNull();
  });
});

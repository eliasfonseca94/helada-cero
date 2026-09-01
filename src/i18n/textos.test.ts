import { describe, expect, it } from "vitest";
import { alCambiarIdioma, establecerIdioma, obtenerIdioma } from "./idioma";
import { obtenerTextosActuales } from "./textos";

describe("obtenerTextosActuales", () => {
  it("devuelve textos distintos en español y en inglés para la misma clave", () => {
    establecerIdioma("es");
    const es = obtenerTextosActuales();
    establecerIdioma("en");
    const en = obtenerTextosActuales();

    expect(es.tituloFormulario).not.toBe(en.tituloFormulario);
    expect(es.botonGuardar).not.toBe(en.botonGuardar);

    establecerIdioma("es"); // deja el estado global como lo encontró.
  });

  it("ES y EN exponen exactamente el mismo conjunto de claves", () => {
    // Guarda contra el error más común al agregar un texto nuevo: traducirlo
    // solo en un idioma y que el otro quede con `undefined` en producción.
    establecerIdioma("es");
    const clavesEs = Object.keys(obtenerTextosActuales()).sort();
    establecerIdioma("en");
    const clavesEn = Object.keys(obtenerTextosActuales()).sort();
    establecerIdioma("es");

    expect(clavesEn).toEqual(clavesEs);
  });

  it("los topónimos (Localidad) son idénticos en ambos idiomas: son nombres propios", () => {
    establecerIdioma("es");
    const localidadesEs = obtenerTextosActuales().localidades;
    establecerIdioma("en");
    const localidadesEn = obtenerTextosActuales().localidades;
    establecerIdioma("es");

    expect(localidadesEn).toEqual(localidadesEs);
  });
});

describe("idioma (estado global)", () => {
  it("por defecto es español si no hay nada guardado", () => {
    expect(obtenerIdioma()).toBe("es");
  });

  it("no dispara a los suscriptores si se establece el mismo idioma que ya está activo", () => {
    establecerIdioma("es");
    let veces = 0;
    // No hay forma de desuscribirse en la API actual: el listener queda
    // registrado para el resto de la suite, pero solo cuenta disparos desde
    // este punto en adelante, así que no afecta a los demás tests.
    alCambiarIdioma(() => {
      veces += 1;
    });

    establecerIdioma("es"); // ya es "es": no debería disparar.
    expect(veces).toBe(0);

    establecerIdioma("en");
    expect(veces).toBe(1);

    establecerIdioma("es");
  });
});

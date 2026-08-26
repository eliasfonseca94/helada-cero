package com.heladacero.domain.model;

/**
 * Localidades soportadas en la Región de la Araucanía. Refleja 1:1 el enum
 * {@code Localidad} del frontend (ver {@code src/models/parcela.ts}), incluidas
 * sus coordenadas: son las mismas cuatro que {@code COORDENADAS} en
 * {@code src/models/parcela.ts}.
 *
 * <p>Cada localidad lleva su coordenada consigo en vez de pedírsela al cliente
 * HTTP: el usuario elige una localidad de un selector cerrado, no escribe
 * latitud/longitud a mano. Eso hace imposible una coordenada inválida o que no
 * corresponda a la localidad declarada, y le ahorra al frontend dos campos que
 * de todas formas ya resuelve él mismo con su propio {@code COORDENADAS}.
 */
public enum Localidad {
    FREIRE(-38.954, -72.627),
    TEMUCO(-38.739, -72.598),
    LAUTARO(-38.532, -72.44),
    VILLARRICA(-39.281, -72.227);

    private final Coordenada coordenada;

    Localidad(double latitud, double longitud) {
        this.coordenada = new Coordenada(latitud, longitud);
    }

    public Coordenada coordenada() {
        return coordenada;
    }
}

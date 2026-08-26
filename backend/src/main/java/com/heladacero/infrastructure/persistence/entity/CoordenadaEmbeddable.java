package com.heladacero.infrastructure.persistence.entity;

import jakarta.persistence.Embeddable;

/**
 * Proyección JPA de {@code Coordenada}. Vive como columnas embebidas dentro
 * de {@code parcelas} (latitud, longitud) en vez de una tabla propia: es un
 * valor, no una entidad con identidad propia.
 */
@Embeddable
public class CoordenadaEmbeddable {

    private double latitud;
    private double longitud;

    protected CoordenadaEmbeddable() {
        // Requerido por JPA.
    }

    public CoordenadaEmbeddable(double latitud, double longitud) {
        this.latitud = latitud;
        this.longitud = longitud;
    }

    public double getLatitud() {
        return latitud;
    }

    public double getLongitud() {
        return longitud;
    }
}

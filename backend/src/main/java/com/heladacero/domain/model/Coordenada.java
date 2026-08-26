package com.heladacero.domain.model;

/**
 * Coordenada geográfica WGS84. Record inmutable: una coordenada no se muta,
 * se reemplaza. Refleja la interfaz {@code Coordenada} del frontend.
 */
public record Coordenada(double latitud, double longitud) {
}

package com.heladacero.domain.model;

/**
 * Parcela agrícola monitoreada por el usuario. Modelo de dominio puro: cero
 * anotaciones de JPA, cero anotaciones de Spring Web. La rúbrica del Hito 4
 * exige exactamente esto — la persistencia (infrastructure.persistence) y el
 * transporte HTTP (infrastructure.web) son detalles de infraestructura que no
 * deben filtrarse hacia el dominio.
 *
 * @param id             identificador único (UUID como texto)
 * @param nombre         nombre descriptivo asignado por el usuario
 * @param cultivo        tipo de cultivo plantado en la parcela
 * @param localidad      localidad de la Araucanía donde se ubica
 * @param coordenada     coordenada geográfica usada para consultar el clima
 * @param umbralCritico  temperatura mínima (°C) bajo la cual el cultivo sufre daño
 */
public record Parcela(
        String id,
        String nombre,
        TipoCultivo cultivo,
        Localidad localidad,
        Coordenada coordenada,
        double umbralCritico
) {
}

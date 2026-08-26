package com.heladacero.infrastructure.web.dto;

import com.heladacero.domain.model.Localidad;
import com.heladacero.domain.model.TipoCultivo;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Representación pública de una parcela. Nunca se expone {@code ParcelaEntity}
 * directamente por el controlador: el DTO de salida es el contrato real,
 * independiente de cómo esté modelada la tabla.
 */
public record ParcelaResponse(
        @Schema(example = "a3f1c2d4-5b6e-4f7a-8b9c-0d1e2f3a4b5c") String id,
        @Schema(example = "Parcela Los Álamos") String nombre,
        @Schema(example = "FRUTAL") TipoCultivo cultivo,
        @Schema(example = "FREIRE") Localidad localidad,
        @Schema(example = "-38.954") double latitud,
        @Schema(example = "-72.627") double longitud,
        @Schema(example = "-2.0") double umbralCritico
) {
}

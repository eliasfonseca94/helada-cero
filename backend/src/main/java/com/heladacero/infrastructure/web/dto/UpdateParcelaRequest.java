package com.heladacero.infrastructure.web.dto;

import com.heladacero.domain.model.Localidad;
import com.heladacero.domain.model.TipoCultivo;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Cuerpo esperado por {@code PUT /api/v1/parcelas/{id}}. Reemplaza la parcela
 * completa (semántica PUT), no un parche parcial.
 *
 * <p>No lleva latitud/longitud, por la misma razón que
 * {@link CreateParcelaRequest}: la coordenada la resuelve
 * {@link Localidad#coordenada()} a partir de la localidad elegida.
 */
public record UpdateParcelaRequest(

        @NotBlank(message = "El nombre de la parcela es obligatorio")
        @Schema(example = "Parcela Los Álamos")
        String nombre,

        @NotNull(message = "El cultivo es obligatorio")
        @Schema(example = "FRUTAL")
        TipoCultivo cultivo,

        @NotNull(message = "La localidad es obligatoria")
        @Schema(example = "FREIRE")
        Localidad localidad,

        @NotNull(message = "El umbral crítico es obligatorio")
        @Schema(example = "-2.0", description = "Temperatura mínima (°C) bajo la cual el cultivo sufre daño")
        Double umbralCritico
) {
}

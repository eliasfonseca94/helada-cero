package com.heladacero.infrastructure.web.dto;

import com.heladacero.domain.model.Localidad;
import com.heladacero.domain.model.TipoCultivo;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Cuerpo esperado por {@code POST /api/v1/parcelas}. Las anotaciones
 * {@code jakarta.validation} disparan un HTTP 400 automático (vía
 * {@code @Valid} + {@code GlobalExceptionHandler}) antes de que el request
 * llegue a la capa de aplicación.
 *
 * <p>No lleva latitud/longitud: la coordenada la resuelve el enum
 * {@link Localidad} a partir de la localidad elegida (ver
 * {@link Localidad#coordenada()}). El cliente HTTP nunca puede mandar una
 * coordenada inválida o que no corresponda a la localidad declarada, y son
 * dos campos menos que el usuario tendría que llenar a mano.
 */
public record CreateParcelaRequest(

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

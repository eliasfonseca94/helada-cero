package com.heladacero.infrastructure.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

/**
 * Forma unificada de toda respuesta de error del microservicio. Ningún
 * endpoint devuelve una traza nativa del servidor: todo error de negocio, de
 * validación o inesperado pasa por {@code GlobalExceptionHandler} y sale con
 * esta forma.
 */
public record ErrorResponse(
        @Schema(example = "2026-08-25T10:15:30") LocalDateTime timestamp,
        @Schema(example = "422") int status,
        @Schema(example = "BUSINESS_RULE_VIOLATION") String codigo,
        @Schema(example = "Ya existe una parcela llamada 'Los Álamos' en FREIRE") String mensaje,
        @Schema(example = "/api/v1/parcelas") String ruta
) {
}

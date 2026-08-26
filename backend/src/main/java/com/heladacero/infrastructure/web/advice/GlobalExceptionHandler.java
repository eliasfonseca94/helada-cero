package com.heladacero.infrastructure.web.advice;

import com.heladacero.domain.exception.ParcelaDuplicadaException;
import com.heladacero.domain.exception.ParcelaNoEncontradaException;
import com.heladacero.infrastructure.web.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

/**
 * Interceptor perimetral centralizado. Ningún controlador de este
 * microservicio captura excepciones a mano: todas suben hasta aquí y salen
 * como un {@link ErrorResponse} con código HTTP semántico. Requisito literal
 * del Pilar 1 de la rúbrica del Hito 4 — "cero trazas nativas de servidor".
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ParcelaNoEncontradaException.class)
    public ResponseEntity<ErrorResponse> handleNoEncontrada(ParcelaNoEncontradaException ex,
                                                              HttpServletRequest request) {
        return construir(HttpStatus.NOT_FOUND, "PARCELA_NO_ENCONTRADA", ex.getMessage(), request);
    }

    @ExceptionHandler(ParcelaDuplicadaException.class)
    public ResponseEntity<ErrorResponse> handleDuplicada(ParcelaDuplicadaException ex,
                                                           HttpServletRequest request) {
        return construir(HttpStatus.UNPROCESSABLE_ENTITY, "BUSINESS_RULE_VIOLATION", ex.getMessage(), request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidacion(MethodArgumentNotValidException ex,
                                                            HttpServletRequest request) {
        String mensaje = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> "%s: %s".formatted(error.getField(), error.getDefaultMessage()))
                .collect(Collectors.joining("; "));
        return construir(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", mensaje, request);
    }

    /**
     * Red de seguridad final: cualquier excepción no anticipada se registra
     * en el log del servidor (con traza completa, solo visible ahí) y sale al
     * cliente como un 500 genérico sin detalles internos.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenerica(Exception ex, HttpServletRequest request) {
        log.error("Error no controlado atendiendo {} {}", request.getMethod(), request.getRequestURI(), ex);
        return construir(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR",
                "Ocurrió un error inesperado. Intenta nuevamente más tarde.", request);
    }

    private ResponseEntity<ErrorResponse> construir(HttpStatus status, String codigo, String mensaje,
                                                      HttpServletRequest request) {
        ErrorResponse cuerpo = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                codigo,
                mensaje,
                request.getRequestURI()
        );
        return ResponseEntity.status(status).body(cuerpo);
    }
}

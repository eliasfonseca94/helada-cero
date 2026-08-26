package com.heladacero.domain.exception;

/**
 * Se lanza cuando se pide, actualiza o elimina una parcela cuyo id no existe.
 * El {@code GlobalExceptionHandler} la traduce a HTTP 404.
 */
public class ParcelaNoEncontradaException extends RuntimeException {

    public ParcelaNoEncontradaException(String id) {
        super("No existe una parcela con id '%s'".formatted(id));
    }
}

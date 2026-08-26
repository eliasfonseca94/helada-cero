package com.heladacero.domain.exception;

import com.heladacero.domain.model.Localidad;

/**
 * Regla de negocio: no pueden coexistir dos parcelas con el mismo nombre en
 * la misma localidad (evita que el usuario registre la misma parcela dos
 * veces por error). El {@code GlobalExceptionHandler} la traduce a HTTP 422,
 * el mismo código semántico que usa la guía del Hito 4 para violaciones de
 * regla de negocio (ver {@code OutOfStockException} en el material del curso).
 */
public class ParcelaDuplicadaException extends RuntimeException {

    public ParcelaDuplicadaException(String nombre, Localidad localidad) {
        super("Ya existe una parcela llamada '%s' en %s".formatted(nombre, localidad));
    }
}

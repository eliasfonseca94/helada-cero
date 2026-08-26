package com.heladacero.domain.model;

/**
 * Tipo de cultivo de una parcela. Refleja 1:1 el enum {@code TipoCultivo} del
 * frontend (ver {@code src/models/parcela.ts}) para que ambos lados del
 * contrato hablen el mismo vocabulario sin traducciones intermedias.
 */
public enum TipoCultivo {
    HORTALIZA,
    FRUTAL,
    PRADERA,
    CEREAL
}

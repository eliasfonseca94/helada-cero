package com.heladacero.infrastructure.persistence.mapper;

import com.heladacero.domain.model.Coordenada;
import com.heladacero.domain.model.Parcela;
import com.heladacero.infrastructure.persistence.entity.CoordenadaEmbeddable;
import com.heladacero.infrastructure.persistence.entity.ParcelaEntity;

/**
 * Traduce entre el modelo de dominio ({@code Parcela}) y su representación
 * JPA ({@code ParcelaEntity}). Es el único lugar del backend donde ambos
 * mundos se tocan.
 */
public final class ParcelaEntityMapper {

    private ParcelaEntityMapper() {
    }

    public static ParcelaEntity aEntidad(Parcela parcela) {
        CoordenadaEmbeddable coordenada = new CoordenadaEmbeddable(
                parcela.coordenada().latitud(),
                parcela.coordenada().longitud()
        );
        return new ParcelaEntity(
                parcela.id(),
                parcela.nombre(),
                parcela.cultivo(),
                parcela.localidad(),
                coordenada,
                parcela.umbralCritico()
        );
    }

    public static Parcela aDominio(ParcelaEntity entidad) {
        Coordenada coordenada = new Coordenada(
                entidad.getCoordenada().getLatitud(),
                entidad.getCoordenada().getLongitud()
        );
        return new Parcela(
                entidad.getId(),
                entidad.getNombre(),
                entidad.getCultivo(),
                entidad.getLocalidad(),
                coordenada,
                entidad.getUmbralCritico()
        );
    }
}

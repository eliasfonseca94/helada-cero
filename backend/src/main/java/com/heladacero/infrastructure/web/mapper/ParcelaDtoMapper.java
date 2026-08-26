package com.heladacero.infrastructure.web.mapper;

import com.heladacero.domain.model.Parcela;
import com.heladacero.infrastructure.web.dto.CreateParcelaRequest;
import com.heladacero.infrastructure.web.dto.ParcelaResponse;
import com.heladacero.infrastructure.web.dto.UpdateParcelaRequest;

/**
 * Traduce entre los DTOs HTTP y el modelo de dominio. El id se rellena con un
 * valor vacío en la creación: lo asigna {@code ParcelaService} (UUID), no el
 * cliente HTTP. La coordenada tampoco viaja en el DTO: se resuelve a partir
 * de la localidad elegida ({@code Localidad#coordenada()}).
 */
public final class ParcelaDtoMapper {

    private ParcelaDtoMapper() {
    }

    public static Parcela aDominio(CreateParcelaRequest request) {
        return new Parcela(
                null,
                request.nombre(),
                request.cultivo(),
                request.localidad(),
                request.localidad().coordenada(),
                request.umbralCritico()
        );
    }

    public static Parcela aDominio(UpdateParcelaRequest request) {
        return new Parcela(
                null,
                request.nombre(),
                request.cultivo(),
                request.localidad(),
                request.localidad().coordenada(),
                request.umbralCritico()
        );
    }

    public static ParcelaResponse aRespuesta(Parcela parcela) {
        return new ParcelaResponse(
                parcela.id(),
                parcela.nombre(),
                parcela.cultivo(),
                parcela.localidad(),
                parcela.coordenada().latitud(),
                parcela.coordenada().longitud(),
                parcela.umbralCritico()
        );
    }
}

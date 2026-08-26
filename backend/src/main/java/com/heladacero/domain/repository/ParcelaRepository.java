package com.heladacero.domain.repository;

import com.heladacero.domain.model.Localidad;
import com.heladacero.domain.model.Parcela;

import java.util.List;
import java.util.Optional;

/**
 * Puerto de salida (Clean Architecture): el dominio declara qué necesita de
 * la persistencia sin saber que detrás hay JPA y PostgreSQL. La capa
 * {@code infrastructure.persistence} implementa este contrato; el servicio de
 * aplicación solo conoce esta interfaz.
 */
public interface ParcelaRepository {

    Parcela guardar(Parcela parcela);

    Optional<Parcela> buscarPorId(String id);

    List<Parcela> buscarTodas();

    boolean existePorId(String id);

    /** Excluye {@code idAExcluir} de la búsqueda para permitir renombrar una parcela a su propio nombre. */
    boolean existePorNombreYLocalidad(String nombre, Localidad localidad, String idAExcluir);

    void eliminarPorId(String id);
}

package com.heladacero.infrastructure.persistence;

import com.heladacero.domain.model.Localidad;
import com.heladacero.domain.model.Parcela;
import com.heladacero.domain.repository.ParcelaRepository;
import com.heladacero.infrastructure.persistence.mapper.ParcelaEntityMapper;
import com.heladacero.infrastructure.persistence.repository.ParcelaJpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * Adaptador que implementa el puerto {@link ParcelaRepository} del dominio
 * usando {@link ParcelaJpaRepository}. Es la pieza que "conecta" la
 * arquitectura limpia con Spring Data JPA sin que el dominio lo note.
 */
@Component
public class ParcelaRepositoryAdapter implements ParcelaRepository {

    private final ParcelaJpaRepository jpaRepository;

    public ParcelaRepositoryAdapter(ParcelaJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Parcela guardar(Parcela parcela) {
        var guardada = jpaRepository.save(ParcelaEntityMapper.aEntidad(parcela));
        return ParcelaEntityMapper.aDominio(guardada);
    }

    @Override
    public Optional<Parcela> buscarPorId(String id) {
        return jpaRepository.findById(id).map(ParcelaEntityMapper::aDominio);
    }

    @Override
    public List<Parcela> buscarTodas() {
        return jpaRepository.findAll().stream()
                .map(ParcelaEntityMapper::aDominio)
                .toList();
    }

    @Override
    public boolean existePorId(String id) {
        return jpaRepository.existsById(id);
    }

    @Override
    public boolean existePorNombreYLocalidad(String nombre, Localidad localidad, String idAExcluir) {
        return jpaRepository.existsByNombreYLocalidad(nombre, localidad, idAExcluir);
    }

    @Override
    public void eliminarPorId(String id) {
        jpaRepository.deleteById(id);
    }
}

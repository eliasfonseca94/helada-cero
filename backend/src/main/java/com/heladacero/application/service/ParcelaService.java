package com.heladacero.application.service;

import com.heladacero.domain.exception.ParcelaDuplicadaException;
import com.heladacero.domain.exception.ParcelaNoEncontradaException;
import com.heladacero.domain.model.Parcela;
import com.heladacero.domain.repository.ParcelaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Casos de uso de Parcela. Orquesta las reglas de negocio y delega la
 * persistencia al puerto {@link ParcelaRepository}; no sabe nada de HTTP,
 * JSON ni JPA.
 */
@Service
public class ParcelaService {

    private final ParcelaRepository parcelaRepository;

    public ParcelaService(ParcelaRepository parcelaRepository) {
        this.parcelaRepository = parcelaRepository;
    }

    public Parcela crear(Parcela parcela) {
        validarNoDuplicada(parcela.nombre(), parcela, null);
        Parcela conId = new Parcela(
                UUID.randomUUID().toString(),
                parcela.nombre(),
                parcela.cultivo(),
                parcela.localidad(),
                parcela.coordenada(),
                parcela.umbralCritico()
        );
        return parcelaRepository.guardar(conId);
    }

    public List<Parcela> listarTodas() {
        return parcelaRepository.buscarTodas();
    }

    public Parcela buscarPorId(String id) {
        return parcelaRepository.buscarPorId(id)
                .orElseThrow(() -> new ParcelaNoEncontradaException(id));
    }

    public Parcela actualizar(String id, Parcela cambios) {
        if (!parcelaRepository.existePorId(id)) {
            throw new ParcelaNoEncontradaException(id);
        }
        validarNoDuplicada(cambios.nombre(), cambios, id);
        Parcela actualizada = new Parcela(
                id,
                cambios.nombre(),
                cambios.cultivo(),
                cambios.localidad(),
                cambios.coordenada(),
                cambios.umbralCritico()
        );
        return parcelaRepository.guardar(actualizada);
    }

    public void eliminar(String id) {
        if (!parcelaRepository.existePorId(id)) {
            throw new ParcelaNoEncontradaException(id);
        }
        parcelaRepository.eliminarPorId(id);
    }

    private void validarNoDuplicada(String nombre, Parcela parcela, String idAExcluir) {
        if (parcelaRepository.existePorNombreYLocalidad(nombre, parcela.localidad(), idAExcluir)) {
            throw new ParcelaDuplicadaException(nombre, parcela.localidad());
        }
    }
}

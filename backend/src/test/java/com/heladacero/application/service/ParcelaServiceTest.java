package com.heladacero.application.service;

import com.heladacero.domain.exception.ParcelaDuplicadaException;
import com.heladacero.domain.exception.ParcelaNoEncontradaException;
import com.heladacero.domain.model.Coordenada;
import com.heladacero.domain.model.Localidad;
import com.heladacero.domain.model.Parcela;
import com.heladacero.domain.model.TipoCultivo;
import com.heladacero.domain.repository.ParcelaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Suite de unidad de {@link ParcelaService}: valida el 100% de las reglas de
 * negocio centrales (regla de duplicados, asignación de id, propagación de
 * "no encontrada") con {@link ParcelaRepository} completamente mockeado — no
 * levanta contexto de Spring ni toca una base de datos real.
 */
@ExtendWith(MockitoExtension.class)
class ParcelaServiceTest {

    @Mock
    private ParcelaRepository parcelaRepository;

    private ParcelaService parcelaService;

    private static final Coordenada COORDENADA_FREIRE = new Coordenada(-38.954, -72.627);

    @BeforeEach
    void configurar() {
        parcelaService = new ParcelaService(parcelaRepository);
    }

    private Parcela nuevaParcelaSinId(String nombre, Localidad localidad) {
        return new Parcela(null, nombre, TipoCultivo.FRUTAL, localidad, COORDENADA_FREIRE, -2.0);
    }

    @Nested
    @DisplayName("crear()")
    class Crear {

        @Test
        @DisplayName("asigna un id nuevo y delega la persistencia al repositorio")
        void asignaIdYPersiste() {
            Parcela solicitada = nuevaParcelaSinId("Parcela Los Álamos", Localidad.FREIRE);
            when(parcelaRepository.existePorNombreYLocalidad(eq("Parcela Los Álamos"), eq(Localidad.FREIRE), isNull()))
                    .thenReturn(false);
            when(parcelaRepository.guardar(any(Parcela.class)))
                    .thenAnswer(invocacion -> invocacion.getArgument(0));

            Parcela creada = parcelaService.crear(solicitada);

            assertThat(creada.id()).isNotNull().isNotBlank();
            assertThat(creada.nombre()).isEqualTo("Parcela Los Álamos");

            ArgumentCaptor<Parcela> capturada = ArgumentCaptor.forClass(Parcela.class);
            verify(parcelaRepository).guardar(capturada.capture());
            assertThat(capturada.getValue().id()).isEqualTo(creada.id());
        }

        @Test
        @DisplayName("rechaza con ParcelaDuplicadaException si ya existe una parcela con el mismo nombre y localidad")
        void rechazaDuplicada() {
            Parcela solicitada = nuevaParcelaSinId("Parcela Los Álamos", Localidad.FREIRE);
            when(parcelaRepository.existePorNombreYLocalidad(eq("Parcela Los Álamos"), eq(Localidad.FREIRE), isNull()))
                    .thenReturn(true);

            assertThatThrownBy(() -> parcelaService.crear(solicitada))
                    .isInstanceOf(ParcelaDuplicadaException.class);

            verify(parcelaRepository, never()).guardar(any());
        }
    }

    @Nested
    @DisplayName("buscarPorId()")
    class BuscarPorId {

        @Test
        @DisplayName("retorna la parcela cuando el repositorio la encuentra")
        void retornaParcela() {
            Parcela existente = new Parcela("id-1", "Norte", TipoCultivo.CEREAL, Localidad.LAUTARO, COORDENADA_FREIRE, 0.0);
            when(parcelaRepository.buscarPorId("id-1")).thenReturn(Optional.of(existente));

            assertThat(parcelaService.buscarPorId("id-1")).isEqualTo(existente);
        }

        @Test
        @DisplayName("lanza ParcelaNoEncontradaException cuando no existe")
        void lanzaNoEncontrada() {
            when(parcelaRepository.buscarPorId("inexistente")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> parcelaService.buscarPorId("inexistente"))
                    .isInstanceOf(ParcelaNoEncontradaException.class);
        }
    }

    @Nested
    @DisplayName("actualizar()")
    class Actualizar {

        @Test
        @DisplayName("lanza ParcelaNoEncontradaException si el id no existe")
        void lanzaNoEncontradaSiNoExiste() {
            when(parcelaRepository.existePorId("id-x")).thenReturn(false);
            Parcela cambios = nuevaParcelaSinId("Norte", Localidad.LAUTARO);

            assertThatThrownBy(() -> parcelaService.actualizar("id-x", cambios))
                    .isInstanceOf(ParcelaNoEncontradaException.class);

            verify(parcelaRepository, never()).guardar(any());
        }

        @Test
        @DisplayName("lanza ParcelaDuplicadaException si el nuevo nombre choca con OTRA parcela")
        void lanzaDuplicadaSiChocaConOtra() {
            when(parcelaRepository.existePorId("id-1")).thenReturn(true);
            when(parcelaRepository.existePorNombreYLocalidad("Norte", Localidad.LAUTARO, "id-1"))
                    .thenReturn(true);
            Parcela cambios = nuevaParcelaSinId("Norte", Localidad.LAUTARO);

            assertThatThrownBy(() -> parcelaService.actualizar("id-1", cambios))
                    .isInstanceOf(ParcelaDuplicadaException.class);
        }

        @Test
        @DisplayName("conserva el id original y guarda los campos nuevos")
        void actualizaConservandoId() {
            when(parcelaRepository.existePorId("id-1")).thenReturn(true);
            when(parcelaRepository.existePorNombreYLocalidad("Norte", Localidad.LAUTARO, "id-1"))
                    .thenReturn(false);
            when(parcelaRepository.guardar(any(Parcela.class)))
                    .thenAnswer(invocacion -> invocacion.getArgument(0));

            Parcela cambios = nuevaParcelaSinId("Norte", Localidad.LAUTARO);
            Parcela actualizada = parcelaService.actualizar("id-1", cambios);

            assertThat(actualizada.id()).isEqualTo("id-1");
            assertThat(actualizada.nombre()).isEqualTo("Norte");
        }
    }

    @Nested
    @DisplayName("eliminar()")
    class Eliminar {

        @Test
        @DisplayName("lanza ParcelaNoEncontradaException si el id no existe")
        void lanzaNoEncontrada() {
            when(parcelaRepository.existePorId("fantasma")).thenReturn(false);

            assertThatThrownBy(() -> parcelaService.eliminar("fantasma"))
                    .isInstanceOf(ParcelaNoEncontradaException.class);

            verify(parcelaRepository, never()).eliminarPorId(anyString());
        }

        @Test
        @DisplayName("delega la eliminación al repositorio si el id existe")
        void delegaEliminacion() {
            when(parcelaRepository.existePorId("id-1")).thenReturn(true);

            parcelaService.eliminar("id-1");

            verify(parcelaRepository, times(1)).eliminarPorId("id-1");
        }
    }

    @Test
    @DisplayName("listarTodas() delega directamente en el repositorio")
    void listarTodasDelega() {
        List<Parcela> todas = List.of(nuevaParcelaSinId("A", Localidad.TEMUCO));
        when(parcelaRepository.buscarTodas()).thenReturn(todas);

        assertThat(parcelaService.listarTodas()).isEqualTo(todas);
    }
}

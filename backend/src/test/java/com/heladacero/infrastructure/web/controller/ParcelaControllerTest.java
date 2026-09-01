package com.heladacero.infrastructure.web.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heladacero.application.service.ParcelaService;
import com.heladacero.domain.exception.ParcelaDuplicadaException;
import com.heladacero.domain.exception.ParcelaNoEncontradaException;
import com.heladacero.domain.model.Coordenada;
import com.heladacero.domain.model.Localidad;
import com.heladacero.domain.model.Parcela;
import com.heladacero.domain.model.TipoCultivo;
import com.heladacero.infrastructure.web.dto.CreateParcelaRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Prueba de la capa web: verifica que {@link ParcelaController} traduce cada
 * caso a su código HTTP semántico y que {@code GlobalExceptionHandler} (que
 * {@code @WebMvcTest} carga automáticamente, al ser un {@code @RestControllerAdvice}
 * del mismo árbol de paquetes) intercepta las excepciones de negocio en vez
 * de dejarlas escapar como un 500 con traza nativa.
 */
@WebMvcTest(ParcelaController.class)
@ActiveProfiles("test")
class ParcelaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ParcelaService parcelaService;

    private static final Coordenada COORDENADA = new Coordenada(-38.954, -72.627);

    @Test
    void crear_conDatosValidos_retorna201ConLaParcelaCreada() throws Exception {
        Parcela creada = new Parcela("id-1", "Los Álamos", TipoCultivo.FRUTAL, Localidad.FREIRE, COORDENADA, -2.0);
        when(parcelaService.crear(any(Parcela.class))).thenReturn(creada);

        CreateParcelaRequest cuerpo = new CreateParcelaRequest("Los Álamos", TipoCultivo.FRUTAL, Localidad.FREIRE, -2.0);

        mockMvc.perform(post("/api/v1/parcelas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cuerpo)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("id-1"))
                .andExpect(jsonPath("$.nombre").value("Los Álamos"));
    }

    @Test
    void crear_conNombreVacio_retorna400SinLlegarAlServicio() throws Exception {
        CreateParcelaRequest cuerpoInvalido = new CreateParcelaRequest("", TipoCultivo.FRUTAL, Localidad.FREIRE, -2.0);

        mockMvc.perform(post("/api/v1/parcelas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cuerpoInvalido)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("VALIDATION_ERROR"));
    }

    @Test
    void crear_duplicada_retorna422ConErrorResponse() throws Exception {
        when(parcelaService.crear(any(Parcela.class)))
                .thenThrow(new ParcelaDuplicadaException("Los Álamos", Localidad.FREIRE));

        CreateParcelaRequest cuerpo = new CreateParcelaRequest("Los Álamos", TipoCultivo.FRUTAL, Localidad.FREIRE, -2.0);

        mockMvc.perform(post("/api/v1/parcelas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cuerpo)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.codigo").value("BUSINESS_RULE_VIOLATION"));
    }

    @Test
    void buscarPorId_inexistente_retorna404ConErrorResponse_sinTrazaNativa() throws Exception {
        when(parcelaService.buscarPorId(eq("no-existe")))
                .thenThrow(new ParcelaNoEncontradaException("no-existe"));

        mockMvc.perform(get("/api/v1/parcelas/{id}", "no-existe"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("PARCELA_NO_ENCONTRADA"))
                .andExpect(jsonPath("$.ruta").value("/api/v1/parcelas/no-existe"));
    }

    @Test
    void eliminar_existente_retorna204() throws Exception {
        mockMvc.perform(delete("/api/v1/parcelas/{id}", "id-1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void eliminar_inexistente_retorna404() throws Exception {
        org.mockito.Mockito.doThrow(new ParcelaNoEncontradaException("id-x"))
                .when(parcelaService).eliminar("id-x");

        mockMvc.perform(delete("/api/v1/parcelas/{id}", "id-x"))
                .andExpect(status().isNotFound());
    }
}

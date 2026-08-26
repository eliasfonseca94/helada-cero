package com.heladacero.infrastructure.web.controller;

import com.heladacero.application.service.ParcelaService;
import com.heladacero.domain.model.Parcela;
import com.heladacero.infrastructure.web.dto.CreateParcelaRequest;
import com.heladacero.infrastructure.web.dto.ErrorResponse;
import com.heladacero.infrastructure.web.dto.ParcelaResponse;
import com.heladacero.infrastructure.web.dto.UpdateParcelaRequest;
import com.heladacero.infrastructure.web.mapper.ParcelaDtoMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

/**
 * Rutas semánticas de la cartelera de parcelas monitoreadas. Todas las
 * excepciones de negocio o de validación se delegan al
 * {@code GlobalExceptionHandler}; ningún método de este controlador captura
 * excepciones a mano.
 */
@RestController
@RequestMapping("/api/v1/parcelas")
@Tag(name = "Parcelas", description = "Gestión de las parcelas agrícolas monitoreadas contra heladas")
public class ParcelaController {

    private final ParcelaService parcelaService;

    public ParcelaController(ParcelaService parcelaService) {
        this.parcelaService = parcelaService;
    }

    @Operation(
            summary = "Registrar una nueva parcela",
            description = "Persiste la parcela en PostgreSQL y retorna el recurso creado con su id asignado."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Parcela registrada exitosamente",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ParcelaResponse.class))),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "422", description = "Ya existe una parcela con ese nombre en esa localidad",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping
    public ResponseEntity<ParcelaResponse> crear(@Valid @RequestBody CreateParcelaRequest request) {
        Parcela creada = parcelaService.crear(ParcelaDtoMapper.aDominio(request));
        ParcelaResponse cuerpo = ParcelaDtoMapper.aRespuesta(creada);
        return ResponseEntity.created(URI.create("/api/v1/parcelas/" + creada.id())).body(cuerpo);
    }

    @Operation(summary = "Listar todas las parcelas registradas")
    @ApiResponse(responseCode = "200", description = "Listado obtenido correctamente")
    @GetMapping
    public ResponseEntity<List<ParcelaResponse>> listarTodas() {
        List<ParcelaResponse> parcelas = parcelaService.listarTodas().stream()
                .map(ParcelaDtoMapper::aRespuesta)
                .toList();
        return ResponseEntity.ok(parcelas);
    }

    @Operation(summary = "Obtener una parcela por id")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Parcela encontrada"),
            @ApiResponse(responseCode = "404", description = "No existe una parcela con ese id",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/{id}")
    public ResponseEntity<ParcelaResponse> buscarPorId(@PathVariable String id) {
        Parcela parcela = parcelaService.buscarPorId(id);
        return ResponseEntity.ok(ParcelaDtoMapper.aRespuesta(parcela));
    }

    @Operation(
            summary = "Reemplazar una parcela existente",
            description = "Actualiza todos los campos de la parcela identificada por id."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Parcela actualizada"),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos"),
            @ApiResponse(responseCode = "404", description = "No existe una parcela con ese id"),
            @ApiResponse(responseCode = "422", description = "El nuevo nombre choca con otra parcela de la misma localidad")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ParcelaResponse> actualizar(@PathVariable String id,
                                                        @Valid @RequestBody UpdateParcelaRequest request) {
        Parcela actualizada = parcelaService.actualizar(id, ParcelaDtoMapper.aDominio(request));
        return ResponseEntity.ok(ParcelaDtoMapper.aRespuesta(actualizada));
    }

    @Operation(summary = "Eliminar una parcela")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Parcela eliminada"),
            @ApiResponse(responseCode = "404", description = "No existe una parcela con ese id")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        parcelaService.eliminar(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}

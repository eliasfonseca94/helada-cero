package com.heladacero.infrastructure.persistence.entity;

import com.heladacero.domain.model.Localidad;
import com.heladacero.domain.model.TipoCultivo;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Representación JPA de una parcela. Vive exclusivamente en
 * {@code infrastructure.persistence}: el dominio ({@code Parcela}) no sabe
 * que esta clase existe. El id lo asigna la capa de aplicación (UUID) antes
 * de guardar, por eso no lleva {@code @GeneratedValue}.
 */
@Entity
@Table(name = "parcelas")
public class ParcelaEntity {

    @Id
    @Column(length = 36, nullable = false, updatable = false)
    private String id;

    @Column(nullable = false)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoCultivo cultivo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Localidad localidad;

    @Embedded
    private CoordenadaEmbeddable coordenada;

    @Column(name = "umbral_critico", nullable = false)
    private double umbralCritico;

    protected ParcelaEntity() {
        // Requerido por JPA.
    }

    public ParcelaEntity(String id, String nombre, TipoCultivo cultivo, Localidad localidad,
                          CoordenadaEmbeddable coordenada, double umbralCritico) {
        this.id = id;
        this.nombre = nombre;
        this.cultivo = cultivo;
        this.localidad = localidad;
        this.coordenada = coordenada;
        this.umbralCritico = umbralCritico;
    }

    public String getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public TipoCultivo getCultivo() {
        return cultivo;
    }

    public Localidad getLocalidad() {
        return localidad;
    }

    public CoordenadaEmbeddable getCoordenada() {
        return coordenada;
    }

    public double getUmbralCritico() {
        return umbralCritico;
    }
}

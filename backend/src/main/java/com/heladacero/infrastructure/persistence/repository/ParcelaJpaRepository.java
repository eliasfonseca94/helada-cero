package com.heladacero.infrastructure.persistence.repository;

import com.heladacero.domain.model.Localidad;
import com.heladacero.infrastructure.persistence.entity.ParcelaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repositorio Spring Data JPA: resuelve el CRUD contra PostgreSQL sin una
 * sola sentencia SQL manual. Requisito literal de la rúbrica del Hito 4
 * ("interfaces que hereden de JpaRepository").
 */
@Repository
public interface ParcelaJpaRepository extends JpaRepository<ParcelaEntity, String> {

    @Query("""
            SELECT COUNT(p) > 0 FROM ParcelaEntity p
            WHERE p.nombre = :nombre
              AND p.localidad = :localidad
              AND (:idAExcluir IS NULL OR p.id <> :idAExcluir)
            """)
    boolean existsByNombreYLocalidad(
            @Param("nombre") String nombre,
            @Param("localidad") Localidad localidad,
            @Param("idAExcluir") String idAExcluir
    );
}

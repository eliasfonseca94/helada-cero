package com.heladacero.infrastructure.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Habilita CORS solo para {@code /api/**} y solo desde los orígenes
 * explícitamente permitidos. El frontend (Vite, en otro puerto) vive en un
 * origen distinto al del backend, así que sin esto el navegador bloquea toda
 * petición aunque el servidor responda bien.
 *
 * <p>La lista de orígenes nunca queda cableada en el código: viene de
 * {@code app.cors.allowed-origins} (ver {@code application-dev.yml} y
 * {@code application-prod.yml}), la misma disciplina de "todo por variable de
 * entorno" que se aplica a las credenciales de base de datos.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private final String[] origenesPermitidos;

    public CorsConfig(@Value("${app.cors.allowed-origins}") String origenesPermitidos) {
        this.origenesPermitidos = origenesPermitidos.split("\\s*,\\s*");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(origenesPermitidos)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600);
    }
}

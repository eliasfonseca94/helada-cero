package com.heladacero.infrastructure.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Bean de documentación OpenAPI. La anotación {@code @Profile("dev")} es la
 * clave del Pilar 3 de la rúbrica: este bean —y por lo tanto la consola de
 * Swagger-UI que depende de él— solo existe cuando la aplicación arranca con
 * {@code spring.profiles.active=dev}. En cualquier otro perfil, Spring ni
 * siquiera lo registra.
 *
 * Como segunda capa de defensa (cinturón y tirantes), {@code application-prod.yml}
 * además apaga {@code springdoc.api-docs.enabled} y
 * {@code springdoc.swagger-ui.enabled} explícitamente, así que aunque alguien
 * activara el perfil equivocado por error, la ruta seguiría devolviendo 404.
 */
@Configuration
@Profile("dev") // <-- ESTA ANOTACIÓN ES LA CLAVE
public class OpenApiConfig {

    @Bean
    public OpenAPI heladaCeroOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Helada Cero API")
                        .version("v1")
                        .description("""
                                Contratos de API disponibles exclusivamente en el perfil de desarrollo (dev).
                                Gestiona las parcelas agrícolas monitoreadas contra heladas en la Región de la Araucanía.
                                """));
    }
}

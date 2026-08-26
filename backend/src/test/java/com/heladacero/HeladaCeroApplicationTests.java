package com.heladacero;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Prueba de humo: verifica que todo el contexto de Spring —controlador,
 * servicio, adaptador de persistencia y configuración— arranca sin errores
 * de cableado. Corre contra H2 (perfil "test"), no contra PostgreSQL.
 */
@SpringBootTest
@ActiveProfiles("test")
class HeladaCeroApplicationTests {

    @Test
    void elContextoDeSpringLevantaCorrectamente() {
        // Si el contexto no levanta, esta prueba falla antes de llegar aquí.
    }
}

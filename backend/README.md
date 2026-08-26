# Helada Cero — Backend

Microservicio REST que persiste las parcelas agrícolas monitoreadas por [Helada Cero](../README.md) contra heladas en la Región de la Araucanía. Corresponde al **Hito 4**: microservicios con Spring Boot, PostgreSQL y Docker, con contratos documentados en Swagger/OpenAPI.

## Pila tecnológica

- **Java 21** + **Spring Boot 3.3.5**
- **Spring Web** — controladores REST
- **Spring Data JPA** + **PostgreSQL 16** (contenedorizada con Docker Compose)
- **Bean Validation** (`jakarta.validation`) sobre los DTOs de entrada
- **springdoc-openapi** — genera la especificación OpenAPI y la consola Swagger-UI, activa solo en el perfil `dev`
- **H2** (solo en tests) — permite correr `mvn test` sin Docker

## Arquitectura

```
src/main/java/com/heladacero/
├── domain/                 Modelo de negocio puro: cero JPA, cero Spring Web
│   ├── model/                 Parcela, Coordenada, TipoCultivo, Localidad
│   ├── exception/              ParcelaNoEncontradaException, ParcelaDuplicadaException
│   └── repository/             ParcelaRepository (puerto de salida)
├── application/service/     Casos de uso (ParcelaService): orquesta reglas de negocio
└── infrastructure/          Todo lo que sabe de HTTP, JSON, JPA y SQL
    ├── persistence/            ParcelaEntity, ParcelaJpaRepository, ParcelaRepositoryAdapter
    ├── web/controller/         ParcelaController — rutas /api/v1/parcelas
    ├── web/dto/                Request/Response, nunca se expone la entidad JPA
    ├── web/advice/             GlobalExceptionHandler (@RestControllerAdvice)
    └── config/                 OpenApiConfig (@Profile("dev"))
```

El dominio no importa nada de `infrastructure`; `infrastructure.persistence` traduce entre `Parcela` (dominio) y `ParcelaEntity` (JPA) mediante `ParcelaEntityMapper`, y `infrastructure.web` traduce entre `Parcela` y los DTOs HTTP mediante `ParcelaDtoMapper`.

## Cómo levantar todo en desarrollo

1. **Base de datos** (PostgreSQL en Docker):

   ```bash
   docker compose up -d
   ```

2. **Aplicación** (perfil `dev` activo por defecto):

   ```bash
   ./mvnw spring-boot:run
   ```

   En Windows: `mvnw.cmd spring-boot:run`

3. La API queda arriba en `http://localhost:8080`.

## Documentación y pruebas de contratos

- **Swagger-UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api-docs

Ambas rutas solo existen bajo el perfil `dev`. En `prod` (`SPRING_PROFILES_ACTIVE=prod`) están apagadas explícitamente y devuelven 404 — ver [`OpenApiConfig`](src/main/java/com/heladacero/infrastructure/config/OpenApiConfig.java) y [`application-prod.yml`](src/main/resources/application-prod.yml).

Para auditar los endpoints con un cliente HTTP independiente, cualquier colección de Bruno o Postman apuntando a `http://localhost:8080/api/v1/parcelas` sirve; no se incluye una colección versionada en este repositorio (paso opcional según la rúbrica del Hito 4).

## Endpoints

| Verbo    | Ruta                     | Descripción                          | Éxito | Errores      |
|----------|--------------------------|---------------------------------------|-------|--------------|
| `POST`   | `/api/v1/parcelas`       | Registra una parcela                 | 201   | 400, 422     |
| `GET`    | `/api/v1/parcelas`       | Lista todas las parcelas             | 200   | —            |
| `GET`    | `/api/v1/parcelas/{id}`  | Obtiene una parcela por id           | 200   | 404          |
| `PUT`    | `/api/v1/parcelas/{id}`  | Reemplaza una parcela existente      | 200   | 400, 404, 422|
| `DELETE` | `/api/v1/parcelas/{id}`  | Elimina una parcela                  | 204   | 404          |

Todo error sale como un `ErrorResponse` unificado (`timestamp`, `status`, `codigo`, `mensaje`, `ruta`); nunca una traza nativa del servidor — ver [`GlobalExceptionHandler`](src/main/java/com/heladacero/infrastructure/web/advice/GlobalExceptionHandler.java).

## Variables de entorno (perfil `prod`)

| Variable       | Descripción                          |
|----------------|----------------------------------------|
| `DB_HOST`      | Host de la PostgreSQL de producción    |
| `DB_PORT`      | Puerto (por defecto `5432`)            |
| `DB_NAME`      | Nombre de la base de datos             |
| `DB_USERNAME`  | Usuario de la base de datos            |
| `DB_PASSWORD`  | Contraseña de la base de datos         |

En `dev`, estas mismas variables son opcionales: si no se definen, se usan los valores del `docker-compose.yml` (`heladacero_db` / `dev_user` / `SecureDevPassword123`).

## Tests

```bash
./mvnw test
```

Corre contra H2 en memoria (perfil `test`, ver [`application-test.yml`](src/test/resources/application-test.yml)) — no requiere Docker levantado.

## Más detalles

El razonamiento completo de cada decisión, las ganancias frente al enfoque mínimo de la rúbrica y las mejoras posibles quedaron documentados en [`../Detalles.md`](../Detalles.md).

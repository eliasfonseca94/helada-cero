# syntax=docker/dockerfile:1

# ---- Etapa 1: build -------------------------------------------------------
# Compila el jar con Maven. Se separa de la imagen final para que el JDK, el
# repositorio .m2 y el propio Maven no viajen a producción — solo el jar.
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copia primero solo lo necesario para resolver dependencias: si el código
# fuente cambia pero el pom.xml no, Docker reusa la capa de dependencias ya
# descargadas en vez de volver a bajarlas.
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN chmod +x mvnw && ./mvnw -B dependency:go-offline

COPY src src
RUN ./mvnw -B -DskipTests package

# ---- Etapa 2: runtime -------------------------------------------------------
# Solo el JRE (no el JDK completo) y el jar ya compilado.
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# Contenedor no-root: si alguien compromete la aplicación, no hereda
# privilegios de root sobre el host. Ver la pauta de "Contenedores Docker
# Seguros" del material de Buenas Prácticas de Producción del curso.
RUN addgroup -S heladacero && adduser -S heladacero -G heladacero
USER heladacero

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

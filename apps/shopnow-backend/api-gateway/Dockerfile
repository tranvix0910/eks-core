# Stage 1: build
FROM eclipse-temurin:17-jdk-jammy AS builder
WORKDIR /app

COPY mvnw ./
COPY .mvn/ .mvn/
RUN chmod +x mvnw

COPY pom.xml ./
RUN ./mvnw dependency:go-offline -B

COPY src/ src/
RUN ./mvnw clean package -DskipTests -B

# Stage 2: run
FROM eclipse-temurin:17-jre-jammy

# Numeric uid/gid on purpose - see shopnow-shopping-cart-service/Dockerfile.
RUN groupadd -r -g 10001 spring && useradd -r -u 10001 -g spring spring
WORKDIR /app

COPY --from=builder /app/target/api-gateway-0.0.1-SNAPSHOT.war /app/api-gateway.war
RUN chown spring:spring /app/api-gateway.war
USER 10001:10001

EXPOSE 5860

# additional-location + optional: layers the ConfigMap-mounted overrides on
# top of the baked-in defaults instead of replacing them outright - matches
# every other backend service. See shopnow-shopping-cart-service/Dockerfile.
ENTRYPOINT ["java", "-jar", "/app/api-gateway.war", \
  "--spring.config.additional-location=optional:file:/app/config-override/application.properties"]

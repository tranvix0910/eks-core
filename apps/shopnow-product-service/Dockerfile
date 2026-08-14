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

# Numeric uid/gid on purpose. With a named USER, kubelet cannot verify the
# image runs non-root and rejects the pod with "image has non-numeric user
# (spring), cannot verify user is non-root". 10001 also matches the fsGroup the
# Helm chart sets, which is what lets a non-root process write to the EFS volume.
RUN groupadd -r -g 10001 spring && useradd -r -u 10001 -g spring spring
WORKDIR /app

COPY --from=builder /app/target/product-service-0.0.1-SNAPSHOT.war /app/product-service.war
RUN chown spring:spring /app/product-service.war
USER 10001:10001

EXPOSE 5861

# See shopnow-config-server/Dockerfile for why additional-location + optional:,
# not --spring.config.location.
#
# Note this service's own baked-in resources file is application.yaml, not
# application.properties. The override path here is .properties on purpose: it
# has nothing to do with the baked-in file's format, and the Helm chart's
# ConfigMap writes real .properties-syntax content (key=value) at this exact
# path - Spring Boot picks the parser from the override file's own extension.
ENTRYPOINT ["java", "-jar", "/app/product-service.war", \
  "--spring.config.additional-location=optional:file:/app/config-override/application.properties"]

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

COPY --from=builder /app/target/discovery-server-0.0.1-SNAPSHOT.war /app/discovery-server.war
RUN chown spring:spring /app/discovery-server.war
USER 10001:10001

EXPOSE 8761

# See shopnow-config-server/Dockerfile for why additional-location + optional:,
# not --spring.config.location.
ENTRYPOINT ["java", "-jar", "/app/discovery-server.war", \
  "--spring.config.additional-location=optional:file:/app/config-override/application.properties"]

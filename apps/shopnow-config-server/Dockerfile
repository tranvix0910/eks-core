# Stage 1: build
#
# eclipse-temurin, not openjdk - the openjdk Docker Hub images have been
# unmaintained since 2022 and stopped receiving security patches.
FROM eclipse-temurin:17-jdk-jammy AS builder
WORKDIR /app

# mvnw is checked into the repo without the executable bit, so `./mvnw` fails
# with "Permission denied" unless this runs first.
COPY mvnw ./
COPY .mvn/ .mvn/
RUN chmod +x mvnw

# Dependency layer cached separately from source, so editing a .java file does
# not force Maven to re-download the internet on every build.
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

COPY --from=builder /app/target/config-server-0.0.1-SNAPSHOT.war /app/config-server.war
RUN chown spring:spring /app/config-server.war
USER 10001:10001

EXPOSE 5859

# The image ships with the config baked into the WAR's classpath - Spring Boot
# loads that automatically, no flag needed.
#
# spring.config.additional-location ADDS a location on top of that, and
# `optional:` means startup does not fail if the file is absent. That matters
# for this image specifically: it runs both as a plain container (nothing
# mounted there) and inside Kubernetes, where the Helm chart mounts a
# ConfigMap at exactly this path to override values per environment.
#
# The previous version used --spring.config.location, which REPLACES the
# default search locations instead of adding to them - since the runtime image
# never contained the source resources directory, that pointed at a file that
# never existed, and the container could not start under any circumstances.
ENTRYPOINT ["java", "-jar", "/app/config-server.war", \
  "--spring.config.additional-location=optional:file:/app/config-override/application.properties"]

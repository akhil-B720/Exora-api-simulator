# Build Stage
FROM maven:3.9.6-eclipse-temurin-21-jammy AS builder
WORKDIR /workspace
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime Stage
FROM eclipse-temurin:21-jre-jammy
LABEL maintainer="EXORA Platform Engineering Team"
LABEL description="EXORA Mock API Simulation Backend"

RUN groupadd -r exora && useradd -r -g exora exora

WORKDIR /app
COPY --from=builder /workspace/target/exora-backend-1.0.0.jar app.jar
RUN chown -R exora:exora /app

USER exora:exora

EXPOSE 8080

ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"
ENV DB_HOST=mysql
ENV DB_PORT=3306
ENV DB_NAME=exora_db
ENV DB_USERNAME=exora_user
ENV DB_PASSWORD=exora_secure_pass

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]

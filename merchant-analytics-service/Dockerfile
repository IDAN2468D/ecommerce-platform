FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
COPY target/merchant-analytics-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8097
ENTRYPOINT ["java", "-jar", "app.jar"]

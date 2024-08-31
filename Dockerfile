# Use Maven image to build the application
FROM maven:3.8.1-openjdk-11 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Use an official Java runtime as a base image
FROM openjdk:11-jre-slim
WORKDIR /app
COPY --from=build /app/target/devops-demo-0.0.1-SNAPSHOT.jar app.jar

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
EXPOSE 8080
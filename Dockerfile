# Recipe the hosting service follows to build and start the store.
# Stage 1 compiles the Java code; stage 2 is a small image that only runs it.
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY src src
RUN mkdir out && javac --release 21 -encoding UTF-8 -d out $(find src/main/java -name '*.java')

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/out out
COPY src/main/resources res
# Hosts set PORT themselves; 8080 is used when running the image locally.
ENV PORT=8080
EXPOSE 8080
# Run as a normal user rather than root.
RUN useradd --system --no-create-home shop
USER shop
CMD ["java", "-XX:MaxRAMPercentage=75", "-cp", "out:res", "ua.polytsia.App"]

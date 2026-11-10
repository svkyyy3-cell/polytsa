#!/usr/bin/env sh
# Builds and starts the store without Maven: only a JDK 21+ is required.
# Usage: ./run.sh            (http://localhost:8080)
#        PORT=9000 ./run.sh
set -e
cd "$(dirname "$0")"
rm -rf build/classes
mkdir -p build/classes
javac --release 21 -encoding UTF-8 -d build/classes $(find src/main/java -name '*.java')
exec java -cp build/classes:src/main/resources ua.polytsia.App

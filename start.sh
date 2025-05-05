#!/bin/bash

# Script para iniciar y mantener el servidor Node.js ejecutándose
# Este script reinicia automáticamente el servidor si se detiene

echo "$(date): Iniciando servidor ISanMartín..." > app.log

# Directorio donde se encuentra este script
DIR="$(dirname "$(readlink -f "$0")")"
cd "$DIR"

# Bucle que mantiene el servidor corriendo
while true; do
  echo "$(date): Iniciando Node.js..." >> app.log
  node dist/index.js >> app.log 2>&1
  
  # Si el servidor se detiene, registrarlo
  echo "$(date): ¡Servidor detenido! Reiniciando en 5 segundos..." >> app.log
  
  # Esperar 5 segundos antes de reiniciar
  sleep 5
done 
#!/bin/bash

# Script para verificar si el servidor Node.js está ejecutándose
# y reiniciarlo si es necesario
# Úsalo en un cron job: */5 * * * * cd /ruta/a/tu/backend && ./check_server.sh

# Ruta al directorio del proyecto
BACKEND_DIR="$(dirname "$(readlink -f "$0")")"
cd "$BACKEND_DIR"

# Verificar si el servidor está corriendo
if ! pgrep -f "node dist/index.js" > /dev/null; then
    echo "$(date): Servidor no encontrado, reiniciando..." >> "$BACKEND_DIR/server_check.log"
    
    # Detener cualquier instancia previa que pueda estar en un estado inestable
    pkill -f "node dist/index.js" || true
    
    # Iniciar el servidor en segundo plano
    nohup node dist/index.js >> "$BACKEND_DIR/app.log" 2>&1 &
    
    echo "$(date): Servidor reiniciado con PID $!" >> "$BACKEND_DIR/server_check.log"
else
    # Opcional: comentar esta línea si genera demasiados logs
    echo "$(date): Servidor funcionando correctamente" >> "$BACKEND_DIR/server_check.log"
fi 
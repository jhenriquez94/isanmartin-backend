#!/bin/bash

# Script para realizar copias de seguridad de la base de datos ISanMartin
# Crea una copia de seguridad en formato SQL con la fecha actual
# Puede ser programado como una tarea cron: 0 2 * * * cd /ruta/al/backend && ./backup_db.sh

# Cargar variables de entorno
if [ -f .env ]; then
    source <(grep -v '^#' .env | sed 's/^/export /')
else
    echo "Error: No se encontró el archivo .env"
    exit 1
fi

# Comprobar que tenemos las variables necesarias
if [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
    echo "Error: Faltan variables de entorno necesarias (DB_USER, DB_PASSWORD, DB_NAME)"
    exit 1
fi

# Crear directorio de copias de seguridad si no existe
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

# Generar nombre de archivo con fecha y hora
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/isanmartin_backup_$TIMESTAMP.sql"

# Realizar la copia de seguridad
echo "Creando copia de seguridad de la base de datos $DB_NAME..."
mysqldump -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$BACKUP_FILE" 2>/tmp/backup_error.log

# Verificar si la copia de seguridad fue exitosa
if [ $? -eq 0 ]; then
    # Comprimir el archivo
    gzip "$BACKUP_FILE"
    echo "¡Copia de seguridad creada exitosamente en $BACKUP_FILE.gz!"
    
    # Eliminar copias de seguridad antiguas (mantener solo las últimas 7)
    find "$BACKUP_DIR" -name "isanmartin_backup_*.sql.gz" -type f -mtime +7 -delete
    echo "Se han eliminado las copias de seguridad con más de 7 días de antigüedad."
else
    echo "Error al crear la copia de seguridad."
    echo "Detalles del error:"
    cat /tmp/backup_error.log
    rm /tmp/backup_error.log
    exit 1
fi 
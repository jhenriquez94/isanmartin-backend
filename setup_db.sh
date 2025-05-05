#!/bin/bash

# Script para configurar la base de datos ISanMartin
# Este script debe ejecutarse en el servidor compartido

# Colores para mensajes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Configuración de Base de Datos ISanMartin${NC}"
echo "==============================================="

# Solicitar credenciales
read -p "Nombre de la base de datos: " DB_NAME
read -p "Usuario de MySQL: " DB_USER
read -s -p "Contraseña de MySQL: " DB_PASSWORD
echo ""

# Verificar si el archivo SQL existe
SQL_FILE="src/scripts/isanmartin_db.sql"
if [ ! -f "$SQL_FILE" ]; then
    echo -e "${RED}Error: No se encontró el archivo SQL ($SQL_FILE)${NC}"
    exit 1
fi

echo -e "${YELLOW}Importando estructura de base de datos...${NC}"

# Intentar importar el SQL
mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$SQL_FILE" 2>/tmp/mysql_error.log

# Verificar si la importación fue exitosa
if [ $? -eq 0 ]; then
    echo -e "${GREEN}¡Base de datos importada correctamente!${NC}"
else
    echo -e "${RED}Error al importar la base de datos.${NC}"
    echo "Detalles del error:"
    cat /tmp/mysql_error.log
    rm /tmp/mysql_error.log
    exit 1
fi

# Actualizar archivo .env
ENV_FILE=".env"
if [ -f "$ENV_FILE" ]; then
    # Hacer backup del archivo .env existente
    cp "$ENV_FILE" "${ENV_FILE}.backup"
    echo -e "${YELLOW}Se ha creado una copia de seguridad del archivo .env anterior en ${ENV_FILE}.backup${NC}"
fi

echo -e "${YELLOW}Actualizando archivo .env con la configuración de base de datos...${NC}"

# Crear nuevo archivo .env
cat > "$ENV_FILE" << EOF
# Configuración de la base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME

# Configuración de JWT (generar una nueva clave aleatoria)
JWT_SECRET=$(openssl rand -hex 32)

# URL del frontend
FRONTEND_URL=https://isanmartin.cl
FRONTEND_PRODUCTION_URL=https://isanmartin.cl

# Puerto del servidor
PORT=3000

# Entorno
NODE_ENV=production
EOF

echo -e "${GREEN}¡Archivo .env actualizado correctamente!${NC}"

# Probar conexión
echo -e "${YELLOW}Probando conexión a la base de datos...${NC}"
npx ts-node src/scripts/testDBConnection.ts

if [ $? -eq 0 ]; then
    echo -e "${GREEN}¡Configuración completada exitosamente!${NC}"
    echo "=============================================="
    echo -e "${GREEN}Credenciales del usuario administrador:${NC}"
    echo "Email: admin@isanmartin.cl"
    echo "Contraseña: admin123"
    echo -e "${YELLOW}IMPORTANTE: Cambia la contraseña del administrador después del primer inicio de sesión.${NC}"
else
    echo -e "${RED}Hubo problemas al probar la conexión. Revisa tu configuración.${NC}"
fi 
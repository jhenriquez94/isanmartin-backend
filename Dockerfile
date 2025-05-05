FROM node:18-alpine

WORKDIR /app

# Instalar dependencias de desarrollo necesarias para bcrypt
RUN apk add --no-cache python3 make g++ git

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN npm install

# Instalar mysql específicamente
RUN npm install mysql mysql2 --save

# Instalar bcrypt correctamente
RUN npm uninstall bcrypt
RUN npm install bcrypt@5.1.1 --save

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

EXPOSE 4000

# Usar el script de desarrollo
CMD ["npm", "run", "dev"] 
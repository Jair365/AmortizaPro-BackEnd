# Usar la imagen oficial de Node.js 18 basada en Alpine (más ligera)
FROM node:18-alpine

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Instalar dependencias del sistema necesarias para bcrypt y otras librerías nativas
RUN apk add --no-cache python3 make g++

# Copiar archivos de configuración de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar el código fuente de la aplicación
COPY src/ ./src/

# Crear un usuario no-root para ejecutar la aplicación
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Cambiar la propiedad de los archivos al usuario nodejs
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exponer el puerto en el que corre la aplicación
EXPOSE 3000

# Configurar variables de entorno para producción
ENV NODE_ENV=production

# Comando para iniciar la aplicación
CMD ["npm", "start"]

# Agregar healthcheck para verificar que la aplicación esté funcionando
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

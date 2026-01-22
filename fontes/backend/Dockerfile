# Etapa 1: Build
FROM node:18 AS build

WORKDIR /app

# Copia dependências primeiro (aproveita cache do Docker)
COPY package.json package-lock.json tsconfig.json ./

# Instala dependências
RUN npm install

# Copia o resto do código
COPY . .

# Compila
RUN npm run build

# Copia resources (garantindo que o comando não falhe se a pasta não existir)
RUN cp -r src/resources dist/resources || true

# Etapa 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Copia apenas o necessário da etapa anterior
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

EXPOSE 8080

CMD ["node", "dist/server.js"]
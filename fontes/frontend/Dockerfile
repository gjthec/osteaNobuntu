# Estágio de Build
FROM node:20.10.0 as builder
WORKDIR /app

# Removendo node_modules e package-lock.json para evitar conflitos
RUN rm -rf node_modules package-lock.json

# Copia apenas os arquivos de dependência primeiro para aproveitar o cache do Docker
COPY package*.json ./

# Instala dependências de forma limpa e determinística
RUN npm ci --force --legacy-peer-deps

# Copia o restante do código após instalar as dependências
COPY . .

# Corrige o problema de dependências opcionais
RUN npm install @rollup/rollup-linux-x64-gnu --save-dev

# Realiza o build
RUN npm run build

# Estágio de Produção
FROM nginx:alpine

# Configuração do NGINX
COPY nginx.conf /etc/nginx/nginx.conf
COPY mime.types /etc/nginx/mime.types

# Copia os arquivos buildados para o NGINX
COPY --from=builder /app/dist/frontend /usr/share/nginx/html

EXPOSE 8081
CMD ["nginx", "-g", "daemon off;"]

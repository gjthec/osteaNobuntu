#!/bin/bash

# Variáveis de Configuração para o Backend
PROJECT_ID="ninth-glider-366922"  # Altere para o ID do seu projeto
REGION_ARTIFACT="southamerica-east1"   # Onde o Artifact Registry está
REGION_CLOUD_RUN="us-central1"         # Onde o Cloud Run será implantado
REPO_NAME="nobuntu"
BACKEND_NAME="backend/osteo"
IMAGE_TAG="v1.0.0"  # Altere para a versão desejada
BACKEND_SERVICE_NAME="osteo-backend-service"
NETWORK="rede"
SUBNET="sub-rede"
gcloud config set project $PROJECT_ID
# Caminho Completo para o Artifact Registry do Backend
BACKEND_IMAGE_PATH="${REGION_ARTIFACT}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${BACKEND_NAME}:${IMAGE_TAG}"

# Exibindo informações
echo "🚀 Iniciando o processo de build, push e deploy do Backend..."
echo "Projeto: $PROJECT_ID"
echo "Região do Artifact Registry: $REGION_ARTIFACT"
echo "Região do Cloud Run: $REGION_CLOUD_RUN"
echo "Repositório: $REPO_NAME"
echo "Backend: $BACKEND_NAME"
echo "Tag: $IMAGE_TAG"

# Fazer Login no Artifact Registry
echo "🔑 Autenticando no Artifact Registry..."
gcloud auth configure-docker ${REGION_ARTIFACT}-docker.pkg.dev

# Construir a Imagem Docker do Backend
echo "🔨 Construindo a imagem Docker do Backend..."
cd backend
docker build -t ${BACKEND_IMAGE_PATH} .
cd ..

# Fazer Push do Backend
echo "📤 Enviando a imagem do Backend para o Artifact Registry..."
docker push ${BACKEND_IMAGE_PATH}

# Verificar se a Imagem foi enviada corretamente
echo "🔍 Verificando a imagem no Artifact Registry..."
gcloud artifacts docker images list ${REGION_ARTIFACT}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}

# Deploy do Backend no Cloud Run
echo "🚀 Realizando deploy do Backend no Google Cloud Run..."
# Deploy do Backend no Cloud Run
echo "🚀 Realizando deploy do Backend no Google Cloud Run..."
gcloud run deploy ${BACKEND_SERVICE_NAME} \
  --image ${BACKEND_IMAGE_PATH} \
  --region ${REGION_CLOUD_RUN} \
  --platform managed \
  --allow-unauthenticated \
  --service-account "cloud-run-runtime@ninth-glider-366922.iam.gserviceaccount.com" \
  --port 8080 \
  --timeout 600s \
  --cpu 1 \
  --memory 512Mi \
  --network="$NETWORK" \
  --subnet="$SUBNET" \
  --vpc-egress=private-ranges-only \
  --env-vars-file env.yaml


echo "✅ Deploy do Backend concluído com sucesso!"

#!/bin/bash

# Variáveis de Configuração para o Frontend
PROJECT_ID="ninth-glider-366922"
REGION_ARTIFACT="southamerica-east1"   # Onde o Artifact Registry está
REGION_CLOUD_RUN="us-central1"         # Onde o Cloud Run será implantado
REPO_NAME="nobuntu"
FRONTEND_NAME="frontend/osteo"
IMAGE_TAG="v1.0.0"  # Altere para a versão desejada
FRONTEND_SERVICE_NAME="osteofrontend"
DEPLOYER="administrador@nobuntu.com.br"
COMPUTE_SA="455563875480-compute@developer.gserviceaccount.com"

gcloud config set project $PROJECT_ID
PROJECT_NUMBER=455563875480
USER_EMAIL="administrador@nobuntu.com.br"



# Caminho Completo para o Artifact Registry do Frontend
FRONTEND_IMAGE_PATH="${REGION_ARTIFACT}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${FRONTEND_NAME}:${IMAGE_TAG}"

# Exibindo informações
echo "🚀 Iniciando o processo de build, push e deploy do Frontend..."
echo "Projeto: $PROJECT_ID"
echo "Região do Artifact Registry: $REGION_ARTIFACT"
echo "Região do Cloud Run: $REGION_CLOUD_RUN"
echo "Repositório: $REPO_NAME"
echo "Frontend: $FRONTEND_NAME"
echo "Tag: $IMAGE_TAG"

# Fazer Login no Artifact Registry
echo "🔑 Autenticando no Artifact Registry..."
gcloud auth configure-docker ${REGION_ARTIFACT}-docker.pkg.dev

# Construir a Imagem Docker do Frontend
echo "🔨 Construindo a imagem Docker do Frontend..."
cd frontend
docker build -t ${FRONTEND_IMAGE_PATH} .
cd ..

# Fazer Push do Frontend
echo "📤 Enviando a imagem do Frontend para o Artifact Registry..."
docker push ${FRONTEND_IMAGE_PATH}

# Verificar se a Imagem foi enviada corretamente
echo "🔍 Verificando a imagem no Artifact Registry..."
gcloud artifacts docker images list ${REGION_ARTIFACT}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}

# Deploy do Frontend no Cloud Run
echo "🚀 Realizando deploy do Frontend no Google Cloud Run..."
gcloud run deploy ${FRONTEND_SERVICE_NAME} \
  --image ${FRONTEND_IMAGE_PATH} \
  --region ${REGION_CLOUD_RUN} \
  --platform managed \
  --allow-unauthenticated \
  --service-account "cloud-run-runtime@ninth-glider-366922.iam.gserviceaccount.com" \
  --port 8081 \
  --timeout 600s \
  --cpu 1 \
  --memory 512Mi
  

echo "✅ Deploy do Frontend concluído com sucesso!"

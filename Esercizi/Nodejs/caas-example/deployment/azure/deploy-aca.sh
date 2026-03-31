#!/bin/bash

# Azure Container App Deployment Script
# Deployment in Servizio ACA (Azure Container Apps)

# Prerequisites:
# - Azure CLI installed and logged in Azure (az login)
# - Docker installed and running

# Configuration Variables
RESOURCE_GROUP="BEST0044-GR-B-Servless"
LOCATION="northeurope"
ACR_NAME="acrwebappcustomerscass"
CONTAINER_APP_ENV="container-env-prod"
CONTAINER_APP_NAME="webapp-example"
IMAGE_NAME="caas-example"
IMAGE_TAG="latest"
MYSQL_SERVER_NAME="mysql-webapp-customers"
MYSQL_DATABASE_NAME="customers_db"
MYSQL_ADMIN_USER="adminuser"
MYSQL_ADMIN_PASSWORD="AdminPassword123!" # Change this to a secure password


echo "Avvio del processo di deployment dell'applicazione containerizzata su Azure Container Apps..."

echo "Creazione del gruppo di risorse..."
az group create --name $RESOURCE_GROUP --location $LOCATION


echo "Creazione dell'Azure Container Registry (ACR)..."
az acr create \
    --resource-group $RESOURCE_GROUP \
    --name $ACR_NAME \
    --sku Basic \
    --location $LOCATION \
    --admin-enabled true

echo "Recupero delle credenziali dell'ACR..."
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer -o tsv)
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value -o tsv)


echo "Creazione dell'immagine Docker e push su ACR..."
docker build -t $IMAGE_NAME:$IMAGE_TAG .
docker tag $IMAGE_NAME:$IMAGE_TAG $ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG
docker login $ACR_LOGIN_SERVER -u $ACR_USERNAME -p $ACR_PASSWORD
docker push $ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG

echo "Creazione database MySQL su Azure..."
az mysql flexible-server create \
    --resource-group $RESOURCE_GROUP \
    --name $MYSQL_SERVER_NAME \
    --location $LOCATION \
    --admin-user $MYSQL_ADMIN_USER \
    --admin-password $MYSQL_ADMIN_PASSWORD \
    --sku-name Standard_B1ms \
    --tier Burstable \
    --version 8.0 \
    --storage-size 32 \
    --public-access all

MYSQL_HOST="$MYSQL_SERVER_NAME.mysql.database.azure.com"

echo "Creazione del database..."
az mysql flexible-server db create \
    --resource-group $RESOURCE_GROUP \
    --server-name $MYSQL_SERVER_NAME \
    --name $MYSQL_DATABASE_NAME

# Qui andrebbero i comandi SQL per creazione tabelle e inserimento dati, ad esempio usando az mysql flexible-server query

echo "Creazione dell'ambiente per Azure Container Apps..."
az containerapp env create \
    --name $CONTAINER_APP_ENV \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION

# Creazione dell'applicazione containerizzata su Azure Container Apps
echo "Creazione dell'applicazione containerizzata su Azure Container Apps..."
az containerapp create \
    --name $CONTAINER_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --environment $CONTAINER_APP_ENV \
    --image $ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG \
    --registry-server $ACR_LOGIN_SERVER \
    --registry-username $ACR_USERNAME \
    --registry-password $ACR_PASSWORD \
    --target-port 3000 \
    --ingress external \
    --min-replicas 1 \
    --max-replicas 5 \
    --cpu 0.5 \
    --memory 1Gi \
    --env-vars \
        NODE_ENV=production \
        DB_HOST=$MYSQL_HOST \
        DB_PORT=3306 \
        DB_NAME=$MYSQL_DATABASE_NAME \
        DB_USER=$MYSQL_ADMIN_USER@$MYSQL_SERVER_NAME \
        DB_PASSWORD=$MYSQL_ADMIN_PASSWORD \
        PORT=3000 \
        CLOUD_PROVIDER=azure

# GET APP Url
APP_URL=$(az containerapp show \
    --name $CONTAINER_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --query properties.configuration.ingress.fqdn \
    -o tsv)

echo "Deployment completato! L'applicazione è accessibile all'URL: http://$APP_URL"
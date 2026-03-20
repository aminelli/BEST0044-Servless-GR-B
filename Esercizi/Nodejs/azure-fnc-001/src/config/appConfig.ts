/*
{
    "IsEncrypted": false,
    "Values": {
        "AzureWebJobsStorage": "UseDevelopmentStorage=true",
        "FUNCTIONS_WORKER_RUNTIME": "node",
    
        "AZURE_RESOURCE_GROUP": "",
        "AZURE_STORAGE_ACCOUNT_NAME": "",
        "AZURE_STORAGE_CONTAINER_NAME": "data",
        "AZURE_STORAGE_CONNECTION_STRING": "DefaultEndpointsProtocol=https;AccountName=best0044grb;AccountKey=PP918rGKEie+oKRfpUUgjROW3B/V0Ecdm3QskQKFPrCu6R2udWjr8IEhe5FtRGBkEs2h1U4hr5IG+ASt4eNMVg==;EndpointSuffix=core.windows.net",

        "FOLDER_PATH_CSV": "csv",
        "FOLDER_PATH_JSON": "json",
        "FOLDER_PATH_CSV_PROCESSED": "csv-processed"
    }
}

*/

export interface AppConfig {
    azureResourceGroup: string;
    azureStorageAccountName: string;
    azureStorageContainerName: string;
    azureStorageConnectionString: string;
    folderPathCsv: string;
    folderPathJson: string;
    folderPathCsvProcessed: string;
}

// Cache della configurazione per evitare letture ripetute delle env vars
let cachedConfig: AppConfig | null = null;

export function getAppConfig(): AppConfig {
    // Lazy loading con caching per ottimizzare le performance
    if (cachedConfig) {
        return cachedConfig;
    }

    const azureStorageConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || null;

    if (!azureStorageConnectionString) {
        throw new Error('AZURE_STORAGE_CONNECTION_STRING environment variable is not set.');
    }

    cachedConfig = {
        azureResourceGroup: process.env.AZURE_RESOURCE_GROUP || '',
        azureStorageAccountName: process.env.AZURE_STORAGE_ACCOUNT_NAME || '',
        azureStorageContainerName: process.env.AZURE_STORAGE_CONTAINER_NAME || 'data',
        azureStorageConnectionString: azureStorageConnectionString,
        folderPathCsv: process.env.FOLDER_PATH_CSV || 'csv',
        folderPathJson: process.env.FOLDER_PATH_JSON || 'json',
        folderPathCsvProcessed: process.env.FOLDER_PATH_CSV_PROCESSED || 'csv-processed'
    };

    return cachedConfig;
}



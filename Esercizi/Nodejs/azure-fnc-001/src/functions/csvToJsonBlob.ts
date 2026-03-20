import { app, InvocationContext } from "@azure/functions";
import { getAppConfig } from "../config/appConfig";
import { CsvToJsonTransformer } from "../services/csvTransformer";
import { StorageService } from "../services/storageService";

import { randomUUID } from 'crypto'

const config = getAppConfig();

export async function csvToJsonBlob(
    blob: Buffer, 
    context: InvocationContext
): Promise<void> {
 
    context.log('=== CSV to JSON Blob function triggered. ===');
    const blobName = context.triggerMetadata?.name as string || 'unknown';
    context.log(`Processing blob: ${blobName}, Size: ${blob.length} bytes`);

    if (!blobName || !blobName.endsWith('.csv')) {
        context.log(`Skipping non-CSV blob: ${blobName}`);
        return;
    }

    try {

        
        const transformer = new CsvToJsonTransformer();   
        const service = new StorageService(config);     

        const csvContent = blob.toString('utf-8');
        context.log(`CSV content length: ${csvContent.length} characters`);

        // Conversion logic from CSV to JSON
        const jsonData = await transformer.stransform(csvContent);
        const jsonString = transformer.toJsonString(jsonData);
        context.log(`Total successfully processed records: ${jsonData.length}`);

        // Preparazione del nome del json e del csv processato
        const uuid = randomUUID();
        const jsonFileName = `${uuid}.json`;
        const csvProcessedFileName = `${uuid}.csv`;

        
        const jsonBlobPath = `${config.azureStorageContainerName}}/${config.folderPathJson}/${jsonFileName}`;
        const csvProcessedBlobPath = `${config.azureStorageContainerName}}/${config.folderPathCsvProcessed}/${csvProcessedFileName}`;

        // Salvataggio del JSON su Blob Storage
        await service.writeBlobFromString(jsonBlobPath, jsonString, 'application/json');

        await service.moveBlob(blobName, csvProcessedBlobPath);

        context.log(`JSON blob uploaded successfully: ${jsonBlobPath}`);
        
    } catch (error) {
        if (error instanceof Error) {
            context.log(`Error processing blob: ${blobName}, ${error.message}`);
        } else {
            context.log(`Unexpected error: blob: ${blobName}`);
        }
    } finally {
        context.log('=== CSV to JSON Blob function completed. ===');
    }


 
}

app.storageBlob('csvToJsonBlob', {
    path: `${config.azureStorageContainerName}/${config.folderPathCsv}/{name}`,
    connection: config.azureStorageConnectionString,
    handler: csvToJsonBlob
});

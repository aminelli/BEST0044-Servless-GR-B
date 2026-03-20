import { app, InvocationContext } from "@azure/functions";
import { getAppConfig } from "../config/appConfig";
import { CsvToJsonTransformer } from "../services/csvTransformer";

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

        const config = getAppConfig();
        const transformer = new CsvToJsonTransformer();        

        const csvContent = blob.toString('utf-8');
        context.log(`CSV content length: ${csvContent.length} characters`);

        // Conversion logic from CSV to JSON
        const jsonData = await transformer.stransform(csvContent);
        const jsonString = transformer.toJsonString(jsonData);
        context.log(`Total successfully processed records: ${jsonData.length}`);

        
        
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
    path: 'data/csv/{name}',
    connection: 'DefaultEndpointsProtocol=https;AccountName=best0044grb;AccountKey=PP918rGKEie+oKRfpUUgjROW3B/V0Ecdm3QskQKFPrCu6R2udWjr8IEhe5FtRGBkEs2h1U4hr5IG+ASt4eNMVg==;EndpointSuffix=core.windows.net',
    handler: csvToJsonBlob
});

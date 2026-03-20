import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import { AppConfig } from "../config/appConfig";


export class StorageService {

    private config: AppConfig;
    private client: ContainerClient;
    
    constructor(config: AppConfig) {
        this.config = config;
        this.client = this.initializeContainerClient();
    }

    public initializeContainerClient(): ContainerClient {
        try {
            const blobClient = BlobServiceClient.fromConnectionString(this.config.azureStorageConnectionString);
            return blobClient.getContainerClient(this.config.azureStorageContainerName);

        } catch (error) {
            throw new Error(`Error initializing Azure Blob Storage client: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    public async blobExists(blobName: string): Promise<boolean> {
        try {
            const blobClient = this.client.getBlobClient(blobName);
            return await blobClient.exists();
        } catch (error) {
            return false;
        }
    }

    public async readBlobAsString(blobName: string): Promise<string> {
        try {
            const blobClient = this.client.getBlobClient(blobName);     
            if (!await blobClient.exists()) {
                throw new Error(`Blob not found: ${blobName}`);
            }
            const downloadBlockBlobResponse = await blobClient.download();
            
            if (!downloadBlockBlobResponse.readableStreamBody) {
                throw new Error(`Blob content is empty or not readable: ${blobName}`);
            }
            
            const chunks: Buffer[] = [];
            for await (const chunk of downloadBlockBlobResponse.readableStreamBody) {
                chunks.push(Buffer.from(chunk));
            }
            const downloaded = Buffer.concat(chunks).toString('utf-8');
            return downloaded;
            
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error reading blob: ${blobName}, ${error.message}`);
            }   
            throw new Error(`Unexpected error reading blob: ${blobName}`);
        }
    }

    public async writeBlobFromString(
        blobName: string, 
        content: string,
        contentType: string = 'application/json'
    ): Promise<void> {
        try {
            const blockBlobClient = this.client.getBlockBlobClient(blobName);

            await blockBlobClient.upload(content, Buffer.byteLength(content), {
                blobHTTPHeaders: {
                    blobContentType: contentType
                }
            });


        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error writing blob: ${blobName}, ${error.message}`);
            }
            throw new Error(`Unexpected error writing blob: ${blobName}`);
        }   
    }

    public async moveBlob(
        sourceBlobName: string, 
        destinationBlobName: string
    ): Promise<void> {
        try {
            const sourceBlobClient = this.client.getBlobClient(sourceBlobName);

            const destinationBlobClient = this.client.getBlockBlobClient(destinationBlobName);  

            if (!await sourceBlobClient.exists()) {
                throw new Error(`Source blob does not exist: ${sourceBlobName}`);
            }

            // Copia il blob sorgente al nuovo percorso
            const copyPoller = await destinationBlobClient.beginCopyFromURL(sourceBlobClient.url);
            await copyPoller.pollUntilDone();
            
            // Elimina il blob sorgente solo dopo aver verificato che la copia sia stata avviata con successo
            await sourceBlobClient.delete();

        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error moving blob from ${sourceBlobName} to ${destinationBlobName}, ${error.message}`);
            }
            throw new Error(`Unexpected error moving blob from ${sourceBlobName} to ${destinationBlobName}`);
        }
    }


}
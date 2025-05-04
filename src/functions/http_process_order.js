const { app } = require('@azure/functions');
const { BlobServiceClient } = require('@azure/storage-blob');
// const { Client } = require('pg');
const PDFDocument = require('pdfkit');
const stream = require('stream');

app.http('http_process_order', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        try {
            // Parse the payload from the request body
            const payload = await request.json();

            // Generate a PDF file with the order details
            const pdfDoc = new PDFDocument();
            const pdfBuffer = await new Promise((resolve, reject) => {
                const buffers = [];
                pdfDoc.on('data', buffers.push.bind(buffers));
                pdfDoc.on('end', () => resolve(Buffer.concat(buffers)));
                pdfDoc.on('error', reject);

                pdfDoc.text(`Order Details`, { align: 'center' });
                pdfDoc.text(`Company: ${payload.company}`);
                pdfDoc.text(`Event Type: ${payload.eventType}`);
                pdfDoc.text(`Order ID: ${payload.orderId}`);
                pdfDoc.text(`Account ID: ${payload.accountId}`);
                pdfDoc.text(`Customer Name: ${payload.customerName}`);
                pdfDoc.text(`Email: ${payload.email}`);
                pdfDoc.text(`Items:`);
                payload.items.forEach(item => {
                    pdfDoc.text(`- ${item.name} (Quantity: ${item.quantity}, Price: $${item.price})`);
                });
                pdfDoc.text(`Total: $${payload.total}`);
                pdfDoc.text(`Timestamp: ${payload.timestamp}`);
                pdfDoc.end();
            });

            // Store the PDF in an Azure Storage account
            const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
            const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME);
            const blobName = `${payload.orderId}.pdf`;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            await blockBlobClient.uploadData(pdfBuffer);

            return { body: `Order ${payload.orderId} processed successfully.` };
        } catch (error) {
            context.log.error('Error processing order:', error);
            return { status: 500, body: 'An error occurred while processing the order. ' + error };
        }
    }
});

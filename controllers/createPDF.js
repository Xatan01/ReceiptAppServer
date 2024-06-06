const {
    ServicePrincipalCredentials,
    PDFServices,
    MimeType,
    CreatePDFJob,
    CreatePDFResult,
    SDKError,
    ServiceUsageError,
    ServiceApiError
} = require("@adobe/pdfservices-node-sdk");
const { Readable } = require('stream');

const convertImageToPDF = async (fileBuffer, mimeType) => {
    let readStream;
    try {
        // Initial setup, create credentials instance
        const credentials = new ServicePrincipalCredentials({
            clientId: process.env.PDF_SERVICES_CLIENT_ID,
            clientSecret: process.env.PDF_SERVICES_CLIENT_SECRET
        });

        // Creates a PDF Services instance
        const pdfServices = new PDFServices({ credentials });

        // Convert buffer to readable stream
        readStream = new Readable();
        readStream._read = () => {}; // _read is required but you can noop it
        readStream.push(fileBuffer);
        readStream.push(null); // Indicate the end of the stream

        // Creates an asset from the file buffer and upload
        const inputAsset = await pdfServices.upload({
            readStream,
            mimeType: mimeType // MimeType.PNG, MimeType.JPEG, etc.
        });

        // Creates a new job instance
        const job = new CreatePDFJob({ inputAsset });

        // Submit the job and get the job result
        const pollingURL = await pdfServices.submit({ job });
        const pdfServicesResponse = await pdfServices.getJobResult({
            pollingURL,
            resultType: CreatePDFResult
        });

        // Get content from the resulting asset
        const resultAsset = pdfServicesResponse.result.asset;
        const streamAsset = await pdfServices.getContent({ asset: resultAsset });

        // Convert result asset stream to buffer
        const pdfBuffer = await streamToBuffer(streamAsset.readStream);

        return pdfBuffer;
    } catch (err) {
        if (err instanceof SDKError || err instanceof ServiceUsageError || err instanceof ServiceApiError) {
            console.log("Exception encountered while executing operation", err);
        } else {
            console.log("Exception encountered while executing operation", err);
        }
        throw err;
    } finally {
        readStream?.destroy();
    }
};

// Helper function to convert stream to buffer
const streamToBuffer = (stream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
};

module.exports = { convertImageToPDF };

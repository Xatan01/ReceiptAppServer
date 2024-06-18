const AWS = require('aws-sdk');
const textract = new AWS.Textract();

const extractFieldsFromExpense = (expenseDocuments) => {
    const extractedFields = {
        invoiceDate: null,
        invoiceNumber: null,
        totalAmount: null,
        classification: null
    };

    expenseDocuments.forEach(document => {
        document.SummaryFields.forEach(field => {
            const fieldType = field.Type.Text;
            const fieldValue = field.ValueDetection ? field.ValueDetection.Text : null;

            if (fieldType === 'INVOICE_RECEIPT_DATE') {
                extractedFields.invoiceDate = fieldValue;
            } else if (fieldType === 'INVOICE_RECEIPT_ID') {
                extractedFields.invoiceNumber = fieldValue;
            } else if (fieldType === 'TOTAL') {
                extractedFields.totalAmount = fieldValue;
            }
        });

        // Assuming that the first SummaryField labeled as 'DOCUMENT_TYPE' would be the classification
        const documentTypeField = document.SummaryFields.find(field => field.Type.Text === 'DOCUMENT_TYPE');
        if (documentTypeField && documentTypeField.ValueDetection) {
            extractedFields.classification = documentTypeField.ValueDetection.Text;
        }
    });

    return extractedFields;
};

const processScan = async (file) => {
    try {
        const params = {
            Document: {
                Bytes: file.buffer,
            }
        };

        const data = await textract.analyzeExpense(params).promise();
        const fields = extractFieldsFromExpense(data.ExpenseDocuments);

        return { message: "Scan successful", fields };
    } catch (error) {
        console.error("Error processing scan:", error);
        throw new Error("Error processing scan");
    }
};

module.exports = {
    processScan,
};

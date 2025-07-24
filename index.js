const { Mistral } = require("@mistralai/mistralai");
const dotenv = require("dotenv");
const { Command } = require("commander");
const fs = require("fs");
const path = require("path");

dotenv.config();

const program = new Command();

program
  .version("0.0.1")
  .description("A simple NodeJS CLI utility that makes use of the Mistral OCR tool")
  .argument("<source_pdf>", "The source PDF file to process")
  .action(async (sourcePdf) => {
    try {
      const apiKeyWithBraces = process.env.MISTRAL_API_KEY;
      const apiKey = apiKeyWithBraces ? apiKeyWithBraces.replace(/^{|}$/g, "") : undefined;
      if (!apiKey) {
        throw new Error("MISTRAL_API_KEY is not defined in the .env file");
      }

      const client = new Mistral({ apiKey });

      const pdfPath = path.resolve(sourcePdf);
      if (!fs.existsSync(pdfPath)) {
        throw new Error(`File not found: ${pdfPath}`);
      }

      console.log(`Processing ${sourcePdf}...`);

      const pdfBuffer = fs.readFileSync(pdfPath);
      const pdfBase64 = pdfBuffer.toString("base64");
      const dataUrl = `data:application/pdf;base64,${pdfBase64}`;

      const ocrResponse = await client.ocr.process({
        model: "mistral-ocr-latest",
        document: {
          type: "document_url",
          documentUrl: dataUrl,
        },
      });

      const outputJsonPath = pdfPath.replace(/\.pdf$/i, ".json");

      fs.writeFileSync(outputJsonPath, JSON.stringify(ocrResponse, null, 2));

      console.log(`Successfully processed ${sourcePdf} and saved the output to ${outputJsonPath}`);
    } catch (error) {
      console.error("An error occurred:", error.message);
    }
  });

program.parse(process.argv);
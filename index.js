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
  .option("-i, --include-images", "Include images in the markdown output", false)
  .action(async (sourcePdf, options) => {
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

      console.log("Reading PDF file...");
      const pdfBuffer = fs.readFileSync(pdfPath);
      console.log("PDF file read successfully.");

      console.log("Converting PDF to base64...");
      const pdfBase64 = pdfBuffer.toString("base64");
      const dataUrl = `data:application/pdf;base64,${pdfBase64}`;
      console.log("PDF converted to base64 successfully.");

      console.log("Sending data to Mistral AI for OCR processing...");
      const ocrResponse = await client.ocr.process({
        model: "mistral-ocr-latest",
        document: {
          type: "document_url",
          documentUrl: dataUrl,
        },
        include_image_base64: options.includeImages
      });
      console.log("OCR processing complete.");

      const outputJsonPath = pdfPath.replace(/\.pdf$/i, ".json");
      console.log(`Saving OCR output to ${outputJsonPath}...`);
      fs.writeFileSync(outputJsonPath, JSON.stringify(ocrResponse, null, 2));
      console.log("OCR output saved successfully.");

      parseOcrResponseToMarkdown(ocrResponse, pdfPath, options.includeImages);

      console.log(`Successfully processed ${sourcePdf}`);
    } catch (error) {
      console.error("An error occurred:", error.message);
    }
  });

function parseOcrResponseToMarkdown(ocrResponse, pdfPath, includeImages) {
  const outputDir = path.dirname(pdfPath);
  const baseName = path.basename(pdfPath, ".pdf");
  const imagesDir = path.join(outputDir, `${baseName}_images`);

  let markdownContent = ocrResponse.doc.text_body;

  if (includeImages && ocrResponse.doc.images && ocrResponse.doc.images.length > 0) {
    console.log(`Found ${ocrResponse.doc.images.length} images. Saving them to ${imagesDir}...`);
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir);
    }

    ocrResponse.doc.images.forEach(image => {
      const imagePath = path.join(imagesDir, image.name);
      const imageBuffer = Buffer.from(image.image_base64, 'base64');
      fs.writeFileSync(imagePath, imageBuffer);
      console.log(`Saved image: ${imagePath}`);

      const relativeImagePath = path.join(`${baseName}_images`, image.name);
      markdownContent = markdownContent.replace(`![${image.name}](${image.name})`, `![${image.name}](${relativeImagePath})`);
    });
  }

  const outputMarkdownPath = pdfPath.replace(/\.pdf$/i, ".md");
  console.log(`Saving markdown output to ${outputMarkdownPath}...`);
  fs.writeFileSync(outputMarkdownPath, markdownContent);
  console.log("Markdown output saved successfully.");
}

program.parse(process.argv);
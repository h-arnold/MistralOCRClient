# Mistral OCR Client

A simple Node.js command-line utility to perform OCR on a PDF file using the Mistral AI API.

## Prerequisites

*   Node.js
*   npm (or your preferred package manager)
*   A Mistral AI API key

## Installation

1.  Clone the repository or download the source code.
2.  Install the dependencies:
    ```bash
    npm install
    ```

## Configuration

1.  Create a `.env` file in the root of the project.
2.  Add your Mistral AI API key to the `.env` file in the following format:
    ```
    MISTRAL_API_KEY={YOUR_API_KEY}
    ```
    Replace `{YOUR_API_KEY}` with your actual API key.

## Usage

To process a PDF file, run the following command in your terminal:

```bash
node index.js /path/to/your/document.pdf
```

Replace `/path/to/your/document.pdf` with the actual path to the PDF file you want to process.

The tool will create a new JSON file with the same name as the source PDF in the same directory, containing the OCR results. For example, if you process `document.pdf`, the output will be saved as `document.json`.

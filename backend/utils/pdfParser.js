const fs = require('fs');
const pdfParse = require('pdf-parse');

async function pdfParser(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdfParse(dataBuffer);
  return pdfData.text;
}

module.exports = { pdfParser };


const fs = require('fs');
const pdfParse = require('pdf-parse');

function cleanText(text) {
  return text
    .replace(/\r/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[^\x00-\x7F]/g, "") // remove weird unicode chars
    .trim();
}

async function pdfParser(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);

    const pdfData = await pdfParse(dataBuffer);

    let text = pdfData.text || "";

    // 🔥 CLEAN TEXT
    text = cleanText(text);

    console.log("EXTRACTED TEXT LENGTH:", text.length);
    console.log("TEXT PREVIEW:", text.slice(0, 200));

    // 🔥 RELAXED VALIDATION
    if (!text || text.length < 30) {
      throw new Error("PDF text extraction too short or invalid");
    }

    return text;

  } catch (err) {
    console.error("PDF PARSER ERROR:", err.message);
    throw err;
  }
}

module.exports = { pdfParser };

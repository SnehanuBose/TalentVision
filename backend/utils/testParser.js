const pdfParse = require('pdf-parse');
const fs = require('fs');
(async () => {
  const buffer = fs.readFileSync('../uploads/test-resume1.pdf');
  const result = await pdfParse(buffer);
  console.log(result.text);
})();

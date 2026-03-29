function contactScraper(text) {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(\+?\d[\d -]{8,}\d)/);
  const nameMatch = text.match(/^[A-Z][a-zA-Z]+\s+[A-Z][a-zA-Z]+/m);
  return {
    name: nameMatch ? nameMatch[0] : null,
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0] : null
  };
}
module.exports = { contactScraper };

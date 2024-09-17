const fs = require('fs');
const PDFDocument = require('pdfkit');

// Function to export audit report to PDF
const exportToPDF = async (auditResult, contractPath) => {
  const pdfDoc = new PDFDocument();
  const pdfPath = contractPath.replace(/\.sol$/, '-audit-report.pdf');
  const writeStream = fs.createWriteStream(pdfPath);

  pdfDoc.pipe(writeStream);

  pdfDoc.fontSize(20).text('Smart Contract Audit Report', { align: 'center' });
  pdfDoc.moveDown();

  pdfDoc.fontSize(12).text(`Audit for contract at: ${contractPath}`);
  pdfDoc.moveDown();

  pdfDoc.fontSize(16).text('Audit Results:', { underline: true });
  pdfDoc.moveDown();

  pdfDoc.fontSize(12).text(auditResult, { align: 'left' });

  pdfDoc.end();

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => resolve(pdfPath));
    writeStream.on('error', reject);
  });
};

module.exports = { exportToPDF };

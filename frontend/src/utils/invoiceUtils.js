import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Generate and download invoice as PDF
 * @param {HTMLElement} invoiceElement - The invoice HTML element to convert
 * @param {string} fileName - Name of the PDF file
 */
export const downloadInvoiceAsPDF = async (invoiceElement, fileName = "invoice.pdf") => {
  try {
    // Show loading state (optional - can be handled by caller)
    const canvas = await html2canvas(invoiceElement, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;

    pdf.addImage(
      imgData,
      "PNG",
      imgX,
      imgY,
      imgWidth * ratio,
      imgHeight * ratio
    );

    pdf.save(fileName);
    return { success: true };
  } catch (error) {
    console.error("Error generating PDF:", error);
    return { success: false, error };
  }
};

/**
 * Print invoice
 * @param {HTMLElement} invoiceElement - The invoice HTML element to print
 */
export const printInvoice = (invoiceElement) => {
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>
        <title>Print Invoice</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
          }
          @media print {
            body {
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        ${invoiceElement.innerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

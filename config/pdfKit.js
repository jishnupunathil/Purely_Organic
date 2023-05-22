const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

module.exports.generateInvoice = async (invoiceData, productDetails) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const invoicePath = path.join("config/invoices", "invoice.pdf"); // Path to save the generated PDF

    // Pipe PDF document to a writable stream
    doc.pipe(fs.createWriteStream(invoicePath));

    // Set font styles
    doc.font('Helvetica');
    doc.fontSize(12);

    // Add content to the PDF
    doc.text("Invoice", { underline: true }).moveDown();
    doc.font('Helvetica-Bold').fontSize(25).fillColor("black");
    doc.text("Purely Organic", { align: "center" }).moveDown();

    // Add delivery address field
    doc.text("Delivery Address:", { underline: true, fontSize: 14 }).moveDown();
    doc.fontSize(10);
    doc.text(`Name: ${invoiceData?.fname}`);
    doc.text(`Street: ${invoiceData?.address}`);
    doc.text(`City: ${invoiceData?.city}`);
    doc.text(`State: ${invoiceData?.state}`);
    doc.text(`Postal Code: ${invoiceData?.pincode}`);
    doc.text(`Mobile Number: ${invoiceData?.phone}`).moveDown();

    // Add seller address field
    doc.text("Seller Address:", { underline: true, fontSize: 14 }).moveDown();
    doc.fontSize(10);
    doc.text(`Name: Purely Organic Logistics Ltd`);
    doc.text(`Street: Palarivattam`);
    doc.text(`City: Cochin`);
    doc.text(`State: Kerala`);
    doc.text(`Postal Code: 652061`);
    doc.text(`Mobile Number: 9496959109`).moveDown();

    doc.text("------------------------------").moveDown();
    doc.fontSize(16).text("Items:", { underline: true }).moveDown();
    productDetails.forEach((item) => {
      doc.text(`${item.name} - ${item.quantity}kg - Rs ${item.price} per Kg `);
    });
    doc.text("------------------------------").moveDown();
    doc.fontSize(10).text(`Subtotal: ${invoiceData?.subTotal}`).moveDown();
    doc.fontSize(10).text(`Discount: - Rs${invoiceData?.discount}`).moveDown();
    doc.fontSize(16).text(`Total: Rs ${invoiceData?.total_amount}`).moveDown();
    doc.fontSize(10).text(`payment_Method: ${invoiceData?.payment_method}`).moveDown();

    // End the PDF document
    doc.end();

    // Resolve with the generated invoice file path
    resolve(invoicePath);
  });
};

  

module.exports.generateSalesReport = async (orders) => {
  return new Promise((resolve, reject) => {
    // Create a new PDF document
    const doc = new PDFDocument();
    const salesPath = path.join("sales", "sales_report.pdf"); // Path to save the generated PDF

    doc.pipe(fs.createWriteStream(salesPath));

    // Set up the PDF document properties

    doc.font("Helvetica-Bold");
    doc.fontSize(20).text("Sales Report", { align: "center" });

    // Loop through each order in the orders array
    orders.forEach((order) => {
      doc.moveDown(1);
      doc.font("Helvetica-Bold").fontSize(16).text(`Order ID: ${order?._id}`);
      doc
        .font("Helvetica")
        .fontSize(12)
        .text(`Total Amount: $${order?.total_amount}`);
      doc
        .font("Helvetica")
        .fontSize(12)
        .text(`Payment Status: ${order?.payment_status}`);
      doc
        .font("Helvetica")
        .fontSize(12)
        .text(`Order Status: ${order?.order_status}`);
      doc
        .font("Helvetica")
        .fontSize(12)
        .text(`Order Date: ${order?.order_date}`);
      doc
        .font("Helvetica")
        .fontSize(12)
        .text(`Return Reason: ${order?.return_reason}`);
      doc
        .font("Helvetica")
        .fontSize(12)
        .text(`Return Status: ${order?.return_status}`);
      doc.font("Helvetica").fontSize(12).text(`Refund: ${order?.refund}`);
     doc.font("Helvetica").fontSize(12).text(`Items:`, { underline: true });

      // Loop through each item in the order's items array
      order.items.forEach((item) => {
        doc.font("Helvetica").fontSize(12).text(`- Item ID: ${item.itemId}`);
        doc
          .font("Helvetica")
          .fontSize(12)
          .text(`  Item Name: ${item?.itemName}`);
        doc.font("Helvetica").fontSize(12).text(`  Quantity: ${item.quantity}`);
        doc.font("Helvetica").fontSize(12).text(`  Price: $${item.price}`);
      });

      doc.moveDown(1);
    });
    resolve(salesPath);
  });
};

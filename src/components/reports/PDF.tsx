// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable"; // Import explicitly
// import { Report } from "@/types/customTypes";

// const download = (salesData: Report) => {
//   const doc = new jsPDF();
//   doc.text("Sales Report", 14, 10);

//   // Define table columns and rows
//   const headers = [["Month", "Date", "Tickets Sold", "Total Sales"]];

//   const rows: any[] = [];

//    // Loop through eventSales → dailySales
//    salesData.salesData.eventSales.forEach((event) => {
//     event.dailySales.forEach((daily) => {
//       rows.push([
//         event.month,  // Month from eventSales
//         daily.date,   // Date from dailySales
//         daily.count,  // Count from dailySales
//         daily.amount, // Amount from dailySales
//       ]);
//     });
//   });



//   // Ensure autoTable is properly called
//   autoTable(doc, {
//     head: headers,
//     body: rows,
//     startY: 20,
//   });

//   doc.save("sales-report.pdf");
// };

// const DownloadPDF = (salesData: Report) => {
//   return (
//     <>
//       <button onClick={() => download(salesData)}>Download PDF</button>
//     </>
//   );
// };

// export default DownloadPDF;




import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Import explicitly
import { Report } from "@/types/customTypes";

const download = (salesData: Report) => {
  const doc = new jsPDF();
  doc.text("Sales Report", 14, 10);

  // Define table columns
  const headers = [["Month", "Date", "Category", "Plan Type", "Tickets Sold", "Total Sales"]];

  const rows: any[] = [];

  // Loop through eventSales → dailySales
  salesData.salesData.eventSales.forEach((event) => {
    event.dailySales.forEach((daily) => {
      rows.push([
        event.month,  // Month from eventSales
        daily.date,   // Date from dailySales
        "Event",      // Category label
        "-",          // No plan type for events
        daily.count,  // Count from dailySales
        daily.amount, // Amount from dailySales
      ]);
    });
  });

  // Loop through subscriptionSales → dailySales
  salesData.salesData.subscriptionSales.forEach((subscription) => {
    subscription.dailySales.forEach((daily) => {
      rows.push([
        subscription.month, // Month from subscriptionSales
        daily.date,         // Date from dailySales
        "Subscription",     // Category label
        subscription.planType, // Plan Type from subscriptionSales
        daily.count,        // Count from dailySales
        daily.amount,       // Amount from dailySales
      ]);
    });
  });

  // Generate the table
  autoTable(doc, {
    head: headers,
    body: rows,
    startY: 20,
  });

  doc.save("sales-report.pdf");
};

const DownloadPDF = (salesData: Report) => {
  return (
    <>
      <button onClick={() => download(salesData)}>Download PDF</button>
    </>
  );
};

export default DownloadPDF;

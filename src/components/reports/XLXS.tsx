import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Report } from "@/types/customTypes";

interface DownloadXLXSProps {
  salesData: Report["salesData"];
}

const download = (salesData: Report["salesData"]) => {
  // Process event sales
  const eventDailySales = salesData.eventSales.flatMap((event) =>
    event.dailySales.map((sale) => ({
      Date: sale.date,
      Month: event.month,
      Category: "Event",
      "Plan Type": "-", // No plan type for events
      "Tickets Sold": sale.count,
      "Total Sales": sale.amount,
    }))
  );

  // Process subscription sales
  const subscriptionDailySales = salesData.subscriptionSales.flatMap((subscription) =>
    subscription.dailySales.map((sale) => ({
      Date: sale.date,
      Month: subscription.month,
      Category: "Subscription",
      "Plan Type": subscription.planType,
      "Tickets Sold": sale.count,
      "Total Sales": sale.amount,
    }))
  );

  // Combine event and subscription sales
  const salesDataSheet = [...eventDailySales, ...subscriptionDailySales];

  // Create a new worksheet
  const ws = XLSX.utils.json_to_sheet(salesDataSheet);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sales Report");

  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });

  saveAs(data, "sales-report.xlsx");
};

const DownloadXLXS: React.FC<DownloadXLXSProps> = ({ salesData }) => {
  return <button onClick={() => download(salesData)}>Download Excel</button>;
};

export default DownloadXLXS;

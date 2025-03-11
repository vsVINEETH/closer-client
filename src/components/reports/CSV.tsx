import React from "react";
import { CSVLink } from "react-csv";
import { Report } from "@/types/customTypes";

const headers = [
  { label: "Date", key: "date" },
  { label: "Month", key: "month" },
  { label: "Category", key: "category" },
  { label: "Plan Type", key: "planType" },
  { label: "Tickets Sold", key: "count" },
  { label: "Total Sales", key: "amount" },
];

interface DownloadCSVProps {
  salesData: Report["salesData"];
}

const DownloadCSV: React.FC<DownloadCSVProps> = ({ salesData }) => {
  // Process event sales
  const eventDailySales = salesData.eventSales.flatMap((event) =>
    event.dailySales.map((sale) => ({
      date: sale.date,
      month: event.month,
      category: "Event",
      planType: "-", // No plan type for events
      count: sale.count,
      amount: sale.amount,
    }))
  );

  // Process subscription sales
  const subscriptionDailySales = salesData.subscriptionSales.flatMap((subscription) =>
    subscription.dailySales.map((sale) => ({
      date: sale.date,
      month: subscription.month,
      category: "Subscription",
      planType: subscription.planType,
      count: sale.count,
      amount: sale.amount,
    }))
  );

  // Combine event and subscription sales
  const csvData = [...eventDailySales, ...subscriptionDailySales];

  return (
    <CSVLink data={csvData} headers={headers} filename={"sales-report.csv"}>
      <button>Download CSV</button>
    </CSVLink>
  );
};

export default DownloadCSV;

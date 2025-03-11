import { DBD } from '@/types/customTypes';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
  );


export const getLineChartData = (dashboardData: DBD) => {
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Collect unique months from both datasets
  const allMonthsSet = new Set<string>();

  dashboardData.userData.monthlyNewUsers.forEach(item => allMonthsSet.add(item.month));
  dashboardData.salesData.totalMonthlySales.forEach(item => allMonthsSet.add(item.month));

  // Convert Set to sorted array based on monthNames order
  const allMonths = Array.from(allMonthsSet).sort((a, b) => monthNames.indexOf(a) - monthNames.indexOf(b));

  // lookup maps for quick data retrieval
  const newUsersMap = new Map(dashboardData.userData.monthlyNewUsers.map(item => [item.month, item.count]));
  const revenueMap = new Map(dashboardData.salesData.totalMonthlySales.map(item => [item.month, item.totalIncome]));

  return {
    labels: allMonths,
    datasets: [
      {
        label: 'Monthly Revenue',
        data: allMonths.map(month => revenueMap.get(month) || 0),
        borderColor: 'rgba(59, 130, 246, 1)', // Blue
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4, // Smooth curve
        pointRadius: 4,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Monthly New Users',
        data: allMonths.map(month => newUsersMap.get(month) || 0),
        borderColor: 'rgba(16, 185, 129, 1)', // Green
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }
    ],
  };
};

  export  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };
  
  export const getBarChartData = (dashboardData: DBD) => {
    // Define months order
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
  
    // Extract unique months in sorted order
    const allMonthsSet = new Set<string>();
    dashboardData.salesData.subscriptionSales.forEach(item => allMonthsSet.add(item.month));
    const allMonths = Array.from(allMonthsSet).sort((a, b) => monthNames.indexOf(a) - monthNames.indexOf(b));
  
    // Initialize empty maps for each plan type
    const weeklySales = new Map<string, number>();
    const monthlySales = new Map<string, number>();
    const yearlySales = new Map<string, number>();
  
    // Populate maps with actual sales data
    dashboardData.salesData.subscriptionSales.forEach(item => {
      if (item.planType === "weekly") {
        weeklySales.set(item.month, item.amount);
      } else if (item.planType === "monthly") {
        monthlySales.set(item.month, item.amount);
      } else if (item.planType === "yearly") {
        yearlySales.set(item.month, item.amount);
      }
    });
  
    return {
      labels: allMonths, // Unified month labels
      datasets: [
        {
          label: 'Weekly Plan',
          data: allMonths.map(month => weeklySales.get(month) || 0), // Ensure missing months get 0
          backgroundColor: 'rgba(59, 130, 246, 0.8)', // Blue
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          borderRadius: 8,
        },
        {
          label: 'Monthly Plan',
          data: allMonths.map(month => monthlySales.get(month) || 0), // Ensure missing months get 0
          backgroundColor: 'rgba(16, 185, 129, 0.8)', // Green
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1,
          borderRadius: 8,
        },
        {
          label: 'Yearly Plan',
          data: allMonths.map(month => yearlySales.get(month) || 0), // Ensure missing months get 0
          backgroundColor: 'rgba(245, 158, 11, 0.8)', // Yellow
          borderColor: 'rgba(245, 158, 11, 1)',
          borderWidth: 1,
          borderRadius: 8,
        },
      ],
    };
  };
  
  export const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };
  
  export const getPieChartData = (dashboardData: DBD) => ({
    labels: dashboardData.userData.genderSplit.map((item) => item._id),
    datasets: [
      {
        data: dashboardData.userData.genderSplit.map((item) => item.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',   // Blue
          'rgba(16, 185, 129, 0.8)',   // Green
          'rgba(245, 158, 11, 0.8)',   // Yellow
          'rgba(139, 92, 246, 0.8)',   // Purple
          'rgba(236, 72, 153, 0.8)',   // Pink
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  });
  
  export  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
        },
      },
    },
    layout: {
      padding: 1,
    },
  };
  


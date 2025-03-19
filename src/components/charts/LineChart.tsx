import React from 'react';
import { Line } from 'react-chartjs-2';

const LineChart = ({ data }: { 
  data: { 
    labels: string[]; 
    datasets: { 
      label: string; 
      data: number[]; 
      borderColor: string; 
      backgroundColor: string; 
      fill: boolean; 
      tension: number; 
      pointRadius: number; 
      pointBackgroundColor: string; 
      pointBorderColor: string; 
      pointBorderWidth: number;
    }[] 
  };
}) => {
  return <Line data={data} />;
};

export default LineChart;

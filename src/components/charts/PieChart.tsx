import React from 'react';
import { Pie } from 'react-chartjs-2';

const PieChart = ({ data }: { 
  data: { 
    labels: string[]; 
    datasets: { 
      data: number[];
      backgroundColor: string[];
      borderColor: string;
      borderWidth: number;
    }[] 
  };
}) => {
  return <Pie data={data} />;
};

export default PieChart;
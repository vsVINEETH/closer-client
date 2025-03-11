import React from 'react';
import { Bar } from 'react-chartjs-2';

const BarChart = ({ data }: { data: any }) => {
  return <Bar data={data} />;
};

export default BarChart;

import React from 'react';
import { Pie } from 'react-chartjs-2';

const PieChart = ({ data }: { data: any }) => {
  return <Pie data={data} />;
};

export default PieChart;

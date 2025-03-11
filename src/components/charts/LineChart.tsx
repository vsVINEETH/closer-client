import React from 'react';
import { Line } from 'react-chartjs-2';

const LineChart = ({ data }: { data: any }) => {
  return <Line data={data} />;
};

export default LineChart;

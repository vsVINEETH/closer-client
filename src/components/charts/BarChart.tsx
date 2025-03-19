import React from 'react';
import { Bar } from 'react-chartjs-2';

const BarChart = ({ data }: { data:{
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    borderRadius: number;
  }[]}}) => {
  return <Bar data={data} />;
};

export default BarChart;

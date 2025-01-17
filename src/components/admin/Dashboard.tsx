'use client'
import React, { useEffect, useState } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import useAxios from '@/hooks/useAxios/useAxios';


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

interface DBD {
  userData:[{
    newUsers:[{
      count: number
    }],
    activeUsers:[{
      count: number,
    }],
    primeMembers:[{
      count: number,
    }],
    totalUsers:[{
      count: number
    }]
  }],
  employeeData: [{
    totalEmployees:[{
      count: number
    }],
    activeEmployees:[{
      count: number
    }]
  }],
  eventData: [{
    upcomingEvents:number
  }],
}

const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Monthly Sales',
        data: [65, 59, 80, 81, 56],
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        fill: true,
      },
    ],
  };

  const barChartData = {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
    datasets: [
      {
        label: 'Votes',
        data: [12, 19, 3, 5, 2],
        backgroundColor: 'rgba(255,99,132,0.2)',
        borderColor: 'rgba(255,99,132,1)',
        borderWidth: 1,
      },
    ],
  };


  const pieChartData = {
    labels: ['Direct', 'Referral', 'Social'],
    datasets: [
      {
        label: 'Traffic Sources',
        data: [55, 25, 20],
        backgroundColor: ['rgba(255,99,132,0.2)', 'rgba(54,162,235,0.2)', 'rgba(255,205,86,0.2)'],
        borderColor: ['rgba(255,99,132,1)', 'rgba(54,162,235,1)', 'rgba(255,205,86,1)'],
        borderWidth: 1,
      },
    ],
  };

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DBD | null>(null);
  const {handleRequest} = useAxios();

  useEffect(() => {
    fetchData();
  },[]);

  const fetchData = async () =>{
    const response = await handleRequest({
        url:'/api/admin/dashboard',
        method:'GET',
    });

    if(response.error){
        console.log(response.error);
    };

    if(response.data){

        setDashboardData(response.data);
    };
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Total Users */}
        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-700">Total Users</h3>
            <p className="text-2xl font-bold text-blue-500">{dashboardData && dashboardData.userData[0].totalUsers[0].count}</p>
          </div>
          <div className="bg-blue-100 p-4 rounded-full">
            <span className="text-3xl text-blue-500">👤</span>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-700">Active Users</h3>
            <p className="text-2xl font-bold text-green-500">{dashboardData && dashboardData.userData[0].activeUsers[0].count}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-full">
            <span className="text-3xl text-green-500">🟢</span>
          </div>
        </div>

        {/* New Users */}
        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-700">New Users</h3>
            <p className="text-2xl font-bold text-yellow-500">{dashboardData && dashboardData.userData[0].newUsers.length > 0 ? dashboardData.userData[0].newUsers[0].count: 0 }</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-full">
            <span className="text-3xl text-yellow-500">✨</span>
          </div>
        </div>

        {/* Total Prime Users */}
        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-700">Prime Users</h3>
            <p className="text-2xl font-bold text-purple-500">{dashboardData && dashboardData.userData[0].primeMembers[0].count}</p>
          </div>
          <div className="bg-purple-100 p-4 rounded-full">
            <span className="text-3xl text-purple-500">👑</span>
          </div>
        </div>

        {/* Total Employees */}
        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-700">Total Employees</h3>
            <p className="text-2xl font-bold text-blue-500">{dashboardData && dashboardData.employeeData[0].totalEmployees[0].count}</p>
          </div>
          <div className="bg-blue-100 p-4 rounded-full">
            <span className="text-3xl text-blue-500">👥</span>
          </div>
        </div>

        {/* Active Employees */}
        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-700">Active Employees</h3>
            <p className="text-2xl font-bold text-green-500">{dashboardData && dashboardData.employeeData[0].activeEmployees[0].count}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-full">
            <span className="text-3xl text-green-500">🟢</span>
          </div>
        </div>

        {/* Prime Sales */}
        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-700">Prime Sales</h3>
            <p className="text-2xl font-bold text-green-500">₹15,000</p>
          </div>
          <div className="bg-green-100 p-4 rounded-full">
            <span className="text-3xl text-green-500">💰</span>
          </div>
        </div>

        {/* Events */}
        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-700">Upcoming Events</h3>
            <p className="text-2xl font-bold text-red-500">{dashboardData && dashboardData.eventData[0] ? dashboardData.eventData[0].upcomingEvents : 0}</p>
          </div>
          <div className="bg-red-100 p-4 rounded-full">
            <span className="text-3xl text-red-500">📅</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Sales Overview</h3>
          <Line data={lineChartData} />
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Votes by Color</h3>
          <Bar data={barChartData} />
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg col-span-1 md:col-span-2">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Traffic Sources</h3>
          <Pie data={pieChartData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

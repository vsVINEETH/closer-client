'use client'
import React, { useEffect, useState } from 'react';
import LineChart from '../charts/LineChart';
import PieChart from '../charts/PieChart';
import BarChart from '../charts/BarChart';
import { useFetch } from '@/hooks/fetchHooks/useAdminFetch';
import { DBD } from '@/types/customTypes';
import { getLineChartData, getBarChartData, getPieChartData } from '@/utils/chatjs/chartjs';
import DateFilter from '../DateFilter';
import Reports from '../reports/Reports';
import { Filter } from '@/types/customTypes';
import Loading from '@/components/Loading';

const Dashboard: React.FC = () => {
  const [currentTime] = useState(new Date().toLocaleTimeString())
  const [dashboardData, setDashboardData] = useState<DBD>();
  const [filter, setFilter] = useState<Filter>({startDate:'', endDate:''});
  const { getDashboardData,  isLoading } = useFetch();

  useEffect(() => {
    fetchData(filter);
  },[filter]);

  const fetchData = async (filterConstraints: Filter) => {
    const response = await getDashboardData(filterConstraints);

    if(response.data){
      setDashboardData(response.data);
    };
  }

  const handleFilter = (startDate: string, endDate: string) => {
    setFilter({startDate, endDate});
  };

  return (
    isLoading ? <Loading/> :(
    <div className="min-h-screen  dark:bg-nightBlack p-6">
        {/* Welcome Section */}
        <div className="p-1 rounded-lg flex items-center justify-between  dark:bg-nightBlack">
          <div>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-50">Welcome back!</h1>
            <p className="text-xs text-gray-500 dark:text-gray-300">Last login: Today, {currentTime}</p>
          </div>
          <div className='flex gap-3'>
          {/* Download Report */}
        { dashboardData?.salesData && <Reports salesData={dashboardData?.salesData} />}
          <DateFilter onFilter={handleFilter} />
         </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Total Users */}
        <div className="bg-white dark:bg-darkGray p-6 rounded-lg shadow-lg flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-50">Total Users</h3>
            <p className="text-2xl font-bold text-blue-500">{dashboardData && dashboardData?.userData?.totalUsers[0]?.count}</p>
          </div>
          <div className="bg-blue-100 p-4 rounded-full">
            <span className="text-3xl text-blue-500">👤</span>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white dark:bg-darkGray p-6 rounded-lg shadow-lg flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-50">Active Users</h3>
            <p className="text-2xl font-bold text-green-500">{dashboardData && dashboardData?.userData?.activeUsers[0]?.count}</p>
          </div>
          <div className="bg-green-100  p-4 rounded-full">
            <span className="text-3xl text-green-500">🟢</span>
          </div>
        </div>

        {/* New Users */}
        <div className="bg-white dark:bg-darkGray p-6 rounded-lg shadow-lg flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-50">New Users</h3>
            <p className="text-2xl font-bold text-yellow-500">{dashboardData && dashboardData?.userData?.newUsers.length > 0 ? dashboardData?.userData?.newUsers[0]?.count: 0 }</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-full">
            <span className="text-3xl text-yellow-500">✨</span>
          </div>
        </div>

        {/* Total Prime Users */}
        <div className="bg-white dark:bg-darkGray p-6 rounded-lg shadow-lg flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-50">Prime Users</h3>
            <p className="text-2xl font-bold text-purple-500">{dashboardData && dashboardData?.userData?.primeMembers[0]?.count}</p>
          </div>
          <div className="bg-purple-100 p-4 rounded-full">
            <span className="text-3xl text-purple-500">👑</span>
          </div>
        </div>

        {/* Total Employees */}
        <div className="bg-white dark:bg-darkGray p-6 rounded-lg shadow-lg flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-50">Total Employees</h3>
            <p className="text-2xl font-bold text-blue-500">{dashboardData && dashboardData?.employeeData[0]?.totalEmployees[0]?.count}</p>
          </div>
          <div className="bg-blue-100 p-4 rounded-full">
            <span className="text-3xl text-blue-500">👥</span>
          </div>
        </div>

        {/* Active Employees */}
        <div className="bg-white dark:bg-darkGray p-6 rounded-lg shadow-lg flex items-center justify-between">
          <div> 
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-50">Active Employees</h3>
            <p className="text-2xl font-bold text-green-500">{dashboardData && dashboardData?.employeeData[0]?.activeEmployees[0]?.count}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-full">
            <span className="text-3xl text-green-500">🟢</span>
          </div>
        </div>

        {/* Prime Sales */}
        <div className="bg-white dark:bg-darkGray p-6 rounded-lg shadow-lg flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-50">Prime Sales</h3>
            <p className="text-2xl font-bold text-green-500">{ dashboardData?.salesData.subscriptionSales.reduce((acc, item) => acc + item.amount, 0)}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-full">
            <span className="text-3xl text-green-500">💰</span>
          </div>
        </div>

        {/* Events */}
        <div className="bg-white dark:bg-darkGray p-6 rounded-lg shadow-lg flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-50">Upcoming Events</h3>
            <p className="text-2xl font-bold text-red-500">{dashboardData && dashboardData?.eventData[0] ? dashboardData?.eventData[0]?.upcomingEvents : 0}</p>
          </div>
          <div className="bg-red-100 p-4 rounded-full">
            <span className="text-3xl text-red-500">📅</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-white dark:bg-darkGray p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-50  mb-6">Growth Analytics</h3>
          <div className="p-4 ">
           {/* // <Line data={lineChartData} options={lineChartOptions} /> */}
            {dashboardData && <LineChart data={getLineChartData(dashboardData)}  />}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white dark:bg-darkGray p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-50 mb-6">Subscription Distribution</h3>
          <div className="p-4">
          {dashboardData &&<BarChart data={getBarChartData(dashboardData)}/>}
            {/* <Bar data={barChartData} options={barChartOptions} /> */}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white dark:bg-darkGray p-6 rounded-xl shadow-lg lg:col-span-2">
          <h3 className="text-xl font-semibold dark:text-gray-50 text-gray-700 mb-6">User Engagement by Gender</h3>
          <div className="p-4 flex justify-center" style={{ height: '400px' }}>
           {dashboardData && <PieChart data={getPieChartData(dashboardData)} />}
            {/* <Pie data={pieChartData} options={pieChartOptions} /> */}
          </div>
        </div>
      </div>
    </div>)
  );
};

export default Dashboard;

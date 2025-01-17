'use client'

import React,{ useEffect, useState } from 'react'
import { Newspaper, HandHeart, Share2, ChartNetwork } from 'lucide-react';
import useAxios from '@/hooks/useAxios/useAxios';
import { errorToast, successToast } from '@/utils/toasts/toats';

interface Data {
  title: string,
  subtitle: string,
  content: string,
}

interface DBD {
  totalContent: [{
    content: string,
    createdAt: string,
    downvotes: string[]
    image: string[],
    isListed: boolean,
    shares: string[]
    subtitle: string,
    title: string,
    updatedAt: string,
    upvotes: string[]
    _id: string,

  }],

  mostLiked: [{
    title: string,
    subtitle: string,
    content: string,
    image: string[],
    upvotesCount: number,
    createdAt: string,
  }],

  mostShared: [{
    title: string,
    subtitle: string,
    content: string,
    image: string[],
    sharesCount: number,
    createdAt: string,
  }],

  recentContent: [{
    content: string,
    createdAt: string,
    downvotes: string[]
    image: string[],
    isListed: boolean,
    shares: string[]
    subtitle: string,
    title: string,
    updatedAt: string,
    upvotes: string[]
    _id: string,
  }],

  trendingContents: [{
    content: string,
    createdAt: string,
    downvotes: string[]
    image: string[],
    isListed: boolean,
    shares: string[]
    subtitle: string,
    title: string,
    updatedAt: string,
    upvotes: string[]
    _id: string,
  }],

  popularCategory: [{
    _id: string,
    totalInteraction: number,
  }]
  
}

const blogEmojis = [
  "🥇", // First place
  "🥈", // Second place
  "🥉", // Third place
  "🔥", // Trending
  "🌟", // Starred or featured
  "📖", // Book or article
  "💡", // Idea or insightful
  "🎯", // On-point
  "📈", // Growth or popular
  "✨"  // Shining or special
];


const Dashboard: React.FC = () => {
  const [currentTime] = useState(new Date().toLocaleTimeString())
  const [dashboardData, setDashboardData] = useState<DBD | null>(null)
  const {handleRequest} = useAxios();

  useEffect(() => {
    fetchData();
  },[])

  const fetchData = async () => {
    const response = await handleRequest({
      url:'/api/employee/dashboard',
      method:'GET',
    });

    if(response.error){
      errorToast(response.error)
    }
    if(response.data){
      console.log(response.data)
      setDashboardData(response.data);
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Welcome back!</h1>
        <p className="text-sm text-gray-500">Last login: Today, {currentTime}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total blogs */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Newspaper/>
            </div>
            {/* <span className="text-sm font-medium text-green-600">+12%</span> */}
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{dashboardData ? dashboardData.totalContent.length: 0}</h3>
          <p className="text-sm text-gray-500">Total blogs</p>
        </div>

        {/*most liked blog */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <HandHeart/>
            </div>
            {/* <span className="text-sm font-medium text-green-600">+8%</span> */}
          </div>
          <h3 className="text-xl font-bold text-gray-900">{dashboardData ? dashboardData.mostLiked[0].title.toUpperCase(): 'Nothing'}</h3>
          <p className="text-sm text-gray-500">Most liked blog</p>
        </div>

        {/* Most shared blog */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Share2/>
            </div>
            {/* <span className="text-sm font-medium text-red-600">5 urgent</span> */}
          </div>
          <h3 className="text-xl font-bold text-gray-900">{dashboardData ? dashboardData.mostShared[0].title.toUpperCase(): 'Nothing'}</h3>
          <p className="text-sm text-gray-500">Most shared blog</p>
        </div>

        {/* popular category */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ChartNetwork/>
            </div>
            {/* <span className="text-sm font-medium text-green-600">+24%</span> */}
          </div>
          <h3 className="text-xl font-bold text-gray-900">{dashboardData ? dashboardData.popularCategory[0]._id.toUpperCase(): 'Nothing'}</h3>
          <p className="text-sm text-gray-500">Popular category</p>
        </div>
      </div>

      {/* Activity and Calendar Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Uploads */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Uploads</h2>
          <div className="space-y-4 max-h-80 overflow-y-auto"> {/* Set max-height and overflow */}
            {dashboardData && dashboardData?.recentContent ?dashboardData?.recentContent.map((blog, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-800">{blog.title}</p>
                  <p className="text-sm text-gray-500">{blog.subtitle}</p>
                </div>
                <span className="text-sm text-gray-400">{blog.content}</span>
              </div>
            )): <p>No more data</p>}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Treding blogs</h2>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {dashboardData&& dashboardData.trendingContents.length ? dashboardData?.trendingContents.map((blog, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-800">{blog.title}</p>
                  <p className="text-sm text-gray-500">{blog.subtitle}</p>
                </div>
                <span className='text-cyan-500 font-bold'>Top {blogEmojis[index]}</span>
                {/* <span className={`px-2 py-1 text-xs rounded-full ${
                  task.priority === 'High' ? 'bg-red-100 text-red-600' :
                  task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-green-100 text-green-600'
                 }`}>
                  {task.priority}
                </span> */}
              </div>
            )): 
            <p>No more data</p>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
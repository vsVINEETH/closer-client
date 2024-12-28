// BlogDetailPage.tsx
import React from 'react';
import Header from '@/components/user/Header';
import Footer from '@/components/user/Footer';
import SideBar from '@/components/user/SideBar';
import BlogDetail from '@/components/user/blog/BlogDetail';

const BlogDetailPage: React.FC<{ params: { id: string } }> = ({ params }) => {
  const { id } = params;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-row">
        <SideBar />
        <div className="min-h-screen w-lvw flex items-center justify-center p-4">
          <BlogDetail blogId={id} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogDetailPage;

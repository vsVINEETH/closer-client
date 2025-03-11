// BlogDetailPage.tsx
import React from 'react';
import Header from '@/components/reusables/Header';
import Footer from '@/components/reusables/Footer';
import SideBar from '@/components/user/SideBar';
import BlogDetail from '@/components/user/blog/BlogDetail';

const BlogDetailPage: React.FC<{ params: { id: string } }> = ({ params }) => {
  const { id } = params;

  return (
    <div className="flex flex-col min-h-screen  caret-transparent">
      <Header htmlFor='user'/>
      <div className="flex flex-row">
        <SideBar />
        <div className="min-h-screen w-lvw flex  justify-center p-4">
          <BlogDetail blogId={id} />
        </div>
      </div>
      <Footer htmlFor='user' />
    </div>
  );
};

export default BlogDetailPage;

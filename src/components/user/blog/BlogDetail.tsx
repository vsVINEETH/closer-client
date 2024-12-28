'use client';
import React, { useState, useEffect } from 'react';
import useAxios from '@/hooks/useAxios/useAxios';
import { ThumbsUp, ThumbsDown, AudioLines, Forward } from 'lucide-react';
import { errorToast, infoToast, successToast } from '@/utils/toasts/toats';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
interface Blog {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  image: string[];
  createdAt: string;
  upvotes: string[],
  downvotes: string[],
  shares: string[],
}

interface BlogDetailProps {
  blogId: string;
}

const BlogDetail: React.FC<BlogDetailProps> = ({ blogId }) => {
  const [blog, setBlog] = useState<Blog>();
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const { handleRequest } = useAxios();
  const user = useSelector((state: RootState) => state.user.userInfo);

  useEffect(() => {
    if (blogId) {
      fetchBlogDetail();
    }
  }, [blogId]);

  const fetchBlogDetail = async () => {
    if (!blogId) return;
    const response = await handleRequest({
      url: '/api/user/content_detail',
      method: 'GET',
      params: { id: blogId },
    });

    if (response.error) {
      console.error(response.error);
    }
    if (response.data) {
      setBlog(response.data);
    }
  };


  const handleVote = async (voteType: string) => {
    const response = await handleRequest({
      url:'/api/user/content_vote',
      method:'PATCH',
      data:{
        id:user?.id,
        blogId,
        voteType
      }
    });
    
    if(response.error){
      console.log(response.error)
    };

    if(response.data){
      setBlog(response.data);
    }
  }


  const handleShare = async () => {
    const shareData = {
      title: blog?.title || 'Blog',
      text: blog?.subtitle || 'Check out this amazing blog!',
      url: window.location.href,
    };
  
    if (navigator.share) {
      try {
        // Attempt to share via native sharing API
        await navigator.share(shareData);
  
        // Log the share on the server
        const response = await handleRequest({
          url: '/api/user/content_share',
          method: 'PATCH',
          data: {
            id: user?.id,
            blogId,
          },
        });
  
        if (response.error) {
          console.error('Error logging share:', response.error);
          errorToast('Something went wrong while logging the share.');
        } else if (response.data) {
          console.log('Share logged successfully:', response.data);
          setBlog(response.data)
        }
      } catch (error) {
        // Handle user cancelation or API error
        errorToast('Failed to share the blog.');
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support the share API
      try {
        await navigator.clipboard.writeText(shareData.url);
        infoToast('Link copied to clipboard');
      } catch (error) {
        console.error('Error copying link:', error);
        errorToast('Failed to copy the link.');
      }
    }
  };
  

  const handleAudioSummarizer = () => {
    if(!user?.prime?.isPrime){
      infoToast('This feature only for prime members');
      return;
    }
    if (!blog || !blog.content) {
      infoToast('No content available for audio summary.')
      return;
    }

    if (!('speechSynthesis' in window)) {
      infoToast('Text-to-Speech is not supported in this browser.')
      return;
    }

    const utterance = new SpeechSynthesisUtterance(blog.content);

    utterance.lang = 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsGeneratingAudio(true);
    };

    utterance.onend = () => {
      setIsGeneratingAudio(false);
    };

    utterance.onerror = (event) => {
      console.error('Error in speech synthesis:', event.error);
      setIsGeneratingAudio(false);
      errorToast('An error occurred during audio summary.')
    };

    speechSynthesis.speak(utterance);
  };

  return (
    <div className="p-8 bg-gradient-to-b min-h-screen">
      {blog ? (
        <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-2xl min-w-[320px]">
          <h1 className="text-5xl font-extrabold text-gray-800 mb-6">{blog.title}</h1>
          <p className="text-2xl text-gray-600 mb-8">{blog.subtitle}</p>
          <img
            src={blog?.image[0]}
            alt={blog.title}
            className="w-full h-[500px] object-cover rounded-xl mb-8 shadow-2xl"
          />
          <div className="text-gray-800 text-xl leading-relaxed mb-8">{blog.content}</div>

          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <div className="flex gap-2">
                <ThumbsUp size={25} onClick={() => handleVote('upvote')} 
                className={`cursor-pointer ${blog.upvotes.includes(user ? user.id: '') ? 'fill-customPink' : ''}`}
                />
                <p>{blog?.upvotes ? blog.upvotes.length : 0}</p>
              </div>
              <div className="flex gap-2">
                <ThumbsDown size={25} onClick={() => handleVote('downvote')}
                className={`cursor-pointer ${blog.downvotes.includes(user ? user.id: '') ? 'fill-customPink' : ''}`}
                />
                <p>{blog?.downvotes ? blog.downvotes.length : 0 }</p>
              </div>
            </div>
            <div className="flex gap-4">
              <AudioLines
                size={25}
                onClick={handleAudioSummarizer}
                className={isGeneratingAudio ? 'animate-spin text-blue-500' : 'cursor-pointer'}
              />
              <Forward size={25} onClick={handleShare} 
              className='cursor-pointer'
              />
              <span>{blog?.shares ? blog.shares.length : 0}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 text-2xl">Loading...</div>
      )}
    </div>
  );
};

export default BlogDetail;

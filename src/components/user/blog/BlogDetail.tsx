'use client';
import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, AudioLines, Forward} from 'lucide-react';
import { errorToast, infoToast } from '@/utils/toasts/toast';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useFetch } from '@/hooks/fetchHooks/useUserFetch';
import { useUserInteractions } from '@/hooks/crudHooks/user/useUserInteractions';

interface Blog {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  image: string[];
  createdAt: string;
  upvotes: string[];
  downvotes: string[];
  shares: string[];
}

interface BlogDetailProps {
  blogId: string;
}

const BlogDetail: React.FC<BlogDetailProps> = ({ blogId }) => {
  const [blog, setBlog] = useState<Blog>();
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const {getBlogDetails} = useFetch();
  const {manageBlogVoting, manageBlogSharing} = useUserInteractions()
  const user = useSelector((state: RootState) => state.user.userInfo);

  useEffect(() => {
    if (blogId) {
      fetchBlogDetail();
    }
  }, [blogId]);

  const fetchBlogDetail = async () => {
    if (!blogId) return;
    const response = await getBlogDetails(blogId);
    if (response.data) {
      setBlog(response.data);
    }
  };

  const handleVote = async (voteType: string) => {
    if(!user?.id){return};
    const response = await manageBlogVoting(user?.id, blogId, voteType);
    if (response.data) {
      setBlog(response.data);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: blog?.title || 'Blog',
      text: blog?.subtitle || 'Check out this amazing blog!',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        if(!user?.id){return}
        const response = await manageBlogSharing(user?.id, blogId)
        if (response.data) {
          setBlog(response.data);
        }
      } catch (error) {
        console.error(error)
        errorToast('Failed to share the blog.');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        infoToast('Link copied to clipboard');
      } catch (error) {
        console.error(error);
        errorToast('Failed to copy the link.');
      }
    }
  };

  const handleAudioSummarizer = () => {
    if (!user?.prime?.isPrime) {
      infoToast('This feature only for prime members');
      return;
    }
    if (!blog || !blog.content) {
      infoToast('No content available for audio summary.');
      return;
    }

    if (!('speechSynthesis' in window)) {
      infoToast('Text-to-Speech is not supported in this browser.');
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
      errorToast('An error occurred during audio summary.');
    };

    speechSynthesis.speak(utterance);
  };

  return (
    <div className="container mx-auto p-6">
     
      {blog ? (
        <div className="bg-white dark:bg-darkGray p-8 rounded-xl shadow-lg max-w-3xl mx-auto">
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold text-gray-900 dark:text-lightGray">{blog.title}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 font-semibold">{blog.subtitle}</p>
            <img
              src={blog?.image[0]}
              alt={blog.title}
              className="w-full h-[400px] object-cover rounded-lg shadow-md"
            />
            <div className="text-lg text-gray-800 leading-relaxed dark:text-gray-400">{blog.content}</div>
          </div>

          <div className="mt-8 flex justify-between items-center space-x-6">
            <div className="flex gap-6 items-center">
              <button
                onClick={() => handleVote('upvote')}
                className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-all ${
                  blog.upvotes.includes(user?.id || '') ? 'bg-customPink text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                <ThumbsUp size={20} />
                <span>{blog?.upvotes.length || 0}</span>
              </button>
              <button
                onClick={() => handleVote('downvote')}
                className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-all ${
                  blog.downvotes.includes(user?.id || '') ? 'bg-customPink text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                <ThumbsDown size={20} />
                <span>{blog?.downvotes.length || 0}</span>
              </button>
            </div>
            <div className="flex gap-6 items-center">
              <button
                onClick={handleAudioSummarizer}
                className={`p-3 rounded-lg transition-all ${
                  isGeneratingAudio ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                <AudioLines size={20} />
              </button>
              <button
                onClick={handleShare}
                className="p-3 rounded-lg bg-gray-200 text-gray-600 hover:bg-blue-500 hover:text-white transition-all"
              >
                <Forward size={20} />
              </button>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <span className="text-gray-500 dark:text-400">{blog?.shares.length || 0} Shares</span>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 text-2xl">Loading...</div>
      )}
    </div>
  );
};

export default BlogDetail;


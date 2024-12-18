import React from "react";
import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <footer className="bg-customPink text-white dark:text-lightGray dark:bg-darkGray py-5">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 ">
        <div className="ml-3">
          <h2 className="text-2xl font-extrabold mb-4">Closer</h2>
          <p className="">
            Your tagline or a brief description goes here. Building quality
            products since [Year].
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <Link href="#" className="">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.94 8.56a8 8 0 1 0-9.31 9.31v-6.59h-2v-2.72h2v-2.08c0-1.88 1.12-2.92 2.83-2.92.82 0 1.67.15 1.67.15v1.85h-.94c-.93 0-1.22.57-1.22 1.15v1.46h2.1l-.34 2.72h-1.76v6.59a8.04 8.04 0 0 0 6.53-9.31z" />
              </svg>
            </Link>
            <Link href="#" className="">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.954 4.569a10 10 0 0 1-2.825.775 4.995 4.995 0 0 0 2.165-2.725 10.148 10.148 0 0 1-3.127 1.2A4.929 4.929 0 0 0 16.675 3c-2.737 0-4.946 2.218-4.946 4.946 0 .39.042.765.124 1.124-4.111-.2-7.763-2.175-10.212-5.168a4.917 4.917 0 0 0-.666 2.485c0 1.71.873 3.216 2.204 4.098a4.903 4.903 0 0 1-2.237-.616v.06c0 2.385 1.692 4.374 3.946 4.827a4.932 4.932 0 0 1-2.224.084c.63 1.953 2.445 3.376 4.6 3.417a9.868 9.868 0 0 1-6.111 2.104c-.397 0-.788-.023-1.176-.067a13.975 13.975 0 0 0 7.557 2.213c9.054 0 14.007-7.496 14.007-13.986 0-.212-.006-.423-.017-.634a9.935 9.935 0 0 0 2.457-2.54z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        &copy; 2024 MyBrand. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

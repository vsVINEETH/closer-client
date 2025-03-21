import type { Metadata } from "next";
import localFont from "next/font/local";

import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';
import Providers from '@/store/Providers';
import { ThemeProvider } from "@/components/theme/DarkMode";
import { SessionWrapper } from "@/components/SessionWrapper";
import SocketProvider from "@/providers/SocketProviders";
import { QueryProvider } from "@/providers/TanStackQueryProvider";
import { LoadingProvider } from "@/context/LoadingContext";
import { ToastContainer } from 'react-toastify';
import ImageRefreshHandler from "@/utils/ImageUpdater";
import Call from '@/components/user/message/Call';
import CallNotification from '@/components/user/message/CallNotification';
import ChatBot from "@/components/Chatbot";
import 'react-toastify/dist/ReactToastify.css';
import 'react-image-crop/dist/ReactCrop.css'
import "animate.css"; 
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Closer",
  description: "Closer dating application - personal project",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const locale = await getLocale();
 
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (

        <html lang={locale}>
            <body
              className={`${geistSans.variable} ${geistMono.variable} antialiased dark:bg-nightBlack `}
            >
            <ToastContainer/>
              <NextIntlClientProvider messages={messages}>
                <QueryProvider>
                <Providers>
                  <ThemeProvider>
                  <SessionWrapper>
                    <SocketProvider> 
                    <CallNotification/> 
                     <Call/>
                     <ImageRefreshHandler/>
                      <LoadingProvider>
                        {children}
                       </LoadingProvider>
                      <ChatBot/> 
                    </SocketProvider>   
                    </SessionWrapper>
                  </ThemeProvider>
                </Providers>
               </QueryProvider>
              </NextIntlClientProvider>
            </body>
          
        </html>
   
    // 
  );
}

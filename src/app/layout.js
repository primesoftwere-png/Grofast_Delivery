import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import { SocketProvider } from "@/components/SocketProvider";
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "GroFast - Delivery Partner",
  description: "Delivery partner dashboard for GroFast",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <SocketProvider>
          <ClientLayout>{children}</ClientLayout>
          <Toaster position="top-center" />
        </SocketProvider>
      </body>
    </html>
  );
}

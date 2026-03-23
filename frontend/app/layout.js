import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "LevelUp",
  description: "Gamify your growth with LevelUp",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <Navbar />
          <main className="grow">{children}</main>
          <Footer />

          {/* Toast container */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                border: "1px solid black",
                padding: "12px",
                background: "#fff",
                color: "#000",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}

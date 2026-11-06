
import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "ABC.AI",
  description: "AI E-commerce Operations Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="overflow-hidden">
        <div className="flex h-screen overflow-hidden">

          <Sidebar />

          <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">

            <Header />

            <main className="flex-1 min-h-0 overflow-y-auto bg-slate-50 p-4 md:p-8">
              {children}
            </main>

          </div>
        </div>
      </body>
    </html>
  );
}

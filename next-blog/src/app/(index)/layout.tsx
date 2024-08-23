import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css"


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Blog App",
  description: "Blog Web App using next.js and spring boot",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>

        <div className="min-h-screen flex flex-col">
          <header className="bg-white shadow p-4">
            <div className="container mx-auto">
              <h1 className="text-3xl font-bold text-center">YHS의 블로그</h1>
            </div>
          </header>
          <main className="flex-grow">
            {children}
          </main>

          <footer className="bg-gray-800 text-white p-4 text-center">
            &copy 2024 현뚜의 블로그
          </footer>
        </div>

      </body>
    </html>
  );
}

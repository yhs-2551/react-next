import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import AuthProvider from "@/providers/AuthProvider";
import ToastProvider from "@/providers/ToastProvider";
import CommonFooter from "./_components/layout/footer/CommonFooter";
import CommonHeader from "./_components/layout/header/CommonHeader";

// import { config } from "@fortawesome/fontawesome-svg-core";
// import "@fortawesome/fontawesome-svg-core/styles.css";
// config.autoAddCss = false;

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
        <html lang='en'>
            <body className={inter.className}>
                {/* 전역 토스트 프로바이더 제대로 작동 안해서 안써도 될 것 같긴 한데 일단 보류  */}
                <ToastProvider /> 
                <AuthProvider />
                <div className='page-wrapper min-h-screen flex flex-col'>
                    <CommonHeader />
                    <main className='flex-grow'>{children}</main>
                    <CommonFooter />
                </div>
            </body>
        </html>
    );
}

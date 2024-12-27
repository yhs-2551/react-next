import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import AuthProvider from "@/providers/AuthProvider";
import ToastProvider from "@/providers/ToastProvider";
import CommonHeader from "./_components/layout/header/CommonHeader";
import CommonFooter from "./_components/layout/footer/CommonFooter";

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

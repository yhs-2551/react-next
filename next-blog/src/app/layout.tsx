import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";

import CommonHeader from "./(common)/header/CommonHeader";
import CommonFooter from "./(common)/footer/CommonFooter";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

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
                <div className='page-wrapper min-h-screen flex flex-col'>
                    <CommonHeader />
                    <main className='flex-grow'>{children}</main>
                    <CommonFooter />
                </div>
            </body>
        </html>
    );
}

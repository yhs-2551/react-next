"use client";

import { usePathname } from "next/navigation";
import React from "react";

function CommonFooter() {
    const pathname = usePathname();

    return (
        <>
            {pathname === "/posts" && (
                <footer className='bg-customFooterBackgroundColor text-gray-800 p-4 '>
                    <div className='text-sm text-center'>&copy; 2024 현뚜의 블로그</div>
                </footer>
            )}
        </>
    );
}

export default CommonFooter;

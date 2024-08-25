"use client";

import { usePathname } from "next/navigation";
import React from "react";

export default function CommonHeader() {
    const pathname = usePathname();

    return (

        <header className='bg-white'>
            <div className='w-full mx-auto'>
                {pathname === "/posts" ? (
                    <h1 className='text-3xl font-bold text-center border-b p-6'>
                        YHS의 블로그
                    </h1>
                ) : (
                    <h1 className='text-3xl font-bold text-center border-b p-6'>
                        글 작성 페이지
                    </h1>
                )}
            </div>
        </header>
    );
}

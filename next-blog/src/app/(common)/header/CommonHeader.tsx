"use client";

import { usePathname } from "next/navigation";
import React, { useEffect } from "react";

export default function CommonHeader() {
    const pathname = usePathname();
 

       {/* {pathname === "/posts" ? (
                    <h1 className='text-3xl font-bold text-center border-b p-6'>
                        YHS의 블로그
                    </h1>
                ) : (
                    <h1 className='text-3xl font-bold text-center border-b p-6'>
                        글 작성 페이지
                    </h1>
                )} */}

    return (

        <header className='bg-white flex items-center justify-between p-4 h-[5rem]'>
            <div className='flex items-center'>
                <img src='/path/to/logo.png' alt='Logo' className='h-8 w-8 mr-2' />
                <span className='text-xl font-bold'>YHS의 블로그</span>
            </div>
            <div className='flex items-center ql-toolbar-container'>
                {/* {pathname === "/posts" ? (
                    <h1 className='text-3xl font-bold'>YHS의 블로그</h1>
                ) : (
                    <h1 className='text-3xl font-bold'>글 작성 페이지</h1>
                )} */}
            </div>
            <div className='flex items-center'>
                <span className='mr-2'>사용자 이름</span>
                <img src='/path/to/user-logo.png' alt='User Logo' className='h-8 w-8 rounded-full' />
            </div>
        </header>
    );
}

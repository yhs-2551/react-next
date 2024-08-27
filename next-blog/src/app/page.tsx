"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
    const router = useRouter();

    const handleLoginClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        router.push("/login");
    };

    return (
        <div className='flex items-center justify-center min-h-screen bg-gray-100'>
            <a
                onClick={handleLoginClick}
                className='cursor-pointer px-4 py-2 bg-black text-white rounded-md hover:bg-red-500 focus:outline-none active:bg-red-400'
            >
                로그인
            </a>
        </div>
    );
}

"use client";

import { FileMetadata } from "@/types/PostTypes";
import NextImage from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PostCardProps {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    username: string;
    blogId: string;
    imageUrl?: string;
}
const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ko-KR").slice(0, -1); // 마지막 '.' 제거
};

export default function PostCard({ title, content, createdAt, username, imageUrl, blogId, id }: PostCardProps) {
    const router = useRouter();

    return (
        <Link
            href={`/${blogId}/posts/${id}`}
            className='block h-[23.125rem] w-[19.65rem] cursor-pointer bg-white rounded-lg 
        shadow-md overflow-hidden hover:shadow-lg transition-all duration-500 ease-out hover:-translate-y-3'
        >
            <div className='flex flex-col h-full'>
                {imageUrl && (
                    <div className='h-40 overflow-hidden'>
                        <NextImage
                            src={imageUrl}
                            width={314.4}
                            height={160}
                            alt='게시글 대표 이미지'
                            className='object-cover'
                            style={{ minWidth: "314.4px", maxWidth: "314.4px", minHeight: "160px", maxHeight: "160px" }}
                            quality={100}
                            sizes={`(max-width: 334px) 100vw, 314px`}
                            // loading='lazy'
                            priority={true}
                        />
                    </div>
                )}
                <div className='p-4 flex flex-col flex-grow'>
                    <h3 className='text-xl font-bold mb-2 truncate'>{title}</h3>
                    <p className='text-gray-600 line-clamp-3'>{content}</p>
                    <div className='mt-auto flex flex-col gap-2'>
                        <div className='text-sm'>
                            <span className='text-gray-500'>{formatDate(createdAt)}</span>
                            <hr className='my-2 border-gray-200' />
                            <span className='text-gray-600'>by {username}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

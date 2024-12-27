"use client";

import { FileMetadata } from "@/types/PostTypes";
import NextImage from "next/image";
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

export default function PostCard({ title, content, createdAt, username, imageUrl, blogId, id }: PostCardProps) {
    const router = useRouter();

    return (
        <div
            onClick={() => router.push(`/${blogId}/posts/${id}`)}
            className='h-[23.125rem] w-[19.65rem] cursor-pointer bg-white rounded-lg 
            shadow-md overflow-hidden hover:shadow-lg transition-all duration-500 ease-out hover:-translate-y-3'
        >
            {imageUrl && (
                <div className='h-40 overflow-hidden'>
                    <NextImage
                        src={imageUrl}
                        // fill={true}
                        width={314.4}
                        height={160}
                        alt='게시글 대표 이미지'
                        // onClick={toggleMenu}
                        className='object-cover'
                        priority={true}
                    />
                </div>
            )}
            <div className='p-4'>
                <h3 className='text-xl font-bold mb-2 truncate'>{title}</h3>
                <p className='text-gray-600 line-clamp-3'>{content}</p>
                <div className='mt-4 text-sm text-gray-500'>{new Date(createdAt).toLocaleDateString()}</div>
                <span className='text-gray-600 line-clamspan-3'>by {username}</span>
            </div>
        </div>
    );
}

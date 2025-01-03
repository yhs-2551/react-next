"use client";

import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "react-query";
import { useEffect } from "react";
import { PostResponse } from "@/types/PostTypes";
import EmptyState from "../_components/search/EmptyState";
import PostCardWithContent from "./PostCardWithContent";
import { AiOutlineClockCircle } from "react-icons/ai";

interface PostsGridProps {
    initialData: PostResponse[];
    totalElements: number;
}

export default function PostsGrid({ initialData, totalElements }: PostsGridProps) {
    const { ref, inView } = useInView();

    const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
        queryKey: ["posts", "allUsers", "recent"],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/posts?page=${pageParam}&size=10`);
            return res.json();
        },
        getNextPageParam: (serverResponse) => {
            3;
            if (serverResponse.data.hasNext) {
                return serverResponse.data.currentPage + 1; // 반환값이 다음 queryFn의 pageParam으로 전달후 queryFn 실행
            }
            return undefined;
        },
        // 컴포넌트 마운트 시점에 서버에서 받은 데이터로 초기화
        initialData: {
            pages: [{ data: { content: initialData, currentPage: 1, hasNext: true } }], // hasNext초기값 true 설정 따라서 hasNextPage도 초기에 true
            pageParams: [1], // 초기 상태에서 이미 요청한 페이지 번호 기록
        },
        enabled: false,
    });

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage(); // getNextPageParam실행
        }
    }, [inView]);

    return (
        <>
            {initialData.length === 0 ? (
                <EmptyState isSearch={false} />
            ) : (
                <>
                    <div className='w-full max-w-[1700px] mx-auto mt-[120px]'>
                        <div className='flex flex-col items-center'>
                            <div className='flex items-center gap-2 mb-[40px]'>
                                <AiOutlineClockCircle className='h-6 w-6 text-gray-600' />

                                <h2 className='text-2xl font-semibold text-[#222]'>
                                    <span>최신 글</span> <span className='text-[#333]'>({totalElements})</span>
                                </h2>
                            </div>
                            <div className='grid grid-cols-[repeat(auto-fit,19.65rem)] justify-center gap-8 w-full'>
                                {data?.pages.map((page) =>
                                    page.data.content.map((post: PostResponse) => <PostCardWithContent key={post.id} {...post} />)
                                )}
                            </div>
                        </div>
                    </div>
                    <div ref={ref} className='h-10' />
                </>
            )}
        </>
    );
}

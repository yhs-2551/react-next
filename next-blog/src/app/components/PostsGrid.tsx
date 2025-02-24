"use client";

import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import { PostResponse } from "@/types/PostTypes";
import EmptyState from "../_components/search/EmptyState";
import PostCardWithContent from "./PostCardWithContent";
import { AiOutlineClockCircle } from "react-icons/ai";
import { getInfiniteScrollPosts } from "@/actions/post.actions";

interface PostsGridProps {
    initialData: PostResponse[];
    totalElements: number;
}

export default function PostsGrid({ initialData, totalElements }: PostsGridProps) {
    const [indexPageIsInitialized, setIndexPageIsInitialized] = useState(false);

    const [page, setPage] = useState<number>(2); // 초기에 20개 가져오기 때문 3페이지부터 시작해야함.
    const [posts, setPosts] = useState<PostResponse[]>(initialData);

    const [hasNext, setHasNext] = useState<boolean>(true);

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { ref, inView } = useInView();

    // 무한 스크롤 방식에서 뒤로가기로 돌아올 때 이전 스크롤 위치를 유지하기 위해 필요
    useEffect(() => {
        const cachedPosts = sessionStorage.getItem("cached-users-posts");

        if (cachedPosts) {
            setPosts(JSON.parse(cachedPosts));
        }
        setIndexPageIsInitialized(true);
    }, []);

    // 무한 스크롤 방식에서 스크롤 위치를 유지하기 위해 필요
    useEffect(() => {
        if (indexPageIsInitialized && posts.length > 0) {
            sessionStorage.setItem("cached-users-posts", JSON.stringify(posts));
        }
    }, [posts, indexPageIsInitialized]);

    useEffect(() => {
        const loadMore = async () => {
            if (!inView || isLoading || !hasNext || posts.length === totalElements) return;

            setIsLoading(true);
            try {
                const response = await getInfiniteScrollPosts(page + 1);
                const newPosts = response.data.content;

                if (newPosts.length > 0) {
                    setPosts((prev) => {
                        // 새로운 데이터 추가 시, 기존 데이터와 키값 중복 오류 발생. 이에 따라 중복 제거
                        // filter를 쓰면 o(n^2)이라서  Map을 사용(o(n). Map은 키 값 중복(x) 동일한 키값은 최신 키 값으로 덮어씌움. 데이터가 많을수록 성능상 유리하다.
                        const combined = [...prev, ...newPosts];
                        return Array.from(new Map(combined.map((post) => [post.id, post])).values());
                    });
                    setPage((prev) => prev + 1);
                }

                setHasNext(response.data.hasNext);
            } catch (error) {
                console.error("무한 스크롤 데이터 로드 실패:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadMore();
    }, [inView]);

    // 새로고침시 최신 데이터를 불러올 수 있도록 함
    useEffect(() => {
        const beforeUnload = () => {
            sessionStorage.removeItem("cached-users-posts");
        };

        window.addEventListener("beforeunload", beforeUnload);
    }, []);

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
                                {posts.map((post) => (
                                    <PostCardWithContent key={post.id} {...post} />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div ref={ref} className='h-10' />
                </>
            )}
        </>
    );
}

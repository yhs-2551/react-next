"use client";

import React, { useEffect } from "react";

import PostItem from "./PostItem";
import { PostResponse } from "@/types/PostTypes";
import { useAuthStore } from "@/store/appStore";
import EmptyState from "@/app/_components/search/EmptyState";
import { FiFileText } from "react-icons/fi";
import { useParams } from "next/navigation";

interface BlogListProps {
    initialData: PostResponse[];
    keyword?: string;
    isSearch?: boolean;
    totalElements?: number;
}

function BlogList({ initialData, keyword, isSearch, totalElements }: BlogListProps) {
    const posts = initialData;
    const { isInitialized } = useAuthStore();

    const params = useParams();
    const categoryName = params.categoryName as string;

    useEffect(() => {
        if (isInitialized) {
            // 글 삭제 후 목록으로 리턴했을때 세션에 남아있는 isDeleting 삭제
            if (sessionStorage.getItem("isDeleting")) {
                sessionStorage.removeItem("isDeleting");
            }
        }
    }, [isInitialized]);

    const getListTitle = (categoryName?: string, isSearch?: boolean): string => {
        if (categoryName) return decodeURIComponent(categoryName); // params.categoryName에서 인코딩 된 상태이기 때문에 추가 디코딩 필요
        if (isSearch) return "검색 결과";
        return "게시글";
    };

    return (
        <>
            {initialData.length === 0 ? (
                <EmptyState keyword={keyword} isSearch={isSearch} />
            ) : (
                <div className='container max-w-4xl mx-auto p-10 mt-20'>
                    <div className='flex justify-center mb-[40px]'>
                        <h2 className='flex items-center gap-2 text-2xl font-semibold text-[#222]'>
                            <FiFileText className='w-6 h-6 text-gray-600' />
                            <span>{getListTitle(categoryName, isSearch)}</span>
                            <span className='text-[#333]'>({totalElements})</span>
                        </h2>
                    </div>

                    {/* any 타입 나중에 수정 */}
                    {posts?.map((post: PostResponse) => (
                        <PostItem
                            // 여기서 uuid를 사용하면 컴포넌트가 재렌더링 될때마다 새로운 key값이 생성되어 불필요한 재렌더링이 발생할 수 있기 때문에 uuid 사용 안함.
                            // 리스트에서 기존의 항목과 새롭게 추가된 항목을 구분함으로써 불필요한 재렌더링 방지를 위함
                            // uuid를 key값으로 사용하면 모든 리스트 아이템들의 key값이 매번 새롭게 생성되기 때문에, 매번 모든 리스트 요소들이 새롭게 추가되었다고 인식해서 불필요한 재렌더링이 발생하게 된다.
                            key={post.id}
                            postId={post.id}
                            title={post.title}
                            content={post.content}
                            createdAt={post.createdAt}
                            categoryName={post.categoryName}
                            postStatus={post.postStatus}
                            thumbnailUrl={
                                post.featuredImage
                                    ? post.featuredImage.fileUrl
                                    : "https://iceamericano-blog-storage.s3.ap-northeast-2.amazonaws.com/default/default-featured-image.jpg"
                            }
                        />
                    ))}
                </div>
            )}
        </>
    );
}

export default BlogList;

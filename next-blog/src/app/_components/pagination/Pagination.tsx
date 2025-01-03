"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
    isExistContent: boolean;
    totalPages: number;
    currentPage: number;
    blogId?: string; // 메인페이지에서는 blogId가 없음
    category?: string; // 카테고리 페이지에서만 존재
}

// currentPage 1부터 시작하도록 백엔드에서 변경했음
export default function Pagination({ isExistContent, totalPages, currentPage, blogId, category }: PaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const PAGES_PER_GROUP = 10;

    // 1-based 계산
    //Group 0: pages 1-10, Group 1: pages 11-20, Group 2: pages 21-30, ... 즉 그룹은 0부터 시작
    const currentGroup = Math.floor((currentPage - 1) / PAGES_PER_GROUP); // 2.7 -> 2, 11.2 -> 11 즉 소수점 버리기기
    // totalPages 수에 따라 총 그룹의 수 결정. totalPages = 23이면 totalGroups = 3(1~10, 11~20, 21~23)
    // 똑같이 Group0부터 시작, Group0: pages 1-10, Group1: pages 11-20, Group2: pages 21-23
    const totalGroups = Math.ceil(totalPages / PAGES_PER_GROUP); // 10.1 -> 11 즉 소수점 올리기

    const startPage = currentGroup * PAGES_PER_GROUP + 1; // 현재 그룹 위치에 따른 시작 페이지 계산

    /* 현재 그룹 위치에 따른 끝 페이지 계산
     Math Min사용의 이유는 아래와 같음 
     마지막 그룹에서 총 페이지수보다 더 큰 값이 나오는 것을 방지
     예시:
     totalPages = 23, PAGES_PER_GROUP = 10, currentGroup = 2(0부터 시작이니3번째 그룹)일 때
     (currentGroup + 1) * PAGES_PER_GROUP = 3 * 10 = 30
     Math.min(30, 23) = 23
     -> 마지막 그룹은 21-23페이지만 표시 */
    const endPage = Math.min((currentGroup + 1) * PAGES_PER_GROUP, totalPages);

    // pageNum SearchParams의 값이 변경됨에 따라 서버 컴포넌트 재실행
    const handlePageChange = (pageNum: number) => {
        const params = new URLSearchParams();
        params.set("page", pageNum.toString());

        // 검색 파라미터가 있는 경우
        if (searchParams.has("searchType") && searchParams.has("keyword")) {
            params.set("searchType", searchParams.get("searchType")!);
            params.set("keyword", searchParams.get("keyword")!);

            if (blogId) {
                router.push(`/${blogId}/posts/search?${params.toString()}`);
                return;
            } else {
                router.push(`/search?${params.toString()}`);
                return;
            }
        }
        // 일반 페이지네이션
        else {
            if (category && blogId) {
                router.push(`/${blogId}/categories/${category}/posts/page/${pageNum}`);
                return;
            }

            if (!category && blogId) {
                router.push(`/${blogId}/posts/page/${pageNum}`);
                return;
            }
        }
    };

    return (
        <>
            {isExistContent && (
                // 이전은 전 그룹으로 이동 ex: 11-20 -> 1-10, 다음은 다음 그룹으로 이동 ex: 11-20 -> 21-30
                <nav className='flex justify-center items-center gap-2 mb-10'>
                    <button
                        onClick={() => handlePageChange(startPage - 1)}
                        disabled={currentGroup <= 0}
                        className={`px-4 py-2 rounded-md shadow-sm transition-all duration-200 
                            ${currentGroup <= 0 ? "text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 hover:text-emerald-500"}`}
                    >
                        이전
                    </button>

                    <div className='flex gap-1'>
                        {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((pageNum) => (
                            <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`w-10 h-10 rounded-full transition-all duration-200
                                    ${
                                        currentPage === pageNum
                                            ? "bg-emerald-500 text-white shadow-md hover:bg-emerald-600"
                                            : "bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-500"
                                    }`}
                            >
                                {pageNum}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => handlePageChange(endPage + 1)}
                        disabled={currentGroup >= totalGroups - 1}
                        className={`px-4 py-2 rounded-md shadow-sm transition-all duration-200
                            ${
                                currentGroup >= totalGroups - 1
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "bg-white text-gray-700  hover:text-emerald-500"
                            }`}
                    >
                        다음
                    </button>
                </nav>
            )}
        </>
    );
}

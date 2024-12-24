"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
    totalPages: number;
    currentPage: number;
    blogId: string;
}

// currentPage 1부터 시작하도록 백엔드에서 변경했음
export default function Pagination({ totalPages, currentPage, blogId }: PaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const PAGES_PER_GROUP = 10;

    // 1-based 계산산

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

        if (searchParams.has("searchType")) {
            params.set("searchType", searchParams.get("searchType")!);
        }

        if (searchParams.has("keyword")) {
            params.set("keyword", searchParams.get("keyword")!);
        }

        router.push(`/${blogId}/posts?${params.toString()}`);
    };

    return (
        // 이전은 전 그룹으로 이동 ex: 11-20 -> 1-10, 다음은 다음 그룹으로 이동 ex: 11-20 -> 21-30
        <nav className='flex justify-center items-center gap-1 mt-8'>
            <button
                onClick={() => handlePageChange(startPage - 1)}
                disabled={currentGroup <= 0}
                className={`px-3 py-2 border rounded hover:bg-gray-50 ${currentGroup <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                이전
            </button>

            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((pageNum) => (
                <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 rounded ${currentPage === pageNum ? "bg-indigo-600 text-white" : "border hover:bg-gray-50"}`}
                >
                    {pageNum}
                </button>
            ))}

            <button
                onClick={() => handlePageChange(endPage + 1)}
                disabled={currentGroup >= totalGroups - 1}
                className={`px-3 py-2 border rounded hover:bg-gray-50 ${currentGroup >= totalGroups - 1 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                다음
            </button>
        </nav>
    );
}

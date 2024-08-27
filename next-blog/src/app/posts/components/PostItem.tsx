 
import { useRouter } from "next/navigation";
import React from "react";

interface PostProps {
    id: string;
    title: string;
    postStatus: "PUBLIC" | "PRIVATE";
    categoryName: string | null;
    createdAt: string;
    content: string;
}

function PostItem({
    id,
    title,
    postStatus,
    categoryName,
    createdAt,
    content,
}: PostProps) {

    const router = useRouter();

    const handleClick = () => {
   
        router.push(`/posts/${id}`);
    };

    const formattedDate = new Date(createdAt).toLocaleString("ko-KR", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: false, // 24시간 형식으로 표시
    });

    const isContentLong = content.length > 100; // content가 100글자 이상인지 체크

    return (
        <div className='flex py-4'>
            {/* 텍스트 부분 */}
            <div className='flex-grow flex flex-col'>
                <div className='flex items-center mb-2'>
                    <h3
                        className='text-xl font-semibold cursor-pointer'
                        onClick={handleClick}
                    >
                        {title}
                    </h3>
                    {/* 공개/비공개 상태 표시 */}
                    <span className='ml-2 text-sm text-gray-500'>
                        ({postStatus === "PUBLIC" ? "공개" : "비공개"})
                    </span>
                </div>

                {/* 카테고리와 날짜 부분 */}
                <div className='flex items-center text-sm text-gray-500 mb-2'>
                    <span className='mr-2'>
                        {categoryName !== null
                            ? `카테고리: ${categoryName}`
                            : "카테고리: 없음"}
                    </span>
                    <span>{formattedDate}</span>
                </div>

                {/* 내용 부분 - 클릭 가능하도록 수정 완료 */}
                <p
                    className='text-gray-700 mb-2 cursor-pointer'
                    onClick={handleClick}
                >
                    {content.substring(0, 100)}
                    {isContentLong ? "..." : ""}
                </p>

                {/* 버튼 부분 - 클릭 가능하도록 수정 완료*/}
                <div className='mt-2'>
                    <button
                        className='text-sm text-white bg-customButtonColor px-3 py-1 rounded cursor-pointer'
                        onClick={handleClick}
                    >
                        Read More
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PostItem;

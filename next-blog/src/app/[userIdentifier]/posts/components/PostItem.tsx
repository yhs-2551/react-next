import { extractTextWithoutImages } from "@/utils/extractTextWithoutImages";
import NextImage from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";

interface PostProps {
    postId: string;
    title: string;
    postStatus: "PUBLIC" | "PRIVATE";
    categoryName: string | null;
    createdAt: string;
    content: string;
    thumbnailUrl: string;
}

function PostItem({ postId, title, postStatus, categoryName, createdAt, content, thumbnailUrl }: PostProps) {
    
    const router = useRouter();

    const params = useParams();
    const userIdentifier = params.userIdentifier as string;

    // const handleClick = () => {
    //     router.push(`/posts/${postId}`);
    // };

    const formattedDate = new Date(createdAt).toLocaleString("ko-KR", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: false, // 24시간 형식으로 표시
    });

    const textContentWithoutImages = extractTextWithoutImages(content);

    const isContentLong = textContentWithoutImages.length > 100; // content가 100글자 이상인지 체크

    return (
        <div className='flex py-4'>
            {/* 썸네일 부분  */}
            {
                <div className='w-[12rem] mr-6 cursor-pointer' onClick={() => router.push(`/${userIdentifier}/posts/${postId}`)}>
                    <NextImage
                        src={thumbnailUrl}
                        alt='Post Thumbnail'
                        width={192} // 12rem = 192px
                        height={192} // 12rem = 192px
                        className='object-cover rounded'
                        style={{ minWidth: "12rem", minHeight: "12rem" }}
                        priority={true}
                    />
                </div>
            }

            {/* 텍스트 부분 */}
            <div className='flex flex-col justify-center'>
                <div className='flex items-center mb-2'>
                    <h3 className='text-xl font-semibold cursor-pointer' onClick={() => router.push(`/${userIdentifier}/posts/${postId}`)}>
                        {title}
                    </h3>
                    {/* 공개/비공개 상태 표시 */}
                    <span className='ml-2 text-sm text-gray-500'>({postStatus === "PUBLIC" ? "공개" : "비공개"})</span>
                </div>

                {/* 카테고리와 날짜 부분 */}
                <div className='flex items-center text-sm text-gray-500 mb-2'>
                    <span className='mr-2'>{categoryName !== null ? `카테고리: ${categoryName}` : "카테고리: 없음"}</span>
                    <span>{formattedDate}</span>
                </div>

                {/* 내용 부분 - 클릭 가능하도록 수정 완료 */}
                {textContentWithoutImages && (
                    <p className='text-gray-700 mb-2 cursor-pointer' onClick={() => router.push(`/${userIdentifier}/posts/${postId}`)}>
                        {textContentWithoutImages.substring(0, 100)}
                        {isContentLong ? "..." : ""}
                    </p>
                )}
                
                {/* 버튼 부분 - 클릭 가능하도록 수정 완료*/}
                <div className='mt-2'>
                    <button
                        className='text-sm text-white bg-customButtonColor px-3 py-1 rounded cursor-pointer'
                        onClick={() => router.push(`/${userIdentifier}/posts/${postId}`)}
                    >
                        Read More
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PostItem;

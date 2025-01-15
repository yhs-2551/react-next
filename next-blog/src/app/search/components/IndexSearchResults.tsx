import EmptyState from "@/app/_components/search/EmptyState";
import PostCard from "@/app/components/PostCard";
import PostCardWithContent from "@/app/components/PostCardWithContent";
import { PostResponse } from "@/types/PostTypes";
import { FiFileText } from "react-icons/fi";

interface IndexSearchResultsProps {
    searchData: PostResponse[];
    totalElements?: number;
    keyword?: string;
}

export default function IndexSearchResults({ searchData, keyword, totalElements }: IndexSearchResultsProps) {
    return (
        <>
            {searchData.length === 0 ? (
                <EmptyState isSearch={true} keyword={keyword} />
            ) : (
                <div className='w-full max-w-[1700px] mx-auto mt-[120px]'>
                    <div className='flex flex-col items-center pb-10'>
                        <h2 className='flex items-center gap-2 text-2xl font-semibold text-[#222] mb-10'>
                            <FiFileText className='w-6 h-6 text-gray-600' />
                            <span>검색 결과</span>
                            <span className='text-[#333]'>({totalElements})</span>
                        </h2>

                        <div className='grid grid-cols-[repeat(auto-fit,19.65rem)] justify-center gap-8 w-full'>
                            {searchData.map((post: PostResponse) => (
                                <PostCardWithContent key={post.id} {...post} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

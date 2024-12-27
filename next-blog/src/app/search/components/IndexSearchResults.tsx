import EmptyState from "@/app/_components/search/EmptyState";
import PostCard from "@/app/components/PostCard";
import { PostResponse } from "@/types/PostTypes";

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
                <div className='w-full max-w-[1700px] mx-auto mt-20'>
                    <div className='flex flex-col items-center'>
                        <div className='flex items-center gap-2 mb-6'>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                className='h-6 w-6 text-indigo-600'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                            >
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                            </svg>
                            <h2 className='text-2xl font-bold text-gray-800'>
                                <span className='relative'>
                                    {keyword}
                                    <span className='absolute bottom-0 left-0 w-full h-[3px] bg-indigo-600'></span>
                                </span>
                                <span> 검색 결과</span> <span className='text-indigo-600'>({totalElements})</span>
                            </h2>
                        </div>
                        <div className='grid grid-cols-[repeat(auto-fit,19.65rem)] justify-center gap-8 w-full'>
                            {searchData.map((post: PostResponse) => (
                                <PostCard key={post.id} {...post} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

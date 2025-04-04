interface EmptyStateProps {
    keyword?: string;
    isSearch?: boolean;
}

export default function EmptyState({ keyword, isSearch = false }: EmptyStateProps) {
    const getMessage = () => {
        if (isSearch) {
            return keyword ? `'${keyword}' 검색 결과가 존재하지 않습니다.` : "게시글이 존재하지 않습니다. 검색어를 입력 해주세요.";
        }
        return "페이지 또는 게시글을 찾을 수 없습니다.";
    };

    return (
        <div className='flex flex-col items-center justify-center mt-[120px]'>
            <svg className='w-16 h-16 text-gray-400 mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 21a9 9 0 110-18 9 9 0 010 18z'
                />
            </svg>
            <p className='text-gray-500 text-lg'>{getMessage()}</p>
        </div>
    );
}

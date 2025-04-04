import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useDebounce } from "use-debounce";
import { AiOutlineSearch } from "react-icons/ai";
import { extractTextWithoutImages } from "@/utils/extractTextWithoutImages";
import { getSearchSuggestions } from "@/actions/post.actions";
import { toast } from "react-toastify";
import { refreshToken } from "@/services/api";
import { CustomHttpError } from "@/utils/CustomHttpError";

interface SearchSuggestionProps {
    id: number;
    blogId: string;
    title: string;
    content?: string;
}
interface SearchInputProps {
    blogId: string | undefined;
    searchType: string;
    onSearch: (keyword: string) => void;
    categoryName: string | undefined;
    categoryNameByQueryParams: string | null;
}

interface SearchSuggestionProps {
    id: number;
    blogId: string;
    title: string;
    content?: string;
}

interface RecentSearch {
    keyword: string;
    searchType: string;
    timestamp: number;
}

const processSearchSuggestions = (data: SearchSuggestionProps[]): SearchSuggestionProps[] => {
    return data.map((item: SearchSuggestionProps) => {
        if (!item.content) return { ...item, content: "" };
        const cleanText = extractTextWithoutImages(item.content);
        const sliceText = cleanText.slice(0, 15);
        return {
            ...item,
            content: sliceText + (cleanText.length > 15 ? "..." : ""),
        };
    });
};

const STORAGE_KEY = "recentSearches";

export default function SearchInput({ blogId, searchType, onSearch, categoryName, categoryNameByQueryParams }: SearchInputProps) {
    const [keyword, setKeyword] = useState<string>("");
    const [suggestions, setSuggestions] = useState<SearchSuggestionProps[]>([]);

    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [debouncedKeyword] = useDebounce(keyword, 300);

    const router = useRouter();

    useEffect(() => {
        const fetchSuggestions = async () => {
            const token = localStorage.getItem("access_token");

            const data = await getSearchSuggestions(blogId, token, debouncedKeyword, searchType, categoryName, categoryNameByQueryParams);

            if (data.success === false) {
                if (data.status === 401) {
                    try {
                        const newAccessToken = await refreshToken();
                        if (newAccessToken) {
                            const retryData = await getSearchSuggestions(
                                blogId,
                                newAccessToken,
                                debouncedKeyword,
                                searchType,
                                categoryName,
                                categoryNameByQueryParams
                            );

                            if (retryData.success === false && retryData.status === 500) {
                                // 검색어 자동완성은 500에러가 발생해도, ux를 위해 굳이 에러 페이지로 안넘기면서 로그만 찍음
                                console.error("검색어 자동완성 데이터를 불러오는데 실패하였습니다.");
                            }

                            const retryProcessedData = processSearchSuggestions(retryData);
                            setSuggestions(retryProcessedData);
                        }
                    } catch (e: unknown) {
                        if (e instanceof CustomHttpError && e.status === 401) {
                            localStorage.removeItem("access_token");
                            toast.error(
                                <span>
                                    <span style={{ fontSize: "0.7rem" }}>{e.message}</span>
                                </span>,
                                {
                                    onClose: () => {
                                        window.location.reload();
                                    },
                                }
                            );
                        }
                    }
                } else {
                    // 검색어 자동완성은 500에러가 발생해도, ux를 위해 굳이 에러 페이지로 안넘기면서 로그만 찍음
                    console.error("검색어 자동완성 데이터를 불러오는데 실패하였습니다.");
                }
            }

            const processedData = processSearchSuggestions(data);
            setSuggestions(processedData);
        };

        fetchSuggestions();
    }, [debouncedKeyword, searchType]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 초기에 마운트 되면 최근 검색어 로드
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, []);

    const handleDeleteRecentSearch = (e: React.MouseEvent, timestamp: number) => {
        e.stopPropagation();
        const newRecentSearches = recentSearches.filter((item) => item.timestamp !== timestamp);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecentSearches));
        setRecentSearches(newRecentSearches);
    };

    // 최근 검색어 저장
    const saveRecentSearch = (keyword: string) => {
        const newSearch = {
            keyword,
            searchType,
            timestamp: Date.now(),
        };
        const updated = [...recentSearches.slice(0, 4), newSearch]; // 배열의 요소 타입과 관계없이 slice 적용
        setRecentSearches(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    const handleSuggestionsClick = (e: React.MouseEvent<HTMLLIElement>, blogId: string, id: number) => {
        e.preventDefault();
        router.push(`/${blogId}/posts/${id}`);
        setShowSuggestions(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (keyword.trim()) {
            saveRecentSearch(keyword.trim());
        }

        onSearch(keyword);
        setShowSuggestions(false);
    };

    return (
        <div ref={wrapperRef} className='relative w-60'>
            <form onSubmit={handleSubmit}>
                <input
                    ref={inputRef}
                    type='text'
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    className='w-full border rounded px-3 pr-12 py-2 text-sm' // pr-12로 오른쪽 여백 증가
                    placeholder='검색어를 입력하세요'
                />
                <button
                    type='submit'
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-600  hover:text-gray-500 transition-colors duration-200 ease-in-out '
                >
                    <AiOutlineSearch className='w-5 h-5' />
                </button>

                {showSuggestions && (
                    <ul className='absolute z-10 w-full bg-white border rounded-b mt-1 shadow-lg'>
                        {suggestions.length > 0 ? (
                            <>
                                <li className='px-4 py-2 text-xs text-gray-500 border-b'>관련 게시글</li>
                                {suggestions.map((suggestion: SearchSuggestionProps) => (
                                    <li
                                        key={suggestion.id}
                                        className='px-4 py-2 hover:bg-gray-100 cursor-pointer'
                                        onClick={(e) => handleSuggestionsClick(e, suggestion.blogId, suggestion.id)}
                                    >
                                        <div className='font-medium'>{suggestion.title}</div>
                                        {suggestion.content && <div className='text-sm text-gray-600 truncate'>{suggestion.content}</div>}
                                    </li>
                                ))}
                            </>
                        ) : keyword.length === 0 && recentSearches.length > 0 ? (
                            <>
                                <li className='px-4 py-2 text-xs text-gray-500 border-b'>최근 검색어</li>
                                {recentSearches.map((recent) => (
                                    <li
                                        key={recent.timestamp}
                                        className='px-4 py-2 hover:bg-gray-100 cursor-pointer'
                                        onClick={() => {
                                            setKeyword(recent.keyword);
                                            onSearch(recent.keyword);
                                            setShowSuggestions(false);
                                        }}
                                    >
                                        <div className='flex justify-between items-center'>
                                            <span>{recent.keyword}</span>

                                            <button
                                                onClick={(e) => handleDeleteRecentSearch(e, recent.timestamp)}
                                                className='text-gray-600 hover:text-gray-800'
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </>
                        ) : null}
                    </ul>
                )}
            </form>
        </div>
    );
}

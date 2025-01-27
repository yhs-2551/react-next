export const CacheTimes = {
    // 빈번한 데이터 일단 주석처리
    // FREQUENT: {
    //     INDEX_POSTS: 3600, // 1시간 (60 * 60)
    //     INDEX_POSTS_SEARCH_RESULTS: 3600,
    //     INDEX_INFINITE_SCROLL_POSTS: 3600,
    //     INDEX_SEARCH_SUGGESTIONS: 3600,
    // },
    MODERATE: {
        IS_USER_EXISTS: 43200, // 12시간 (60 * 60 * 12) 백엔드 24시간
        PUBLIC_PROFILE: 43200,  // 12시간 백엔드 24시간 
        PRIVATE_PROFILE: 21600, // 로그인할떄만 사용하기 때문에 저장공간 낭비 가능성이 있어 6시간으로. 백엔드에서 캐시x
        PUBLIC_USER_CATEGORY: 43200, // 12시간 백엔드 24시간 
        // POSTS_CATEGORY: 21600,
        // POSTS_CATEGORY_PAGINATION: 21600, // 6시간 (60 * 60 * 6)
        // POSTS_CATEGORY_SEARCH_SUGGESTIONS: 21600,
        POSTS: 21600, // 특정 사용자 첫 페이지는 조회수가 상대적으로 많은편이고, 수정이 빈번하지 않으므로 6시간
        // POSTS_PAGINATION: 21600,
        // POSTS_SEARCH_SUGGESTIONS: 21600,
        // POSTS_SEARCH_RESULTS: 21600,
        // POST_DETAIL: 21600,
        // POST_EDIT: 21600,
    },
    RARELY: {},
};

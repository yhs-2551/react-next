export const CacheTimes = {
    FREQUENT: {
        INDEX_POSTS: 3600, // 1시간 (60 * 60)
        INDEX_POSTS_SEARCH_RESULTS: 3600,
        INDEX_INFINITE_SCROLL_POSTS: 3600,
    },
    MODERATE: {
        IS_USER_EXISTS: 43200, // 12시간 (60 * 60 * 12)
        PUBLIC_PROFILE: 43200,
        PRIVATE_PROFILE: 43200,
        USER_CATEGORY: 43200,
        POSTS_CATEGORY: 21600,
        POSTS: 21600, // 6시간 (60 * 60 * 6)
        POSTS_PAGINATION: 21600,
        POSTS_SEARCH_RESULTS: 21600,
        POST_DETAIL: 21600,
        POST_EDIT: 21600,
    },
    RARELY: {},
};

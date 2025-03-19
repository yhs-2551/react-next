import { refreshToken } from "@/services/api";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { CustomHttpError } from "./CustomHttpError";
import { toast } from "react-toastify";
import {
    fetchPostDetail,
    fetchSpecificUserCategoryPaginationPosts,
    fetchSpecificUserCategoryPosts,
    fetchSpecificUserPaginationPosts,
    fetchSpecificUserPosts,
    searchPostsForUserPage,
} from "@/actions/post.actions";

/**
 * 인증이 필요한 API 요청을 처리하는 유틸리티 컴포넌트
 * 수정 페이지는 워낙 간단하기 때문에 FetchWithAuth를 사용하지 않음. 검색어 자동완성 부분은 함수 응답 형태가 다르며 다소 간단하기 때문에 사용하지 않음
 * toast의 <span>과 같이 쓰려면 jsx를 사용해야 해서 컴포넌트 형식으로 작성해야 함
 * 호출 하는 컴포넌트가 use client를 사용하고 있어서 자동으로 클라이언트 컴포넌트가 되기 때문에 따로 use client를 사용하지 않아도 됨
 */
export async function FetchWithAuth<T>({
    fetchFn,
    blogId,
    postId,
    queryParams,
    pageNum,
    categoryName,
    onSuccess,
    onError,
    onLoading,
    errorMessage,
    router,
}: {
    // API 호출 함수
    fetchFn:
        | "fetchPostDetail"
        | "fetchSpecificUserPosts"
        | "searchPostsForUserPage"
        | "fetchSpecificUserPaginationPosts"
        | "fetchSpecificUserCategoryPosts"
        | "fetchSpecificUserCategoryPaginationPosts";
    // API 파라미터
    blogId: string;
    postId?: string;
    queryParams?: string;
    pageNum?: string;
    categoryName?: string;
    // 콜백 함수들
    onSuccess: (data: T) => void;
    onError: (error: Error) => void;
    onLoading: (isLoading: boolean) => void;
    // 에러 메시지
    errorMessage: string;
    // 라우터
    router?: AppRouterInstance;
}): Promise<void> {
    try {
        const token = localStorage.getItem("access_token");

        let response;

        if (fetchFn === "fetchPostDetail" && postId) {
            response = await fetchPostDetail(blogId, postId, token);
        } else if (fetchFn === "fetchSpecificUserPosts") {
            response = await fetchSpecificUserPosts(blogId, token);
        } else if (fetchFn === "searchPostsForUserPage" && queryParams) {
            response = await searchPostsForUserPage(blogId, queryParams, token);
        } else if (fetchFn === "fetchSpecificUserPaginationPosts" && pageNum) {
            response = await fetchSpecificUserPaginationPosts(blogId, pageNum, token);
        } else if (fetchFn === "fetchSpecificUserCategoryPosts" && categoryName) {
            response = await fetchSpecificUserCategoryPosts(blogId, categoryName, token);
        } else if (fetchFn === "fetchSpecificUserCategoryPaginationPosts" && categoryName && pageNum) {
            response = await fetchSpecificUserCategoryPaginationPosts(blogId, categoryName, pageNum, token);
        }

        if (response.success === false) {
            if (response.status === 401) {
                try {
                    const newAccessToken = await refreshToken();
                    if (newAccessToken) {
                        let retryResponse;

                        if (fetchFn === "fetchPostDetail" && postId) {
                            retryResponse = await fetchPostDetail(blogId, postId, token);
                        } else if (fetchFn === "fetchSpecificUserPosts") {
                            retryResponse = await fetchSpecificUserPosts(blogId, token);
                        } else if (fetchFn === "searchPostsForUserPage" && queryParams) {
                            retryResponse = await searchPostsForUserPage(blogId, queryParams, token);
                        } else if (fetchFn === "fetchSpecificUserPaginationPosts" && pageNum) {
                            retryResponse = await fetchSpecificUserPaginationPosts(blogId, pageNum, token);
                        } else if (fetchFn === "fetchSpecificUserCategoryPosts" && categoryName) {
                            retryResponse = await fetchSpecificUserCategoryPosts(blogId, categoryName, token);
                        } else if (fetchFn === "fetchSpecificUserCategoryPaginationPosts" && categoryName && pageNum) {
                            retryResponse = await fetchSpecificUserCategoryPaginationPosts(blogId, categoryName, pageNum, token);
                        }

                        if (retryResponse.success === false) {
                            if (retryResponse.status === 404 && router) {
                                router.push("/404");
                            } else if (retryResponse.status === 500) {
                                onError(new Error(errorMessage));
                            }
                        } else {
                            onSuccess(retryResponse.data!);
                        }
                    }
                } catch (e: unknown) {
                    // refreshToken() 메서드 catch 처리
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
            } else if (response.status === 404 && router) {
                router.push("/404");
            } else if (response.status === 500) {
                onError(new Error(errorMessage));
            }
        } else {
            onSuccess(response.data!);
        }
    } finally {
        onLoading(false);
    }
}

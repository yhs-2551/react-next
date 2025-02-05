"use client";
import { fetchCategoriesNotToken, fetchCategoriesWithToken } from "@/actions/category-actions";
import { useCategoryStore, userProfileStore } from "@/store/appStore";
import { useEffect } from "react";

interface UserDataInitializerProps {
    blogName: string;
    blogId: string;
    blogUsername: string;
    profileImageUrl: string;
}

export default function UserDataInitializer({ blogName, blogId, blogUsername, profileImageUrl }: UserDataInitializerProps) {
    const { setBlogName, setBlogId, setBlogUsername, setProfileImage } = userProfileStore();
    const { setCategories } = useCategoryStore();

    useEffect(() => {
        setBlogName(blogName);
        setBlogId(blogId);
        setBlogUsername(blogUsername);
        setProfileImage(profileImageUrl);
    }, [blogName, blogId, blogUsername, profileImageUrl]);

    // 카테고리 데이터 조회시 백엔드에서 액세스 토큰을 이용한 분기 처리 진행
    useEffect(() => {
        async function updateCategories() {
            const accessToken = localStorage.getItem("access_token") as string | null | undefined;

            try {
                let categoryData;

                if (accessToken) {
                    categoryData = await fetchCategoriesWithToken(blogId, accessToken);
                } else {
                    categoryData = await fetchCategoriesNotToken(blogId);
                }

                setCategories(categoryData.data || []);
            } catch (error) {
                console.error("카테고리 업데이트 실패:", error);
            }
        }
        updateCategories();
    }, [blogId]);

    return null;
}

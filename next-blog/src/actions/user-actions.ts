"use server";

import { CacheTimes } from "@/constants/cache-constants";
import { refreshToken } from "@/services/api";
import { CustomHttpError } from "@/utils/CustomHttpError"; 
import { revalidateTag } from "next/cache";

interface UserSettingsFormData extends FormData {
    append(name: "blogName", value: string): void;
    append(name: "username", value: string): void;
    append(name: "profileImage", value: File): void;
}

// 로그인 직후 email을 포함한 사용자 정보를 불러올땐, 새로운 액세스 토큰을 발급 받은 상태이기 때문에 response.status === 401인 경우는 없음
export async function getUserPrivateProfile(token: string) {
    const getPrivateProfile = async (accessToken: string) => {
        return await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/users/profile/private`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            cache: "force-cache",
            next: { tags: ["private-profile"], revalidate: CacheTimes.MODERATE.PRIVATE_PROFILE },
        });
    };

    const response = await getPrivateProfile(token);

    if (!response.ok) {
        throw new Error("사용자 비공개 프로필을 불러오는데 실패 하였습니다.");
    }

    return await response.json();
}

// 나중에 blogId도 바꿀 수 있으면 blogId 체크하는 users-${blogId}-checks 태그 무효화 필요
export async function updateProfile(token: string, blogId: string, formData: UserSettingsFormData) {
    const updateUserProfile = async (accessToken: string) => {
        return await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/users/${blogId}/settings`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
        });
    };

    let response = await updateUserProfile(token);

    if (!response.ok && response.status === 401) {
        try {
            // 리프레시 토큰이 만료되지 않았다면 리프레시 토큰으로 액세스 토큰 재발급
            const newAccessToken = await refreshToken();

            if (newAccessToken) {
                response = await updateUserProfile(newAccessToken);
            }
        } catch (e: any) {
            throw new CustomHttpError(e.status, e.message); // 리프레시 토큰도 만료될 시 재로그인이 필요합니다. 메시지 응답 받음.
    
        }
    }

    if (!response.ok) {
        throw new Error("프로필 업데이트에 실패 하였습니다.");
    }

    // 나중에 blogId도 바꿀 수 있으면 blogId 체크하는 users-${blogId}-checks 태그 무효화 필요
    await revalidateTag("private-profile");
    await revalidateTag("public-profile");

    return await response.json();
}

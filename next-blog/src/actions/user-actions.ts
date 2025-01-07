"use server";

import { refreshToken } from "@/services/api";
import { revalidatePath } from "next/cache";

interface UserSettingsRequest {
    blogName: string;
    blogUsername: string;
    profileImageUrl: string | null;
}

// export async function getUserProfile(blogId: string) {
//     try {
//         const response = await fetch(
//             `${process.env.BACKEND_URL}${process.env.BACKEND_PATH}/users/${blogId}/profile`,
//             {
//                 headers: {
//                     'Cookie': cookies().toString()
//                 },
//                 cache: 'force-cache',
//                 next: {
//                     tags: [`user-${blogId}`]
//                 }
//             }
//         );

//         if (!response.ok) {
//             throw new Error('Failed to fetch user profile');
//         }

//         const data = await response.json();
//         return data;
//     } catch (error) {
//         console.error('Error fetching user profile:', error);
//         throw error;
//     }
// }

export async function getUserPrivateProfile(token: string) {
 
        const getPrivateProfile = async (accessToken: string) => {
            return await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/users/profile/private`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                cache: "force-cache",
            });
        };

        let response = await getPrivateProfile(token);

        if (!response.ok && response.status === 401) {
            // 만약 리프레시 토큰이 만료되었을 경우 만료된 액세스 토큰 사용해서 액세스 토큰 재발급
            // 리프레시 토큰이 만료되지 않았다면 리프레시 토큰으로 액세스 토큰 재발급
            const newAccessToken = await refreshToken();

            if (newAccessToken) {
                response = await getPrivateProfile(newAccessToken);
            }
        }

        if (!response.ok) {
            throw new Error("사용자 비공개 프로필을 불러오는데 실패 하였습니다.");
        }

        return response.json();

}

export async function updateProfile(token: string, blogId: string, updateData: UserSettingsRequest) {
    try {
        const updateUserProfile = async (accessToken: string) => {
            return await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/users/${blogId}/settings`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(updateData),
            });
        };

        let response = await updateUserProfile(token);

        if (!response.ok && response.status === 401) {
            // 만약 리프레시 토큰이 만료되었을 경우 만료된 액세스 토큰 사용해서 액세스 토큰 재발급
            // 리프레시 토큰이 만료되지 않았다면 리프레시 토큰으로 액세스 토큰 재발급
            const newAccessToken = await refreshToken();

            if (newAccessToken) {
                response = await updateUserProfile(newAccessToken);
            }
        }

        if (!response.ok) {
            throw new Error("프로필 업데이트에 실패 하였습니다.");
        }

        revalidatePath(`/${blogId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "프로필 업데이트에 실패 하였습니다." };
    }
}

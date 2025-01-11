import { useMutation } from "@tanstack/react-query";

import { CustomHttpError } from "@/utils/CustomHttpError";
import { refreshToken } from "@/services/api";

interface UserSettingsFormData extends FormData {
    append(name: "blogName", value: string): void;
    append(name: "username", value: string): void;
    append(name: "profileImage", value: File): void;
}

interface UpdateProfileParams {
    token: string;
    blogId: string;
    formData: UserSettingsFormData;
}

export default function useUpdateProfile() {
    return useMutation({
        mutationFn: async ({ token, blogId, formData }: UpdateProfileParams) => {
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
                    const newAccessToken = await refreshToken();

                    if (newAccessToken) {
                        response = await updateUserProfile(newAccessToken);
                    }
                } catch (error: unknown) {
                    // refreshToken()에서 만료되면 재로그인 필요
                    if (error instanceof CustomHttpError) {
                        throw new CustomHttpError(error.status, "세션이 만료되었습니다.\n재로그인 해주세요.");
                    }
                }
            }

            if (!response.ok) {
                throw new CustomHttpError(response.status, "서버측 오류로 인해 프로필 업데이트에 실패하였습니다.\n잠시 후 다시 시도해주세요.");
            }

            await response.json();
        },
    });
}

"use client";

import { useAuthStore } from "@/store/appStore";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

export default function OAuth2RedirectHandler() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const { setShowOAuth2NewUserModal, setTempOAuth2UserUniqueId, setOAuth2Redirect } = useAuthStore();

    useEffect(() => {
        const lastVisitedPath = sessionStorage.getItem("lastVisitedPath") ?? "/";
        const showNewUserModal = searchParams.get("showNewUserModal");
        const tempOAuth2UserUniqueId = searchParams.get("tempOAuth2UserUniqueId");

        const isDirect = searchParams.get("direct");

        if (showNewUserModal === "true") {
            router.replace(lastVisitedPath);

            // 확실히 replace 후에 모달을 띄우기 위해 setTimeout 사용. 700ms 정도의 딜레이가 적당함.
            setTimeout(() => {
                setShowOAuth2NewUserModal(true);
                setTempOAuth2UserUniqueId(tempOAuth2UserUniqueId!);
            }, 700);
        }

        if (isDirect === "true") {
            // 리다이렉트 후 액세스 토큰 발급을 위해
            // 리다이렉트 후 액세스 토큰 발급 과정에서 AuthProvider가 먼저 실행되는 현상 제어를 위함
            router.replace(lastVisitedPath);
            setOAuth2Redirect(true);
        }
    }, []);

    return null;
}

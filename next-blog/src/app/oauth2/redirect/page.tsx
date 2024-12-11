"use client";

import { useAuthStore } from "@/store/appStore";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

export default function OAuth2RedirectHandler() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const { setShowOAuth2NewUserModal, setTempOAuth2UserUniqueId } = useAuthStore();

    useEffect(() => {
        const lastVisitedPath = localStorage.getItem("lastVisitedPath") ?? "/";
        // url의 쿼리 파라미터를 읽을때는 모든 값이 문자열로 반환.
        const showNewUserModal = searchParams.get("showNewUserModal");
        const tempOAuth2UserUniqueId = searchParams.get("tempOAuth2UserUniqueId");

        console.log("tempOAuth2UserUniqueId >>>", tempOAuth2UserUniqueId);

        const isDirect = searchParams.get("direct");

        if (showNewUserModal === "true") {
            router.replace(lastVisitedPath);
            setShowOAuth2NewUserModal(true);
            localStorage.removeItem("lastVisitedPath");
            
            setTempOAuth2UserUniqueId(tempOAuth2UserUniqueId!); // 최종적으로 추가 정보 등록시 tempOAuth2UserUniqueId를 formData와 함께 서버측으로 전송
        }

        if (isDirect === "true") {
            router.replace(lastVisitedPath);
            localStorage.removeItem("lastVisitedPath");
        }
    }, []);

    return null;
}

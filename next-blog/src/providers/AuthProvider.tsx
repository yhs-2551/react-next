"use client";

import EmailVerificationModal from "@/app/_components/auth/EmailVerificationModal";
import LoginModal from "@/app/_components/auth/LoginModal";
import OAuth2NewUserModal from "@/app/_components/auth/OAuth2NewUserModal";
import SignUpModal from "@/app/_components/auth/SignUpModal";
import { checkAccessToken, fetchAccessToken, logoutUser } from "@/services/api";
import { useAuthStore } from "@/store/appStore";
import { CustomHttpError } from "@/utils/CustomHttpError";
import { refreshToken } from "@/utils/refreshToken";
import { jwtDecode } from "jwt-decode";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

export default function AuthProvider() {
    const {
        showLogin,
        showSignUp,
        showEmailVerification,
        signupUser,
        setInitialized,
        isShowOAuth2NewUserModal,
        isOAuth2Redirect,
        setOAuth2Redirect,
    } = useAuthStore();

    // OAUTH2 로그인 처리
    useEffect(() => {
        const handleOAuth2Login = async () => {
            if (isOAuth2Redirect) {
                const OAuth2User = sessionStorage.getItem("OAuth2User");
                const isRegistered = sessionStorage.getItem("OAuth2NewUserIsRegistered");

                if (OAuth2User === "existingUser" || (OAuth2User === "newUser" && isRegistered === "true")) {
                    await fetchAccessToken(); // OAUTh2 로그인 사용자 초기 액세스 토큰 발급 처리
                }

                setOAuth2Redirect(false);  
                setInitialized(true);
            }
        };

        handleOAuth2Login();
    }, [isOAuth2Redirect]);

    // 새로고침 시 새로운 마운트로 간주되어 재실행
    useEffect(() => {
        // 다시 방문 시 리프레시 토큰으로 액세스 토큰을 갱신. RememberMe사용자 -> 2주간 로그인 유지, 아닌 사용자 -> 하루간 로그인 유지
        const newAccessToken = async () => {
            console.log("실행은되나");

            const isValidToken: boolean | undefined | null = await checkAccessToken();

            // 이 코드 없으면 OAUTH2 로그인 진행시에, OAUTH2의 setInitialized보다 아래쪽에 setInitialized(true) 코드가 먼저 실행되어
            // CommonHeader에서 accessToken이 null로 인식. -> OAuth2 로그인 후 로그인 상태가 유지되지 않음.
            if (isValidToken === null || isValidToken === undefined) return;

            if (isValidToken === false) {
                try {
                    await refreshToken();
                } catch (error: unknown) {
                    // 실패 응답인 이유는 쿠키에 있는 리프레시 토큰이 만료되었기 때문에 아예 재로그인이 필요
                    if (error instanceof CustomHttpError) {
                        localStorage.removeItem("access_token");
                    }
                }
            }

            setInitialized(true);
        };

        newAccessToken();
    }, []);

    return (
        <>
            {showLogin && <LoginModal />}
            {showSignUp && <SignUpModal />}
            {showEmailVerification && <EmailVerificationModal user={signupUser} />}
            {isShowOAuth2NewUserModal && <OAuth2NewUserModal />}
        </>
    );
}

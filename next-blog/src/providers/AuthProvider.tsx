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
import React, { Dispatch, SetStateAction, useEffect } from "react";

export default function AuthProvider() {
    const { showLogin, showSignUp, showEmailVerification, signupUser, setShowEmailVerification, setInitialized, isShowOAuth2NewUserModal } = useAuthStore();

    useEffect(() => {

        // 다시 방문 시 리프레시 토큰으로 액세스 토큰을 갱신. RememberMe사용자 -> 2주간 로그인 유지, 아닌 사용자 -> 하루간 로그인 유지
        const newAccessToken = async () => {

            await fetchAccessToken(); // OAUTh2 로그인 사용자 초기 액세스 토큰 발급 처리
             
            const isValidToken: boolean | undefined | null = await checkAccessToken();

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

    const handleVerificationSuccess = () => {
        // EmailVerificationModal컴포넌트안에서 setIsClosing(true)을 통해 종료 애니메이션 효과 시작
        setTimeout(() => {
            setShowEmailVerification(false);
        }, 300);

        // 2. 인증 상태 업데이트 이건 고려 jwt 사용하는데..
        // setIsAuthenticated(true);

        // 3. 추가로 필요한 작업 (예: 회원가입 완료, 리다이렉트 등)
    };

    const handleModalClose = (setIsClosing: Dispatch<SetStateAction<boolean>>) => {
        setIsClosing(true); // 종료 애니메이션 효과 시작
        // 종료 애니메이션 효과가 끝나고 실제 이메일 인증 모달을 화면에 보이지 않게함. 아래 코드가 없다면 인증 모달이 다시 위로 올라와서 화면에 남아있게 됨
        setTimeout(() => {
            setShowEmailVerification(false);
        }, 300);
    };

    return (
        <>
            {showLogin && <LoginModal />}
            {showSignUp && <SignUpModal />}
            {showEmailVerification && <EmailVerificationModal user={signupUser} onClose={handleModalClose} onVerified={handleVerificationSuccess} />}
            {isShowOAuth2NewUserModal && <OAuth2NewUserModal />}
        </>
    );
}

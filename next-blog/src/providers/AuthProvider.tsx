"use client";

import EmailVerificationModal from "@/app/_components/auth/EmailVerificationModal";
import LoginModal from "@/app/_components/auth/LoginModal";
import SignUpModal from "@/app/_components/auth/SignUpModal"; 
import { useAuthStore } from "@/store/appStore";
import React, { Dispatch, SetStateAction } from "react";

export default function AuthProvider() {
    const { showLogin, showSignUp, showEmailVerification, email, setShowEmailVerification, setIsAuthenticated } = useAuthStore();

    const handleVerificationSuccess = () => {
        // 1. 이메일 인증 모달 닫기
        setShowEmailVerification(false);

        // 2. 인증 상태 업데이트
        setIsAuthenticated(true);

        // 3. 추가로 필요한 작업 (예: 회원가입 완료, 리다이렉트 등)
    };

    const handleModalClose = (setIsClosing: Dispatch<SetStateAction<boolean>>) => {
        setIsClosing(true); // 종료 애니메이션 효과 시작
        // 종료 애니메이션 효과가 끝나고 실제 이메일 인증 모달을 화면에 보이지 않게함.
        setTimeout(() => {
            setShowEmailVerification(false);
        }, 300);
    }

    return (
        <>
            {showLogin && <LoginModal />}
            {showSignUp && <SignUpModal />}
            {showEmailVerification && (
                <EmailVerificationModal email={email} onClose={handleModalClose} onVerified={handleVerificationSuccess} />
            )}
        </>
    );
}

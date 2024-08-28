"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useSignUp from "@/customHooks/useSignUp";

function SignUp() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(true);

  const signUpMutation = useSignUp();

  const handleSignUp = () => {
    signUpMutation.mutate(
      {
        username,
        email,
        password,
      },
      {
        onSuccess: () => {
          console.log("회원가입 성공 SignUp Page");
          setShowModal(false);
          setTimeout(() => router.push("/"), 300); // 성공 시 홈으로 리다이렉트
        },
        onError: (error) => {
          console.log("회원가입 실패 SignUp Page: ", error);
        },
      }
    );
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTimeout(() => router.push("/"), 300); // 애니메이션이 끝난 후 홈으로 리다이렉트
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black bg-opacity-30">
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ y: "100vh", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100vh", opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 270,
              damping: 30,
            }}
            className="relative flex w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg"
          >
            {/* 왼쪽 부분 - 이미지와 텍스트 */}
            <div className="flex flex-col items-center justify-center w-1/2 p-6 bg-gray-100 rounded-l-lg">
              <Image
                src="/profile.png"
                width={150}
                height={150}
                alt="환영 이미지"
              />
              <h2 className="mt-4 text-xl font-semibold text-gray-800">
                환영합니다!
              </h2>
            </div>

            {/* 오른쪽 부분 - 회원가입 폼 */}
            <div className="w-1/2 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">회원가입</h2>
                <button
                  className="text-gray-600 hover:text-black"
                  onClick={handleCloseModal}
                >
                  닫기
                </button>
              </div>

              <p className="text-gray-600 mb-4">이메일로 회원가입</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSignUp();
                }}
              >
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="사용자명을 입력하세요."
                    className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <input
                    type="email"
                    placeholder="이메일을 입력하세요."
                    className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <input
                    type="password"
                    placeholder="비밀번호를 입력하세요."
                    className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 mt-2 text-white bg-green-500 rounded-lg hover:bg-green-600"
                >
                  회원가입
                </button>
              </form>

              <div className="mt-6 mb-4 text-center">
                <p className="text-gray-600">소셜 계정으로 회원가입</p>
              </div>
              <div className="flex justify-center space-x-4 mb-4">
                <button className="text-black">
                  <i className="fab fa-github fa-2x"></i>
                </button>
                <button className="text-blue-500">
                  <i className="fab fa-google fa-2x"></i>
                </button>
                <button className="text-blue-700">
                  <i className="fab fa-facebook fa-2x"></i>
                </button>
              </div>
              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  계정이 이미 있으신가요?{" "}
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      router.push("/login");
                    }}
                    className="cursor-pointer text-green-500 hover:underline"
                  >
                    로그인
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SignUp;
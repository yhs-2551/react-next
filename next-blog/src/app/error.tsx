"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    const router = useRouter();
    const isAuthError = error.message?.includes("권한");
    const isDataError = error.message?.includes("데이터");
    const isServerError = error.message?.includes("서버");

    return (
        <div className='relative z-[1000] min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100'>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className='text-center p-12 rounded-xl shadow-lg bg-white max-w-lg w-full mx-4'
            >
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className='mb-8'>
                    <span className='text-7xl font-bold text-slate-800'>403</span>
                </motion.div>
                <h2 className='text-2xl font-semibold text-slate-700 mb-4'>
                    {isAuthError
                        ? "접근 권한이 없습니다."
                        : isServerError
                        ? "서버측 문제가 발생했습니다."
                        : "데이터를 불러오는데 실패하였습니다."}
                </h2>
                <p className='text-slate-600 mb-8'>{isAuthError ? "해당 페이지에 접근할 수 있는 권한이 없습니다." : "잠시 후 다시 시도해주세요."}</p>
                <div className='space-y-3 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row justify-center'>
                    <Link href='/' className='px-6 py-3 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors duration-200'>
                        메인으로
                    </Link>
                    {isDataError ? (
                        <button
                            onClick={reset}
                            className='px-6 py-3 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors duration-200'
                        >
                            다시 시도
                        </button>
                    ) : (
                        <button
                            onClick={() => router.back()}
                            className='px-6 py-3 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors duration-200'
                        >
                            이전으로
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Error({ 
    error, 
    reset 
}: { 
    error: Error & { digest?: string }; 
    reset: () => void 
}) {
    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100'>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className='text-center p-10 rounded-2xl shadow-xl bg-white/80 backdrop-blur-sm'
            >
                <motion.div
                    animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0] 
                    }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className='text-6xl mb-6'
                >
                    🔒
                </motion.div>
                <h2 className='text-3xl font-bold mb-4 text-gray-800'>
                    접근 권한이 없습니다
                </h2>
                <p className='text-gray-600 mb-8'>
                    해당 페이지에 접근할 수 있는 권한이 없습니다.
                </p>
                <div className='space-x-4'>
                    <Link 
                        href="/"
                        className='inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200'
                    >
                        메인으로
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className='inline-block px-6 py-3 rounded-lg border-2 border-purple-500 text-purple-500 hover:bg-purple-50 transition-colors duration-200'
                    >
                        이전으로
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
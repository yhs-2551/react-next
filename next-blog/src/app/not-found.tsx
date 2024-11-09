"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-50 to-pink-100'>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className='text-center p-10 rounded-3xl shadow-xl bg-white/80 backdrop-blur-md'
            >
                <motion.div
                    animate={{
                        rotate: [0, 10, -10, 10, 0],
                        transition: { duration: 1, delay: 0.5 },
                    }}
                    className='mb-8'
                >
                    <span className='text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600'>404</span>
                </motion.div>
                <h2 className='text-3xl font-bold text-gray-800 mb-4'>페이지를 찾을 수 없습니다</h2>
                <p className='text-gray-600 mb-8'>요청하신 페이지가 존재하지 않거나 삭제되었을 수 있습니다.</p>
                <div className='space-x-4'>
                    <Link
                        href='/'
                        className='inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200'
                    >
                        메인으로
                    </Link>
                    <Link
                        href='javascript:history.back()'
                        className='inline-block px-6 py-3 rounded-lg border-2 border-purple-500 text-purple-500 hover:bg-purple-50 transition-colors duration-200'
                    >
                        이전으로
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

// 아래는 전체적으로 회색 스타일
// 'use client'

// import Link from 'next/link';
// import { motion } from 'framer-motion';

// export default function NotFound() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="text-center px-6 py-8 rounded-lg shadow-xl bg-white"
//       >
//         <motion.h1
//           initial={{ scale: 0.5 }}
//           animate={{ scale: 1 }}
//           className="text-9xl font-bold text-gray-300 mb-4"
//         >
//           404
//         </motion.h1>
//         <h2 className="text-3xl font-semibold text-gray-700 mb-4">
//           페이지를 찾을 수 없습니다
//         </h2>
//         <p className="text-gray-500 mb-8">
//           요청하신 페이지가 존재하지 않거나 삭제되었을 수 있습니다.
//         </p>
//         <Link
//           href="/"
//           className="inline-block px-6 py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors"
//         >
//           홈으로 돌아가기
//         </Link>
//       </motion.div>
//     </div>
//   );
// }

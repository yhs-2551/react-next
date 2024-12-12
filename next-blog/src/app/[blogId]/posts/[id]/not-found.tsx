'use client'

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PostNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center p-8 rounded-2xl shadow-2xl bg-white/90 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="mb-6"
        >
          <span className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
            404
          </span>
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          게시글을 찾을 수 없습니다.
        </h2>
        <p className="text-gray-600 mb-8">
          요청하신 게시글이 존재하지 않거나 삭제되었을 수 있습니다.
        </p>
        <Link 
          href="/"
          className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
        >
          메인으로 가기
        </Link>
      </motion.div>
    </div>
  );
}
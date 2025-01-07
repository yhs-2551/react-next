"use client";

import { useCategoryStore, userProfileStore } from "@/store/appStore";
import { CategoryType } from "@/types/CateogryTypes";
import { motion } from "framer-motion";
import Link from "next/link";

interface MenuModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MenuModal({ isOpen, onClose }: MenuModalProps) {
    // 캐시 메모리에서 가져옴
    const { categories } = useCategoryStore();
    const { blogId } = userProfileStore();

    const renderCategories = (categories: CategoryType[], isChild: boolean = false) => {
        return categories.map((category) => (
            <div key={category.categoryUuid}>
                <Link
                    href={`/${blogId}/categories/${category.name}/posts`}
                    onClick={onClose}
                    className={`block p-3 hover:bg-gray-50 transition-colors duration-200
                    ${isChild ? "text-gray-600 text-sm pl-6" : "text-gray-800 font-medium"}`}
                >
                    {category.name}
                </Link>
                {category.children && category.children.length > 0 && (
                    <div className='flex flex-col'>
                        <div className='flex flex-col border-l ml-4'>{renderCategories(category.children, true)}</div>
                    </div>
                )}
            </div>
        ));
    };

    return (
        <>
            {/* 백드롭*/}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='fixed inset-0 bg-black/30 z-[998]'
                    onClick={onClose}
                />
            )}

            {/* 사이드 메뉴 */}
            <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: isOpen ? 0 : "-100%" }}
                transition={{ type: "spring", damping: 20 }}
                className='fixed top-[5rem] left-0 w-screen md:w-[60vw] lg:w-[40vw] h-[calc(100vh-5rem)] 
                bg-white z-[998] shadow-xl overflow-y-auto'
            >
                <div className='p-6'>
                    <h2 className='text-2xl font-semibold text-gray-800 mb-6 border-b pb-4'>카테고리</h2>
                    <nav className='space-y-1'>{categories && renderCategories(categories)}</nav>
                </div>
            </motion.div>
        </>
    );
}

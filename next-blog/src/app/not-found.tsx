"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
export default function NotFound() {
    const router = useRouter();

    // 아래 주석 처리해도 작동 잘 되는 것 같음. 후에 문제 안생기면 주석 삭제
    // const [isDeleting, setIsDeleting] = useState(false);

    // useEffect(() => {
    //     const deleteStatus = sessionStorage.getItem("isDeleting") === "true";
    //     setIsDeleting(deleteStatus);
    // }, []);

    // if (isDeleting) {

    //     return null;
    // }

    return (
        // z-index를 통해 common header를 가리도록 설정
        // z-index 적용하기 위해 position:static 이외 사용 필요
        <div className='relative z-[1000] min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100'>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className='text-center p-12 rounded-xl shadow-lg bg-white max-w-lg w-full mx-4'
            >
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className='mb-8'>
                    <span className='text-7xl font-bold text-slate-800'>404</span>
                </motion.div>
                <h2 className='text-2xl font-semibold text-slate-700 mb-4'>페이지를 찾을 수 없습니다</h2>
                <p className='text-slate-600 mb-8'>요청하신 페이지가 존재하지 않거나 삭제되었을 수 있습니다.</p>
                <div className='space-y-3 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row justify-center'>
                    {/* 명확한 목적지("/")가 있는 경우 Link가 적합  */}
                    <Link href='/' className='px-6 py-3 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors duration-200'>
                        메인으로
                    </Link>

                    <button
                        onClick={() => router.back()}
                        className='px-6 py-3 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors duration-200'
                        aria-label='이전 페이지로 이동'
                    >
                        이전으로
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

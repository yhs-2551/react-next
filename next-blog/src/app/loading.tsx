export default function GlobalLoading() {
    // 추후 주석 삭제 예정
    // if (type === "auth" || message) {
    //     return (
    //         <div className='fixed inset-0 flex items-center justify-center bg-slate-50/95 backdrop-blur-sm z-[9999]'>
    //             <div className='text-center'>
    //                 <RingLoader color='#000' size={50} className='mb-3' />
    //                 {message && <p className='text-gray-800 text-lg font-medium'>{message}</p>}
    //             </div>
    //         </div>
    //     );
    // }

    // 일반 페이지 이동 시에는 상단 프로그레스 바 표시
    return (
        <div className='fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 z-[9999]'>
            <div className='h-full w-full animate-progressBar origin-left'></div>
        </div>
    );
}

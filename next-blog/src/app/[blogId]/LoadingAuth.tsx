// 로딩이 없으면 권한 확인 중에 사용자가 다른 사용자의 페이지를 잠깐 볼 수 있어서 가리기 위해 로딩이 필요.

import { ClipLoader } from "react-spinners";

export default function LoadingAuth() {
    return (
        <div className='fixed inset-0 flex items-center justify-center bg-slate-50/95 backdrop-blur-sm z-[9999]'>
            <div className='text-center'>
                <ClipLoader color='#1e293b' size={40} className='mb-3' />
                <p className='text-gray-800 text-lg font-medium'>사용자 인증 진행 중입니다.</p>
            </div>
        </div>
    );
}

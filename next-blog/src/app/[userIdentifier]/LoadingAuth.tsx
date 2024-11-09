// 로딩이 없으면 권한 확인 중에 사용자가 다른 사용자의 페이지를 잠깐 볼 수 있어서 가리기 위해 로딩이 필요.

import { ClipLoader } from "react-spinners";

export default function LoadingAuth() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-[9999]">
            <div className="text-center">
                <ClipLoader 
                    color="#374151"
                    size={48}
                    className="mb-4"
                />
                <p className="text-gray-600 font-medium">
                    권한 확인 중...
                </p>
            </div>
        </div>
    );
}
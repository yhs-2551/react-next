interface GlobalLoadingProps {
    type?: "auth" | "default";
    message?: string;
}

import { ClipLoader } from "react-spinners";

export default function GlobalLoading({ type = "default", message }: GlobalLoadingProps) {
    return (
        <div className='fixed inset-0 flex items-center justify-center bg-slate-50/95 backdrop-blur-sm z-[9999]'>
            <div className='text-center'>
                <ClipLoader color='#1e293b' size={40} className='mb-3' />
                {message && <p className='text-gray-800 text-lg font-medium'>{message}</p>}
            </div>
        </div>
    );
}

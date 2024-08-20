import React, { ChangeEvent, useState } from 'react'

interface PublishModalProps {
    onClose: () => void;
}


function PublishModal({ onClose }: PublishModalProps) {
    const [isPublic, setIsPublic] = useState<boolean>(true);
    const [tags, setTags] = useState<string>("");
    const [category, setCategory] = useState<string>("");


    const handlePublish = () => {
        // 서버로 데이터를 전송하는 로직 구현
        onClose();
    };

    const handlePostStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setIsPublic(e.target.value === "PUBLIC");
    };

    const handleSetTags = (e: ChangeEvent<HTMLInputElement>) => {
        setTags(e.target.value);
    };

    return (

        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-md shadow-md w-96">
                <h2 className="text-xl font-bold mb-4">발행 설정</h2>

                <div className="mb-4">
                    <label className="block mb-2" htmlFor="">공개 여부</label>
                    <select className="w-full p-2 border border-gray-300 rounded-md" value={isPublic ? "PUBLIC" : "PRIVATE"}
                        onChange={handlePostStatusChange}
                    >
                        <option value="PUBLIC">PUBLIC</option>
                        <option value="PRIVATE">PRIVATE</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block mb-2">태그 입력</label>
                    <input className="w-full p-2 border border-gray-300 rounded-md" type="text" placeholder="태그 입력(,로 분리)" value={tags}
                        onChange={handleSetTags} />

                </div>

                {/* 카테고리는 선택하게 만들기 
                <div className="mb-4">
                    <label className="block mb-2">카테고리</label>
                    <input className="w-full p-2 border border-gray-300 rounded-md" type="text" placeholder="카테고리 입력" value={category} 
               
                    />
                </div> */}

                <div className="flex justify-end">
                    <button className="px-4 py-2 bg-gray-400 text-white rounded-md mr-2" onClick={onClose}>취소</button>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-md" onClick={handlePublish}>발행</button>
                </div>
            </div>
        </div>
    )
}


export default PublishModal

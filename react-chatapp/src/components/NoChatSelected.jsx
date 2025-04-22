import React from 'react'
import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
    return (
      <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
        <div className="max-w-md text-center space-y-6">
          {/* 아이콘 표시 */}
          <div className="flex justify-center gap-4 mb-4">
            <div className="relative">
              <div
                className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center
               justify-center animate-bounce"
              >
                <MessageSquare className="w-8 h-8 text-primary " />
              </div>
            </div>
          </div>
  
          {/* 환영 메시지 */}
          <h2 className="text-2xl font-bold">Chatty에 오신걸 환영합니다!</h2>
          <p className="text-base-content/60">
            채팅을 시작하려면 사이드바에서 대화를 선택하세요
          </p>
        </div>
      </div>
    );
  };
  
  export default NoChatSelected;
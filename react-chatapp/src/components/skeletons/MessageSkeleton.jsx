const MessageSkeleton = () => {
    // Create an array of 6 items for skeleton messages
    const skeletonMessages = Array(6).fill(null);

    return (
        <div className='flex-1 overflow-y-auto p-4 space-y-4'>
            {skeletonMessages.map((_, idx) => (
                //chat-start는 DaisyUI라이브러리에서 제공하는 CSS 클래스: 메시지가 왼쪽에 정렬 (상대방이 보낸 메시지), chat-end: 메시지가 오른쪽에 정렬 (자신이 보낸 메시지)

                <div key={idx} className={`chat ${idx % 2 === 0 ? "chat-start" : "chat-end"}`}>
                    <div className='chat-image avatar'>
                        <div className='size-10 rounded-full'>
                            <div className='skeleton w-full h-full rounded-full' />
                        </div>
                    </div>

                    <div className='chat-header mb-1'>
                        <div className='skeleton h-4 w-16' />
                    </div>

                    <div className='chat-bubble bg-transparent p-0'>
                        <div className='skeleton h-16 w-[200px]' />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MessageSkeleton;

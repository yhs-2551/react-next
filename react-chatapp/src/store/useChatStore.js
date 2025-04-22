import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/users");
            set({ users: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get(); // zustand의 get() 메서드를 사용하여 상태랄 가져옴
        try {
          const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
          set({ messages: [...messages, res.data] });
        } catch (error) {
          toast.error(error.response.data.message);
        }
      },

      subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return; // 메시지 수신을 위한 유저가 선택되지 않은 경우
    
        // 외부 zustand State를 가져오기 위해선 getState() 메서드를 사용해야 함.
        const socket = useAuthStore.getState().socket;
    
        socket.on("newMessage", (newMessage) => {
        // 선택된 대상과 실제 메시지를 보낸 대상이 같은지 확인. 일치해야만 진행
          const isMessageSentFromSelectedUser = newMessage.sender === selectedUser._id;
          if (!isMessageSentFromSelectedUser) return;
    
          set({
            messages: [...get().messages, newMessage],
          });
        });
      },
    
      // 채팅방을 나가거나 다른 사용자와의 대화로 전환할 때 이전 구독을 정리하기 위해 사용.
      unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
      },
    

    setSelectedUser: (selectedUser) =>
        set({
            selectedUser,
        }),
}));

import { create } from 'zustand';

interface ProfileState {
    blogName: string;
    blogNickName: string;
    blogDescription: string;
    profileImage: string | null;
    setBlogName: (name: string) => void;
    setBlogNickName: (nick: string) => void;
    setBlogDescription: (description: string) => void;
    setProfileImage: (image: string | null) => void;
}

export const userProfileStore = create<ProfileState>((set) => ({
    blogName: '아이스아메리카노 블로그',
    blogNickName: '홍길동',
    blogDescription: '홍길동 내용 입니다',
    profileImage: null,
    setBlogName: (name) => set({ blogName: name }),
    setBlogNickName: (nickName) => set({ blogNickName: nickName }),
    setBlogDescription: (description) => set({ blogDescription: description }),
    setProfileImage: (image) => set({ profileImage: image }),
}));
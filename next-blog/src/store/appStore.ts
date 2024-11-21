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
    setBlogNickName: (userName) => set({ blogNickName: userName }),
    setBlogDescription: (description) => set({ blogDescription: description }),
    setProfileImage: (image) => set({ profileImage: image }),
}));

interface AuthState {
    showLogin: boolean;
    showSignUp: boolean;
    showEmailVerification: boolean;
    email: string;
    isAuthenticated: boolean;
    setShowLogin: (show: boolean) => void;
    setShowSignUp: (show: boolean) => void;
    setShowEmailVerification: (show: boolean) => void;
    setEmail: (email: string) => void;
    setIsAuthenticated: (isAuth: boolean) => void;
    reset: () => void;
  }
  
  export const useAuthStore = create<AuthState>((set) => ({
    showLogin: false,
    showSignUp: false,
    showEmailVerification: false,
    email: '',
    isAuthenticated: false,
    setShowLogin: (show) => set({ showLogin: show }),
    setShowSignUp: (show) => set({ showSignUp: show }),
    setShowEmailVerification: (show) => set({ showEmailVerification: show }),
    setEmail: (email) => set({ email }),
    setIsAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),
    reset: () => set({
      showLogin: false,
      showSignUp: false,
      showEmailVerification: false,
      email: '',
    })
  }));
import { SignupUser } from "@/types/SignupUserTypes";
import { create } from "zustand";

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
    blogName: "아이스아메리카노 블로그",
    blogNickName: "홍길동",
    blogDescription: "홍길동 내용 입니다",
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
    signupUser: SignupUser;
    isInitialized: boolean;
    lastVisitedPage: string;
    isShowOAuth2NewUserModal: boolean;
    tempOAuth2UserUniqueId: string;
    setShowLogin: (show: boolean) => void;
    setShowSignUp: (show: boolean) => void;
    setShowEmailVerification: (show: boolean) => void;
    setSignupUser: (signupUser: SignupUser) => void;
    setInitialized: (status: boolean) => void;
    setLastVisitedPage: (url: string) => void;
    setShowOAuth2NewUserModal: (status: boolean) => void;
    setTempOAuth2UserUniqueId: (id: string) => void;
    // reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    showLogin: false,
    showSignUp: false,
    showEmailVerification: false,
    signupUser: { blogId: "", username: "", email: "", password: "", passwordConfirm: "" },
    isInitialized: false,
    lastVisitedPage: '/',
    isShowOAuth2NewUserModal: false,
    tempOAuth2UserUniqueId: "",
    setShowLogin: (show) => set({ showLogin: show }),
    setShowSignUp: (show) => set({ showSignUp: show }),
    setShowEmailVerification: (show) => set({ showEmailVerification: show }),
    setSignupUser: (signupUser) => set({ signupUser }),
    setInitialized: (status) => set({ isInitialized: status }),
    setLastVisitedPage: (url) => set({lastVisitedPage: url}),
    setShowOAuth2NewUserModal: (status) => set({isShowOAuth2NewUserModal: status}),
    setTempOAuth2UserUniqueId: (id) => set({tempOAuth2UserUniqueId: id}),

    // reset: () => set({
    //   showLogin: false,
    //   showSignUp: false,
    //   showEmailVerification: false,
    //   signupUser: {blogId: '', username: '', email: '', password: '', passwordConfirm: ''},
    // })
}));

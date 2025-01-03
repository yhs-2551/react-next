import { SignupUser } from "@/types/SignupUserTypes";
import { create } from "zustand";

interface ProfileState {
    blogName: string;
    blogUsername: string;
    blogId: string;
    blogDescription: string;
    profileImage: string | null;
    setBlogName: (name: string) => void;
    setBlogUsername: (username: string) => void;
    setBlogId: (id: string) => void;
    setBlogDescription: (description: string) => void;
    setProfileImage: (image: string | null) => void;
}

export const userProfileStore = create<ProfileState>((set) => ({
    blogName: "",
    blogUsername: "",
    blogId: "",
    blogDescription: "블로그 설명을 입력해 주세요.",
    profileImage: null,
    setBlogName: (name) => set({ blogName: name }),
    setBlogUsername: (username) => set({ blogUsername: username }),
    setBlogId: (id) => set({ blogId: id }),
    setBlogDescription: (description) => set({ blogDescription: description }),
    setProfileImage: (image) => set({ profileImage: image }),
}));

interface AuthState {
    showLogin: boolean;
    showSignUp: boolean;
    showEmailVerification: boolean;
    signupUser: SignupUser;
    isInitialized: boolean;
    isAuthenticated: boolean;
    isHeaderLogin: boolean;
    lastVisitedPage: string;
    isShowOAuth2NewUserModal: boolean;
    tempOAuth2UserUniqueId: string;
    isOAuth2Redirect: boolean;
    setShowLogin: (show: boolean) => void;
    setShowSignUp: (show: boolean) => void;
    setShowEmailVerification: (show: boolean) => void;
    setSignupUser: (signupUser: SignupUser) => void;
    setInitialized: (status: boolean) => void;
    setAuthenticated: (status: boolean) => void;
    setHeaderLogin: (status: boolean) => void;
    setLastVisitedPage: (url: string) => void;
    setShowOAuth2NewUserModal: (status: boolean) => void;
    setTempOAuth2UserUniqueId: (id: string) => void;
    setOAuth2Redirect: (status: boolean) => void;
    // reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    showLogin: false,
    showSignUp: false,
    showEmailVerification: false,
    signupUser: { blogId: "", username: "", email: "", password: "", passwordConfirm: "" },
    isInitialized: false,
    isAuthenticated: false,
    isHeaderLogin: false,
    lastVisitedPage: '/',
    isShowOAuth2NewUserModal: false,
    tempOAuth2UserUniqueId: "",
    isOAuth2Redirect: false,
    setShowLogin: (show) => set({ showLogin: show }),
    setShowSignUp: (show) => set({ showSignUp: show }),
    setShowEmailVerification: (show) => set({ showEmailVerification: show }),
    setSignupUser: (signupUser) => set({ signupUser }),
    setInitialized: (status) => set({ isInitialized: status }),
    setHeaderLogin: (status) => set({ isHeaderLogin: status }),
    setAuthenticated: (status) => set({ isAuthenticated: status }),
    setLastVisitedPage: (url) => set({lastVisitedPage: url}),
    setShowOAuth2NewUserModal: (status) => set({isShowOAuth2NewUserModal: status}),
    setTempOAuth2UserUniqueId: (id) => set({tempOAuth2UserUniqueId: id}),
    setOAuth2Redirect: (status) => set({isOAuth2Redirect: status}),

    // reset: () => set({
    //   showLogin: false,
    //   showSignUp: false,
    //   showEmailVerification: false,
    //   signupUser: {blogId: '', username: '', email: '', password: '', passwordConfirm: ''},
    // })
}));


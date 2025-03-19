import { CategoryType } from "@/types/CateogryTypes";
import { SignupUser } from "@/types/SignupUserTypes";
import { create } from "zustand";

// public과 private의 차이는 사용자 email 개인정보 유무 차이
interface ProfileState {
    blogName: string;
    blogUsername: string;
    blogId: string;
    profileImage: string;
    defaultProfileImage: string;
    profileUpdate: boolean;
    setBlogName: (name: string) => void;
    setBlogUsername: (username: string) => void;
    setBlogId: (id: string) => void;
    setProfileImage: (image: string) => void;
    setProfileUpdate: (status: boolean) => void;
}

export const userProfileStore = create<ProfileState>((set) => ({
    blogName: "",
    blogUsername: "",
    blogId: "",
    profileImage: "",
    defaultProfileImage: "https://iceamericano-blog-storage.s3.ap-northeast-2.amazonaws.com/default/default-avatar-profile.webp",
    profileUpdate: false,
    setBlogName: (name) => set({ blogName: name }),
    setBlogUsername: (username) => set({ blogUsername: username }),
    setBlogId: (id) => set({ blogId: id }),
    setProfileImage: (image) => set({ profileImage: image }),
    setProfileUpdate: (status) => set({ profileUpdate: status }),
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
    isUserLoggedOut: boolean;
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
    setUserLoggedOut: (status: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    showLogin: false,
    showSignUp: false,
    showEmailVerification: false,
    signupUser: { blogId: "", username: "", email: "", password: "", passwordConfirm: "" },
    isInitialized: false,
    isAuthenticated: false,
    isHeaderLogin: false,
    lastVisitedPage: "/",
    isShowOAuth2NewUserModal: false,
    tempOAuth2UserUniqueId: "",
    isOAuth2Redirect: false,
    isUserLoggedOut: false,
    setShowLogin: (show) => set({ showLogin: show }),
    setShowSignUp: (show) => set({ showSignUp: show }),
    setShowEmailVerification: (show) => set({ showEmailVerification: show }),
    setSignupUser: (signupUser) => set({ signupUser }),
    setInitialized: (status) => set({ isInitialized: status }),
    setHeaderLogin: (status) => set({ isHeaderLogin: status }),
    setAuthenticated: (status) => set({ isAuthenticated: status }),
    setLastVisitedPage: (url) => set({ lastVisitedPage: url }),
    setShowOAuth2NewUserModal: (status) => set({ isShowOAuth2NewUserModal: status }),
    setTempOAuth2UserUniqueId: (id) => set({ tempOAuth2UserUniqueId: id }),
    setOAuth2Redirect: (status) => set({ isOAuth2Redirect: status }),
    setUserLoggedOut: (status) => set({ isUserLoggedOut: status }),
}));

interface CategoryState {
    categories: CategoryType[];
    setCategories: (categories: CategoryType[]) => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
    categories: [],
    setCategories: (categories) => set({ categories }),
}));

interface SearchState {
    searchTriggerNum: number;
    triggerSearch: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
    searchTriggerNum: 0,
    triggerSearch: () => set((state) => ({ searchTriggerNum: state.searchTriggerNum + 1 })),
}));

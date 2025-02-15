"use client";
import { useCategoryStore, userProfileStore } from "@/store/appStore";
import { CategoryType } from "@/types/CateogryTypes";
import { useEffect } from "react";

interface UserDataInitializerProps {
    blogName: string;
    blogId: string;
    blogUsername: string;
    profileImageUrl: string;
    categories: CategoryType[];
}

export default function UserDataInitializer({ blogName, blogId, blogUsername, profileImageUrl, categories }: UserDataInitializerProps) {
    const { setBlogName, setBlogId, setBlogUsername, setProfileImage } = userProfileStore();
    const { setCategories } = useCategoryStore();

    useEffect(() => {
        setBlogName(blogName);
        setBlogId(blogId);
        setBlogUsername(blogUsername);
        setProfileImage(profileImageUrl);
        setCategories(categories);
    }, [blogName, blogId, blogUsername, profileImageUrl, categories]);

    return null;
}
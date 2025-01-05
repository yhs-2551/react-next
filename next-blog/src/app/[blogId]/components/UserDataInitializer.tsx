"use client";
import { useCategoryStore, userProfileStore } from "@/store/appStore";
import { CategoryType } from "@/types/CateogryTypes";
import { useEffect } from "react";

export default function UserDataInitializer({ username, blogId, categories }: { username: string; blogId: string; categories: CategoryType[] }) {
    const { setBlogName, setBlogUsername, setBlogId } = userProfileStore();
    const { setCategories } = useCategoryStore();

    useEffect(() => {
        
        console.log("업데이트 실행");

        setBlogUsername(username);
        setBlogName(`${username}의 DevLog`);
        setBlogId(blogId);
        setCategories(categories);
    }, [username, blogId, categories]);

    return null;
}

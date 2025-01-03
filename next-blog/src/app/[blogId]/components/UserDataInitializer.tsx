"use client";
import { userProfileStore } from "@/store/appStore";
import { useEffect } from "react";

export default function UserDataInitializer({ username, blogId }: { username: string; blogId: string }) {
    const { setBlogName, setBlogUsername, setBlogId } = userProfileStore();

    useEffect(() => {
        // 다른 사용자에게 방문 시 새 카테고리를 불러오기 위함
        localStorage.removeItem("REACT_QUERY_OFFLINE_CACHE");

        setBlogUsername(username);
        setBlogName(`${username}의 DevLog`);
        setBlogId(blogId);
    }, [username, blogId]);

    return null;
}

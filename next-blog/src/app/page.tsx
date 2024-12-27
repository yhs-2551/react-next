import React from "react";
import Index from "./components/Index";

export default async function IndexPage() {
    // 무한 스크롤을 위해 초기에 20개 가져옴
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/posts?page=1&size=20`, {
        cache: "force-cache",
    });

    const response = await res.json();

    const { content, totalElements } = response.data;

    console.log("content>>>", content);

    return (
        <>
            <Index initialData={content} totalElements={totalElements}/>
        </>
    );
}

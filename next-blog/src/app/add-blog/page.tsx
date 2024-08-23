import React from "react";
import BlogForm from "./components/BlogForm";
import ClientWrapper from "@/providers/ClientWrapper";

function AddBlogPage() {
    return (
        <>
            <h1 className='text-2xl font-bold text-center mt-6'>
                글 작성 페이지
            </h1>
            <main className='max-w-7xl mx-auto p-6 bg-white'>
                <ClientWrapper>
                    <BlogForm />
                </ClientWrapper>
            </main>
        </>
    );
}

export default AddBlogPage;

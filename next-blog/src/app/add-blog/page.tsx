import React from "react";
import BlogForm from "./components/BlogForm";

function AddBlogPage() {
    return (
        <>
            <h1 className='text-2xl font-bold text-center mt-6'>
                글 작성 페이지
            </h1>
            <main className='max-w-7xl mx-auto p-6 bg-white'>
                <BlogForm />
            </main>
        </>
    );
}

export default AddBlogPage;

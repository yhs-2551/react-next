import React from "react";
import BlogForm from "./components/BlogForm";
import ClientWrapper from "@/providers/ClientWrapper";

function AddBlogPage() {
    return (
        <>
            <div className='container max-w-4xl mt-6 mx-auto bg-white'>
                <ClientWrapper>
                    <BlogForm />
                </ClientWrapper>
            </div>
        </>
    );
}

export default AddBlogPage;

import React, { Suspense } from "react";
import ClientWrapper from "@/providers/ClientWrapper";
import AuthCheck from "../../components/AuthCheck";
import BlogForm from "@/app/_components/form/BlogForm"; 

function AddBlogPage() {
    return (
        <>
            <div className='container max-w-4xl mt-[120px] mx-auto bg-white'>
                <ClientWrapper>
                    <AuthCheck>
                        <BlogForm />
                    </AuthCheck>
                </ClientWrapper>
            </div>
        </>
    );
}

export default AddBlogPage;

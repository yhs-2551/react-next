import React, { Suspense } from "react";
import BlogForm from "./components/BlogForm";
import ClientWrapper from "@/providers/ClientWrapper";
import Loading from "./loading";

function AddBlogPage() {
    return (
        <>
            <div className='container max-w-4xl mt-6 mx-auto bg-white'>
                <ClientWrapper>
                    <Suspense fallback={<Loading />}>
                        <BlogForm />
                    </Suspense>
                </ClientWrapper>
            </div>
        </>
    );
}

export default AddBlogPage;

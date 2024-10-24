import React, { Suspense } from "react";
import ClientWrapper from "@/providers/ClientWrapper";
import Loading from "./loading";
import BlogForm from "../(common)/Form/BlogForm";

function AddBlogPage() {
    return (
        <>
            <div className='container max-w-4xl mt-6 mx-auto bg-white'>
                <Suspense fallback={<Loading />}>
                    <ClientWrapper>
                        <BlogForm />
                    </ClientWrapper>
                </Suspense>
            </div>
        </>
    );
}

export default AddBlogPage;

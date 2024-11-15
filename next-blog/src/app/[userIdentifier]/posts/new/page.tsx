import React, { Suspense } from "react";
import ClientWrapper from "@/providers/ClientWrapper";
import BlogForm from "../(common-newpost-editpost)/Form/BlogForm";
import AuthCheck from "../../components/AuthCheck";

function AddBlogPage() {
    return (
        <>
            <div className='container max-w-4xl mt-6 mx-auto bg-white'>
                    <ClientWrapper usePersist={true}>
                        <AuthCheck>
                            <BlogForm />
                        </AuthCheck>
                    </ClientWrapper>
            </div>
        </>
    );
}

export default AddBlogPage;

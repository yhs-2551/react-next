import React from 'react'
import BlogForm from "./components/BlogForm";

function AddBlogPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
        <h1 className="text-2xl font-bold mb-4">글 작성 페이지</h1>
        <BlogForm />
    </div>
  )
}

export default AddBlogPage;

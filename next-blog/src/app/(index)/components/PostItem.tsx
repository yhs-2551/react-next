import React from 'react'

interface PostProps {
    title: string; 
    content: string; 
    createdAt: string;
    views: number;
}

function PostItem({title, content, createdAt, views}: PostProps) {
  return (
    
    <div className="flex flex-col border-b py-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-sm text-gray-500 mb-2">Posted on: {new Date(createdAt).toLocaleDateString()}</p>
        <p className="text-gray-700 mb-2">{content.substring(0, 100)}...</p>
        <p className="text-sm text-gray-500">Views: {views}</p>
        <button className="mt-2 text-white bg-green-500 px-4 py-2 rounded">Read More</button>

    </div>
  )
}

export default PostItem

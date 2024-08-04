import { MessageCircle, ThumbsUp } from "lucide-react";

const PopularBlogs = () => {
    const blogs = [
        {
            title: "Blog Title1",
            author: "yhs",
            likes: 142,
            comments: 44,
        },
        {
            title: "Blog Title2",
            author: "ljy",
            likes: 153,
            comments: 25,
        },
        {
            title: "Blog Title3",
            author: "shm",
            likes: 250,
            comments: 48,
        },
        {
            title: "Blog Title4",
            author: "ljy",
            likes: 550,
            comments: 57,
        },
    ];
    return (
        <div className='bg-white p-5 w-[23rem] mt-4 border ml-5 rounded'>
            <h2 className='text-bl font-bold mb-5'>Popular Blogs</h2>

            <ul>
                {blogs.map((blog, index) => (
                    <li key={index} className='mb-4'>
                        <div className='flex justify-between items-center'>
                            <span className='font-bold mb-2'>{blog.title}</span>
                        </div>

                        <span className='text-gray-600'>
                            Publish by {blog.author}
                        </span>
                        <div className='flex items-center mt-2'>
                            <MessageCircle size={16} />
                            <span className='text-gray-500 mr-5 ml-1'>
                                {blog.comments}
                            </span>

                            <ThumbsUp size={16} />
                            <span className='text-gray-500 ml-2'>
                                {blog.likes}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PopularBlogs;

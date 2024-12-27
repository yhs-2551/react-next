export const extractImageFromPost = (post: any) => {
    let imageUrl: string | undefined;

    if (post?.featuredImage?.fileUrl) {
        imageUrl = post.featuredImage.fileUrl;
    } else if (post?.content) {
        const imgRegex = /<img.*?src=["'](.*?)["']/;
        const match = post.content.match(imgRegex);
        imageUrl = match ? match[1] : undefined;
    }

    console.log(imageUrl);

    return imageUrl;
};
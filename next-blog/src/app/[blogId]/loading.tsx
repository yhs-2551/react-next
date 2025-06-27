export default function BlogLoading() {
    return (
        <div className='fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 z-[9999]'>
            <div className='h-full w-full animate-progressBar origin-left'></div>
        </div>
    );
}

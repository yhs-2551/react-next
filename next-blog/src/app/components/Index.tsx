"use client";

import { useRouter } from "next/navigation";
 
import { useQuery } from "react-query";
import { queryClient } from "@/providers/ReactQueryPersistProvider";

export default function Index() {
 
  const router = useRouter();

  const { data: isLoggedIn } = useQuery("isLoggedIn", {
    initialData: false,
  });


  const handleLoginClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push("/login");
  };

  const handleLogoutClick = () => {
    queryClient.setQueryData("isLoggedIn", false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {isLoggedIn ? (
        <>
          <button
            onClick={handleLogoutClick}
            className="cursor-pointer px-4 py-2 bg-black text-white rounded-md hover:bg-red-500 focus:outline-none active:bg-red-400"
          >
            로그아웃
          </button>
        </>
      ) : (
        <>
          <a
            onClick={handleLoginClick}
            className="cursor-pointer px-4 py-2 bg-black text-white rounded-md hover:bg-red-500 focus:outline-none active:bg-red-400"
          >
            로그인
          </a>
        </>
      )}
    </div>
  );
}

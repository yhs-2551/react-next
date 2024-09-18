// 만료시간을 프론트 측에서 관리하는 로직 일단 사용 안함 

// "use client";

// import { usePathname, useRouter } from "next/navigation";
// import React, { useEffect } from "react";

// const isTokenExpired = (accessToken: string) => {
//     const decodedToken = JSON.parse(atob(accessToken.split(".")[1]));
//     const currentTime = Math.floor(Date.now() / 1000);
//     return decodedToken.exp < currentTime;
// };


// // 페이지 이동시에 children의 값이 바뀌기 때문에 결국 children props의 값이 바뀌기 때문에 재렌더링 됨. 따라서 useEffect가 페이지 이동시에 매번 실행 된다.
// // 단 위의 경우 새로고침을 해야만 재렌더링 됨. 각 페이지에서 router.push()로 이동하는 경우 페이지 새로고침 없이 이동하기 때문 
// // 따라서 아래처럼 pathname을 의존성 배열에 추가하면, 페이지간 이동시에 실행할 수 있게 한다. 
// function ClientLayout({ children }: { children: React.ReactNode }) {

//     const router = useRouter();
//     const pathname = usePathname();

//     useEffect(() => {
//         const accessToken = localStorage.getItem("access_token");

//         if (accessToken && isTokenExpired(accessToken)) {
//             const userConfirmed = confirm(
//                 "Your session has expired. Would you like to login again?"
//             );

//             if (userConfirmed) {
//                 localStorage.removeItem("access_token");
//                 router.push("/login");
//             } else {
//                 localStorage.removeItem("access_token");
//             }
//         }
//     }, [pathname]);

//     return <>{children}</>;
// }

// export default ClientLayout;

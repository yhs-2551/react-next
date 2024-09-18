// import { useRouter } from "next/navigation";
// import { QueryClient, useMutation, useQueryClient } from "react-query";

// const logoutUser = async () => {



//   const accessToken = localStorage.getItem("access_token");

//   const response = await fetch("http://localhost:8000/api/user/logout", {
//     method: "POST",
//     headers: {
//       "Authorization": `Bearer ${accessToken}`
//     },
//     credentials: "include" // 쿠키를 포함하여 요청. 브라우저의 쿠키에 있는 값들을 삭제하기 위함
//   })

//   if (!response.ok) {
//     const errorData = await response.json();
//     throw new Error(JSON.stringify(errorData));
//   }

//   // 로그아웃의 경우 서버측에서 보통 응답 본문 없이 httpstatus만 넘겨주기 때문에 응답 본문이 없거나 JSON이 아닐 수 있으므로 안전하게 처리 한다.
//   // 내 경우 메시지 까지 같이 전해서 주긴 했음. 즉, 응답 본문이 있기 때문에 catch로 넘어가진 않음.
//   try {
//     return await response.json();
//   }  catch (error) {
//     // 응답 본문이 없는 경우 빈 객체 반환. 응답 본문이 없기 때문에 await response.json()에서 에러가 난다. 즉, 응답헤더만 있을 경우. 대부분 로그아웃의 경우 catch문의 빈 객체를 최종적으로 리턴.
//     return {};
//   }
  
// }
// function useLogout() {

//   const queryClient = useQueryClient();

//   return useMutation(logoutUser, {
//     onSuccess: () => {
//       console.log("로그아웃 성공 실행")
//       localStorage.removeItem("access_token");
//       queryClient.setQueryData("isLoggedIn", false);
//     }, 
//     onError: (error: any) => {
//       console.log("로그아웃 실패", error);
//       // 로그아웃 실패에 관련된 인라인 메시지 처리 필요
//     }
//   })
// }

// export default useLogout;


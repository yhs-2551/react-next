// 글 목록 페이지에서 이미지 및 일반 파일을 제외한 텍스트만을 보여주기 위한 유틸리티 함수
export function extractTextWithoutImages(html: string): string {
    
    const div = document.createElement("div");
    div.innerHTML = html;

    // 이미지 태그 제거
    const images = div.getElementsByTagName("img");
    while (images.length > 0) {
        images[0].parentNode?.removeChild(images[0]);
    }

     // 클래스가 ql-file인 요소 (파일)제거
     const fileContainers = div.getElementsByClassName("ql-file");

     while (fileContainers.length > 0) {
         fileContainers[0].parentNode?.removeChild(fileContainers[0]);
     }

    // HTML 태그 안에 있는 모든 태그를 무시하고 순수 텍스트만 추출
    return div.textContent || "";
}
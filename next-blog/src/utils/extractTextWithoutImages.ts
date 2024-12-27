// 글 목록 페이지에서 이미지 및 일반 파일을 제외한 텍스트만을 보여주기 위한 유틸리티 함수
export function extractTextWithoutImages(html: string): string {
    
    const div = document.createElement("div");
    div.innerHTML = html;

    // 이미지 태그 제거
    const images = div.getElementsByTagName("img");
    while (images.length > 0) {
        images[0].parentNode?.removeChild(images[0]);
    }

     // 클래스가 file-container인 요소 제거
     const fileContainers = div.getElementsByClassName("file-container");
     while (fileContainers.length > 0) {
         fileContainers[0].parentNode?.removeChild(fileContainers[0]);
     }

    // 텍스트 추출
    return div.textContent || "";
}
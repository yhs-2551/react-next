// 글 목록 페이지에서 이미지 및 일반 파일을 제외한 텍스트만을 보여주기 위한 유틸리티 함수
export function extractTextWithoutImages(html: string): string {
    const div = document.createElement("div");
    div.innerHTML = html;

    // 이미지 태그 제거
    const images = div.getElementsByTagName("img");
    while (images.length > 0) {
        images[0].parentNode?.removeChild(images[0]);
    }

    // // 파일 링크 태그 제거 (예: a 태그)
    // const links = div.getElementsByTagName("a");
    
    // console.log("ilinks >>>", links);

    // while (links.length > 0) {
    //     links[0].parentNode?.removeChild(links[0]);
    // }

    // 텍스트 추출
    return div.textContent || "";
}
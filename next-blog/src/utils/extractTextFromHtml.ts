export const extractTextFromHtml = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    let textContent = doc.body.textContent || "";

    // 이미지나 파일 태그가 포함된 경우 HTML 문자열을 그대로 유지
    const hasImages = doc.querySelectorAll("img").length > 0;
    const hasLinks = doc.querySelectorAll("a").length > 0;

    // 글 내용이 비어있고 이미지나 링크가 포함된 경우에도 당연히 내용이 있다고 판단.
    if (textContent.trim() === "" && (hasImages || hasLinks)) {
        return html;
    }

    return textContent;
}
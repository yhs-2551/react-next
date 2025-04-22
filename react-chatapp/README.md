# React를 활용한 Chat App

React와 Node.js 기반의 실시간 채팅 애플리케이션.

 Socket.IO를 활용하여 실시간 메시지 전송 기능을 구현.
## 기술 스택

### 프론트엔드
- **프레임워크**: React
- **빌드 도구**: Vite
- **라우팅**: React Router
- **스타일링**: Tailwind CSS, DaisyUI
- **상태 관리**: Zustand
- **아이콘**: Lucide React
- **HTTP 클라이언트**: Axios
- **알림**: React Hot Toast

### 백엔드
- **런타임**: Node.js
- **프레임워크**: Express
- **데이터베이스**: MongoDB
- **실시간 통신**: Socket.IO
- **인증**: JWT

## 주요 기능

- **사용자 인증**: 회원가입, 로그인
- **사용자 구분**: 온라인/오프라인 사용자 구분
- **실시간 채팅**: 텍스트 및 이미지 메시지 교환
- **사용자 프로필**: 프로필 사진 및 개인정보 관리
- **테마 설정**: 다양한 UI 테마 선택 가능
- **반응형 디자인**: 일부 모바일 및 데스크톱 지원

## 프로젝트 구조

```
src/
  ├── components/       # UI 컴포넌트
  ├── pages/            # 페이지 컴포넌트
  ├── store/            # Zustand 상태 관리
  ├── lib/              # 유틸리티 함수 및 axios baseURL 설정
  ├── constants/        # 상수 정의
  └── assets/           # 이미지 및 아이콘
```

## 백엔드 연동

이 프로젝트는 node.js 백엔드 서버와 함께 작동 하며,
백엔드 서버 코드는 node/chatapp 저장소에서 확인할 수 있다. 

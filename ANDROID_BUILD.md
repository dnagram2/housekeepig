# Ttakkak Android 앱 빌드 가이드

## 프로젝트 구조
이 프로젝트는 Capacitor를 사용하여 React 웹앱을 안드로이드 앱으로 변환합니다.

## 빌드 방법

### 1. 웹앱 빌드
```bash
npm run build
```

### 2. Android 프로젝트 동기화
```bash
npx cap sync android
```

### 3. Android Studio에서 열기
```bash
npx cap open android
```

### 4. APK 빌드 (Android Studio)
- Build > Build Bundle(s) / APK(s) > Build APK(s)

## 또는 커맨드라인에서 직접 빌드
```bash
cd android
./gradlew assembleDebug
```

APK 위치: `android/app/build/outputs/apk/debug/app-debug.apk`

## 앱 정보
- 패키지명: com.ttakkak.app
- 앱 이름: 딸깍
- 메인 컬러: #005088

## 주요 기능
- 고객 견적 요청 시스템
- 업체 입찰 시스템
- 실시간 채팅
- 예약 및 결제 관리
- 리뷰 시스템
- 커뮤니티 게시판

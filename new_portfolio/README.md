# new_portfolio — 모바일 전용 포트폴리오

기존 데스크톱 기준으로 제작된 루트의 포트폴리오(`../index.html`)를
**모바일 규격(Galaxy Z Fold 계열)** 기준으로 처음부터 다시 만든 버전입니다.

- 미리보기: `https://nht1234.github.io/portfolio/new_portfolio/`
- 기준 단말
  - 커버(접힘) 화면: 약 **374 × 950** CSS px
  - 내부(펼침) 화면: 약 **884 × 1104** CSS px

## 폴더 구조

```
new_portfolio/
├─ index.html      모바일 마크업
├─ css/style.css   Mobile First 스타일 (단일 파일)
├─ js/app.js       Vanilla JS (외부 라이브러리 없음)
└─ README.md
```

이미지와 웹폰트는 저장소에 이미 있는 `../img/`, `../fonts/`를 그대로 참조합니다.
(약 8MB의 에셋을 중복 저장하지 않기 위함이며, 두 버전은 같은 사이트에 함께 배포됩니다.)

## 원본 대비 주요 변경점

### 1. 레이아웃 — 데스크톱 우선 → 모바일 우선
- `media.css`의 데스크톱 기준 하향식 분기(1660px → 375px, 797줄)를 걷어내고,
  좁은 화면을 기본값으로 두고 넓어질 때만 분기하는 구조로 재작성했습니다.
- About 3단 / Skills 4단 가로 배치 → 세로 카드 스택, Skills는 2열 그리드.
- 펼친 화면(≥ 700px)에서는 About 2열, Skills 4열로 자동 확장됩니다.

### 2. 내비게이션
- 화면 네 귀퉁이에 절대 좌표로 배치돼 있던 메뉴(`left: 34%` 등)를 제거하고,
  고정 상단바 + 햄버거 드로어 메뉴로 교체했습니다.
- 드로어는 스크림 탭 / ESC / 메뉴 선택 시 자동으로 닫히며,
  열려 있는 동안 배경 스크롤을 잠급니다(`inert` 처리 포함).

### 3. 스크롤 동작
- 원본의 휠 이벤트 가로채기(`e.preventDefault()` + 섹션 단위 강제 이동)를 제거했습니다.
  모바일에서는 관성 스크롤을 막아 조작감을 해치기 때문입니다.
- `$("section").height($(window).height())`로 높이를 고정하던 방식 대신
  `100svh`와 콘텐츠 기반 높이를 사용해 주소창 노출/숨김에도 잘림이 없습니다.

### 4. 슬라이더
- bxSlider 의존을 제거하고 **CSS `scroll-snap` 기반 네이티브 스와이프**로 교체했습니다.
  터치 반응이 즉각적이고, JS는 도트 인디케이터·화살표·자동재생만 담당합니다.
- 자동재생은 사용자가 화면을 만지거나 탭이 백그라운드로 가면 즉시 멈춥니다.

### 5. 의존성 / 성능
- 제거: jQuery 1.12.4, jQuery UI, easing, mousewheel, prefixfree, bxSlider, Font Awesome
  (약 **350KB** 이상의 JS 감소)
- 남은 스크립트는 `js/app.js` 한 개(약 8KB)이며 `defer`로 로드합니다.
- 이미지에 `loading="lazy"`, `decoding="async"` 적용.
- 웹폰트는 `font-display: swap`, Noto Sans KR은 `@import` 대신 `<link>` + `preconnect`.

### 6. 폴더블 / 접근성 대응
- `env(safe-area-inset-*)`로 펀치홀·제스처 바 영역을 피합니다.
- `@media (horizontal-viewport-segments: 2)`로 힌지(접힘선) 위에 콘텐츠가 걸치지 않게 합니다.
- 접은 채 가로로 눕힌 경우(`max-height: 520px`)를 위한 별도 분기가 있습니다.
- 모든 터치 타깃은 최소 44px 높이를 확보했습니다.
- 본문 바로가기 링크, `aria-expanded` / `aria-selected` 상태, 키보드 포커스 링,
  `prefers-reduced-motion` 대응을 포함합니다.

## 검증

Chromium(Playwright)에서 374×950 / 884×1104 / 360×780 및 가로 모드로 확인했습니다.

- 세 해상도 모두 가로 스크롤(오버플로) 없음
- 타이핑 애니메이션, 드로어 개폐, 슬라이더 스와이프·화살표·도트 동작 정상
- 접힘 ↔ 펼침 전환 시 슬라이더 위치 보정 정상
- JS 런타임 오류 없음

## 기기별 자동 전환

GitHub Pages는 정적 호스팅이라 서버에서 User-Agent 분기를 할 수 없습니다.
그래서 두 페이지가 같은 스크립트(`../js/view-switch.js`)를 `<head>` 최상단에서
동기 실행하고, 자기 자리가 아니면 상대편으로 즉시 넘깁니다.

| 접속 기기 | 주소 | 결과 |
|---|---|---|
| PC | `/portfolio/` | PC 버전 그대로 |
| 모바일 | `/portfolio/` | `/portfolio/new_portfolio/` 로 전환 |
| PC | `/portfolio/new_portfolio/` | `/portfolio/` 로 전환 |
| 모바일 | `/portfolio/new_portfolio/` | 모바일 버전 그대로 |

판정 기준은 `max-width: 900px` **또는** `pointer: coarse` 입니다.
폴드를 펼친 상태(884px)도 모바일로 잡힙니다.

- 무한 리다이렉트 방지: 판정 함수가 양쪽 페이지에서 완전히 동일하므로
  이동 후에는 반드시 `want === here` 가 되어 한 번만 이동합니다.
- 수동 전환: `?view=pc` / `?view=mobile` 로 강제 지정할 수 있고,
  선택은 `sessionStorage`에 기억됩니다(시크릿 모드 대비로 쿼리에도 함께 실림).
- 각 버전 하단에 상대 버전으로 가는 링크가 있습니다.

## 원본 유지

루트의 PC 버전은 **디자인/레이아웃을 전혀 건드리지 않았습니다.**
자동 전환을 위해 `index.html`에 7줄(스크립트·스타일시트 링크·전환 링크)만 추가했고,
`css/style.css`, `css/media.css`, `js/custom.js` 등 기존 파일은 그대로입니다.

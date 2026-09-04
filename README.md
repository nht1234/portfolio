# 노현태 │ 웹 퍼블리셔 포트폴리오

한 저장소에서 **PC 버전**과 **모바일 버전**을 함께 제공합니다.
접속 기기에 따라 알맞은 버전이 자동으로 열립니다.

- 사이트: https://nht1234.github.io/portfolio/

## 구조

```
portfolio/
├─ index.html              PC 버전
├─ css/
│  ├─ base.css             ★ 공용 디자인 시스템 (두 버전이 함께 사용)
│  └─ pc.css               PC 전용 레이어
├─ js/
│  ├─ app.js               ★ 공용 스크립트 (두 버전이 함께 사용)
│  └─ view-switch.js       ★ 기기별 자동 전환
├─ new_portfolio/
│  ├─ index.html           모바일 버전
│  └─ css/mobile.css       모바일 전용 레이어
├─ img/                    ★ 이미지 (공용)
└─ fonts/                  ★ 웹폰트 (공용)
```

★ 표시가 두 버전이 공유하는 파일입니다.
**색·타이포·간격·컴포넌트는 `css/base.css` 한 곳에만 있습니다.**
스타일을 고치면 두 버전에 동시에 반영됩니다.

### 왜 `base.css` 하나로 되나

CSS의 상대 경로는 *페이지* 위치가 아니라 **스타일시트 자기 위치** 기준으로 풀립니다.
`css/base.css` 안의 `../fonts/`, `../img/` 는 어느 페이지에서 불러도
`/fonts/`, `/img/` 로 동일하게 해석되므로, 두 페이지가 같은 파일을 그대로 공유할 수 있습니다.

| 페이지 | base.css 참조 경로 |
|---|---|
| `/index.html` | `css/base.css` |
| `/new_portfolio/index.html` | `../css/base.css` |

### 각 레이어가 담당하는 것

| 파일 | 내용 |
|---|---|
| `css/base.css` | 리셋, 토큰(색/폰트), 히어로, 섹션, 카드, chip, Skills, 슬라이더, 푸터 |
| `css/pc.css` | 가로 내비게이션 + 스크롤스파이, ≥1024·≥1440px 레이아웃, hover 피드백 |
| `new_portfolio/css/mobile.css` | 햄버거 버튼, 드로어, 스크림, 폴더블 브레이크포인트 |

`js/app.js` 도 두 버전이 함께 씁니다. 각 기능은 필요한 DOM이 없으면 조용히
빠져나가므로 한 파일로 양쪽을 다룹니다 — 드로어는 `#drawer` 가 있을 때만,
스크롤스파이는 `.nav` 가 있을 때만 동작합니다.

## 기기별 자동 전환

GitHub Pages는 정적 호스팅이라 서버에서 User-Agent 분기를 할 수 없습니다.
그래서 두 페이지가 같은 `js/view-switch.js` 를 `<head>` 최상단에서 동기 실행하고,
자기 자리가 아니면 상대편으로 즉시 넘깁니다.

| 접속 기기 | 주소 | 결과 |
|---|---|---|
| PC | `/portfolio/` | PC 버전 그대로 |
| 모바일 | `/portfolio/` | `/portfolio/new_portfolio/` 로 전환 |
| PC | `/portfolio/new_portfolio/` | `/portfolio/` 로 전환 |
| 모바일 | `/portfolio/new_portfolio/` | 모바일 버전 그대로 |

판정 기준은 `max-width: 900px` **또는** `pointer: coarse` 입니다.
폴드를 펼친 상태(884px)도 모바일로 잡힙니다.

- **무한 리다이렉트 방지**: 판정 함수가 양쪽 페이지에서 완전히 동일하므로
  이동 후에는 반드시 `want === here` 가 되어 한 번만 이동합니다.
- **수동 전환**: `?view=pc` / `?view=mobile` 로 강제 지정할 수 있고,
  선택은 `sessionStorage`에 기억됩니다(시크릿 모드 대비로 쿼리에도 함께 실림).
- 각 버전 푸터에 상대 버전으로 가는 링크가 있습니다.

## 모바일 버전 설계

기준 단말은 Galaxy Z Fold (커버 ≈ 374px, 펼침 ≈ 884px)입니다.

- 커버 화면은 1열 카드 스택, Skills 2열
- 펼친 화면(≥700px)에서 About 2열, Skills 4열로 확장
- `env(safe-area-inset-*)` 로 펀치홀·제스처 바 회피
- `@media (horizontal-viewport-segments: 2)` 로 힌지 위에 콘텐츠가 걸치지 않게
- 접은 채 가로로 눕힌 경우(`max-height: 520px`) 전용 분기
- 모든 터치 타깃 최소 44px

## 의존성

없습니다. 외부 라이브러리를 쓰지 않습니다.

초기 버전에 있던 jQuery, jQuery UI, easing, mousewheel, prefixfree, bxSlider,
Font Awesome 의존을 모두 제거했습니다(JS 약 350KB 감소). 슬라이더는 라이브러리 대신
CSS `scroll-snap` 을 씁니다. 휠 이벤트를 가로채 섹션 단위로 강제 이동시키던 동작도
없앴습니다 — 관성 스크롤을 막고 스크롤 위치를 예측할 수 없게 만들기 때문입니다.

웹폰트만 외부에서 받습니다(Noto Sans KR, Google Fonts). 본문 폰트인
welcome_R/welcome_B 는 `fonts/` 에 포함되어 있습니다.

## 접근성

- 본문 바로가기 링크, 키보드 포커스 링(`:focus-visible`)
- `aria-expanded` / `aria-selected` 상태 반영
- `prefers-reduced-motion` 존중 (타이핑·등장 효과·부드러운 스크롤 비활성)
- 모든 터치 타깃 최소 44px

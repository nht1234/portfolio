/* =========================================================
   PC판 / 모바일판 자동 전환
   GitHub Pages는 정적 호스팅이라 서버에서 User-Agent 분기를 할 수 없다.
   그래서 두 페이지가 같은 이 스크립트를 <head> 최상단에서 동기 실행하고,
   자기 자리가 아니면 상대편으로 즉시 넘긴다.

   - PC판     : /portfolio/                 (data-view="pc")
   - 모바일판 : /portfolio/new_portfolio/   (data-view="mobile")

   무한 리다이렉트 방지: 판정 함수가 양쪽 페이지에서 완전히 동일하므로
   이동 후에는 반드시 want === here 가 되어 한 번만 이동한다.
   ========================================================= */
(function () {
    'use strict';

    var MOBILE_MAX = 900;            // 폴드 펼침(884px)까지 모바일로 본다
    var KEY = 'nht-view';            // 수동 선택 기억용

    var here = document.documentElement.getAttribute('data-view');
    if (here !== 'pc' && here !== 'mobile') return;   // 표시 없으면 아무것도 하지 않음

    var other = { pc: 'new_portfolio/', mobile: '../' };

    function param(name) {
        var m = new RegExp('[?&]' + name + '=([^&]*)').exec(location.search);
        return m ? decodeURIComponent(m[1]) : null;
    }
    function save(v) { try { sessionStorage.setItem(KEY, v); } catch (e) {} }
    function load()  { try { return sessionStorage.getItem(KEY); } catch (e) { return null; } }

    /* ?view=pc / ?view=mobile 로 사용자가 직접 고르면 그 선택이 최우선 */
    var forced = param('view');
    if (forced !== 'pc' && forced !== 'mobile') forced = null;
    if (forced) save(forced);

    var pref = forced || load();

    var want = pref || (
        (window.matchMedia('(max-width: ' + MOBILE_MAX + 'px)').matches ||
         window.matchMedia('(pointer: coarse)').matches) ? 'mobile' : 'pc'
    );

    if (want !== here) {
        /* sessionStorage를 못 쓰는 환경(시크릿 모드 등)을 위해 선택을 쿼리로도 넘긴다 */
        location.replace(other[here] + (pref ? '?view=' + pref : '') + location.hash);
    }
})();

/* =========================================================
   F1 더 무비 - main.js
   [수정가이드] 아래 CONFIG 값만 바꿔도 주요 동작을 조절할 수 있습니다.
   ========================================================= */
const CONFIG = {
  TRAILER_ID: "",       // 유튜브 영상 ID (예: "abc123XYZ"). 비워두면 유튜브 검색 결과로 이동
  COUNT_DURATION: 2500  // 숫자 카운팅 시간(ms)
};

const $  = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

/* 1. 모바일 햄버거 메뉴: 버튼 클릭 시 메뉴 열기/닫기, 링크 클릭 시 자동 닫힘 */
const nav = $(".nav");
const burger = $(".burger");

burger.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");

  burger.setAttribute("aria-expanded", isOpen);
  burger.setAttribute("aria-label", isOpen ? "메뉴 닫기" : "메뉴 열기");
});

$$(".nav a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("open");
  burger.setAttribute("aria-expanded", "false");
   burger.setAttribute("aria-label", "메뉴 열기");
}));

/* 2. 스크롤 Fade-in + 이미지 Zoom: 화면에 15% 이상 보이면 .show 클래스 추가 */
const revealIO = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      e.target.style.transitionDelay = (i * 0.12) + "s"; // 순차 등장 효과
      e.target.classList.add("show");
      revealIO.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
$$(".reveal").forEach(el => revealIO.observe(el));

/* 3. 네비게이션 활성화: 화면 중앙에 걸친 섹션의 메뉴에 .active 부여 */
const links = $$(".nav a");
const navIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
    }
  });
}, { rootMargin: "-45% 0px -50% 0px" });
$$("main section").forEach(s => navIO.observe(s));

/* 4. HERO 패럴랙스: 마우스 위치(PC) / 스크롤 위치(모바일)에 따라 요소 이동 */
const hero = $("#home");
const layers = $$("[data-parallax]", hero);
hero.addEventListener("mousemove", (e) => {
  const x = e.clientX - innerWidth / 2, y = e.clientY - innerHeight / 2;
  layers.forEach(l => {
    const k = parseFloat(l.dataset.parallax);
    l.style.transform = `translate(${x * k}px, ${y * k}px)`;
  });
});
window.addEventListener("scroll", () => {
  // 스크롤 시 배경이 천천히 움직이는 효과 (hero가 화면에 보일 때만)
  if (scrollY < innerHeight) $(".hero-bg").style.marginTop = (scrollY * 0.2) + "px";
}, { passive: true });

/* 5. RACE 숫자 카운팅 + 진행선: 섹션 진입 시 0 → 목표값(data-count)까지 증가 */
function countUp(el, target, duration) {
  const start = performance.now();
  (function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3); // ease-out: 처음엔 빠르고 끝에서 천천히
    el.textContent = Math.round(target * eased).toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
  })(start);
}
const race = $("#race");
new IntersectionObserver((entries, io) => {
  if (entries[0].isIntersecting) {
    race.classList.add("run"); // CSS에서 진행선(.track-bar) 애니메이션 실행
    $$("[data-count]", race).forEach(el => countUp(el, +el.dataset.count, CONFIG.COUNT_DURATION));
    io.disconnect(); // 한 번만 실행
  }
}, { threshold: 0.4 }).observe(race);

/* 6. 트레일러 팝업: 버튼 클릭 → 모달 열기 → iframe 생성 / 닫으면 iframe 제거(영상 정지) */
const modal = $("#modal"), box = $("#videoBox");
function openTrailer() {
  if (!CONFIG.TRAILER_ID) { // 영상 ID 미설정 시 유튜브 검색으로 대체
    window.open("https://www.youtube.com/results?search_query=F1+The+Movie+official+trailer", "_blank");
    return;
  }
  box.innerHTML = `<iframe src="https://www.youtube.com/embed/${CONFIG.TRAILER_ID}?autoplay=1" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
  modal.classList.add("open");
}
function closeTrailer() { modal.classList.remove("open"); box.innerHTML = ""; }
$("#trailerBtn").addEventListener("click", openTrailer);
$("#closeBtn").addEventListener("click", closeTrailer);
modal.addEventListener("click", e => { if (e.target === modal) closeTrailer(); }); // 배경 클릭 닫기
document.addEventListener("keydown", e => { if (e.key === "Escape") closeTrailer(); }); // ESC 닫기

/* 7. 이미지 로딩 실패 대비: 외부 이미지가 안 뜨면 어두운 배경으로 대체 */
$$("img").forEach(img => img.addEventListener("error", () => { img.style.opacity = 0.2; }));
/* 8. 맨 위로 이동 버튼: 500px 이상 스크롤하면 표시 */
const topBtn = $("#topBtn");

window.addEventListener("scroll", () => {
  if (scrollY > 500) {
    topBtn.classList.add("show");
  } else {
    topBtn.classList.remove("show");
  }
}, { passive: true });

topBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});
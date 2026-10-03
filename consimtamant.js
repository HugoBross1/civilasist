/* Consimțământ pentru Google Analytics 4.
   -------------------------------------------------------------------------
   GA4 pune cookie-uri, deci în Uniunea Europeană nu are voie să pornească
   înainte ca vizitatorul să fie de acord. Varianta aleasă aici e cea mai
   strictă și cea mai simplu de apărat: până la un DA explicit, nu se încarcă
   absolut nimic de la Google — nici măcar scriptul. Nu se trimite niciun
   semnal, nu se scrie niciun cookie.

   De ce nu modul obișnuit, cu semnale fără cookie-uri: acela trimite totuși
   date la Google înainte de acord. Se poate apăra juridic, dar nu e nevoie de
   bătaia asta de cap pentru un site de prezentare.

   Statisticile de bază nu se pierd în niciun caz: măsurătoarea Vercel merge
   mai departe pentru toată lumea. Ea nu folosește cookie-uri și nu urmărește
   omul de la un site la altul, deci nu cere acord.

   Alegerea se ține în localStorage, nu într-un cookie — tot ca să nu scriem
   nimic înainte de a avea voie. */

(function () {
  "use strict";

  var CHEIE   = "civilasist-cookie";
  var MASURA  = "G-N21L3VFLMN";
  var ZILE    = 180;   /* după o jumătate de an întrebăm din nou */

  /* localStorage aruncă eroare în fereastra privată a unor browsere, iar o
     eroare aici ar opri tot scriptul. De aceea trece prin try/catch. */
  function citeste() {
    try { return JSON.parse(localStorage.getItem(CHEIE) || "null"); }
    catch (e) { return null; }
  }
  function scrie(valoare) {
    try { localStorage.setItem(CHEIE, JSON.stringify({ r: valoare, t: Date.now() })); }
    catch (e) { /* fără memorie: banda reapare data viitoare, nu e o problemă */ }
  }

  function expirat(x) {
    return !x || !x.t || (Date.now() - x.t) > ZILE * 86400000;
  }

  /* ---- Google Analytics, pornit numai după acord ---- */
  function pornesteAnaliza() {
    if (window.__gaPornit) return;
    window.__gaPornit = true;

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;

    /* Modul de consimțământ: spunem explicit ce avem voie. Publicitatea
       rămâne refuzată — site-ul nu face reclamă și nu are ce căuta acolo. */
    gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "granted",
      wait_for_update: 500
    });

    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + MASURA;
    document.head.appendChild(s);

    gtag("js", new Date());
    gtag("config", MASURA, { anonymize_ip: true });
  }

  /* ---- Banda de întrebare ---- */
  function stiluri() {
    var css =
      ".cs-banda{position:fixed;left:16px;right:96px;bottom:16px;z-index:95;" +
      "background:var(--bg,#fff);color:var(--text,#10202d);" +
      "border:1px solid var(--border,#e3dbcb);border-radius:12px;" +
      "box-shadow:0 10px 32px rgba(9,29,47,.18);padding:16px 18px;" +
      "max-width:620px;font-size:.9rem;line-height:1.5;" +
      "opacity:0;transform:translateY(12px);transition:opacity .25s ease,transform .25s ease}" +
      ".cs-banda.cs-vazut{opacity:1;transform:translateY(0)}" +
      ".cs-banda p{margin:0 0 12px}" +
      ".cs-banda a{color:var(--accent,#855e1d)}" +
      ".cs-butoane{display:flex;gap:10px;flex-wrap:wrap}" +
      ".cs-btn{font:inherit;font-weight:600;cursor:pointer;border-radius:8px;" +
      "padding:9px 18px;border:1px solid transparent}" +
      ".cs-da{background:var(--aur,#c9903f);color:#091d2f}" +
      ".cs-da:hover{background:var(--aur-hover,#d9a54f)}" +
      ".cs-nu{background:transparent;color:var(--text-muted,#4d5c6b);" +
      "border-color:var(--border,#e3dbcb)}" +
      ".cs-nu:hover{background:var(--bg-alt,#efe8dc)}" +
      "@media (max-width:560px){.cs-banda{left:12px;right:12px;bottom:86px;padding:14px 15px}}" +
      "@media (prefers-reduced-motion:reduce){.cs-banda{transition:none}}";
    var st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);
  }

  function intreaba() {
    stiluri();

    var b = document.createElement("div");
    b.className = "cs-banda";
    b.setAttribute("role", "dialog");
    b.setAttribute("aria-label", "Setări de confidențialitate");

    var p = document.createElement("p");
    p.innerHTML = "Folosim Google Analytics ca să vedem ce pagini sunt citite " +
      "și de unde vin oamenii. Pune cookie-uri, deci vă întrebăm întâi. " +
      "Dacă refuzați, site-ul merge la fel de bine. " +
      "<a href=\"/confidentialitate.html\">Cum prelucrăm datele</a>";

    var gr = document.createElement("div");
    gr.className = "cs-butoane";

    var da = document.createElement("button");
    da.type = "button";
    da.className = "cs-btn cs-da";
    da.textContent = "Sunt de acord";

    var nu = document.createElement("button");
    nu.type = "button";
    nu.className = "cs-btn cs-nu";
    nu.textContent = "Doar ce e strict necesar";

    function inchide() {
      b.classList.remove("cs-vazut");
      setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 260);
    }

    da.addEventListener("click", function () { scrie("da"); pornesteAnaliza(); inchide(); });
    nu.addEventListener("click", function () { scrie("nu"); inchide(); });

    gr.appendChild(da);
    gr.appendChild(nu);
    b.appendChild(p);
    b.appendChild(gr);
    document.body.appendChild(b);

    /* lăsăm un cadru ca tranziția să pornească din starea inițială */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { b.classList.add("cs-vazut"); });
    });
  }

  function start() {
    var ales = citeste();
    if (ales && ales.r === "da" && !expirat(ales)) { pornesteAnaliza(); return; }
    if (ales && ales.r === "nu" && !expirat(ales)) { return; }
    intreaba();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();

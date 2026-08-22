/* Banda cu întrebări.
   Se mișcă singură spre stânga. Se oprește când cursorul stă deasupra ei.
   Cu butonul apăsat se trage în orice direcție, iar pe telefon se trage cu
   degetul, prin derularea nativă. Lista e scrisă de două ori: când s-a
   parcurs o copie întreagă sărim înapoi cu exact o copie, iar cusătura nu
   se vede. */
(function () {
  "use strict";

  var zona = document.querySelector(".derulare");
  if (!zona) return;
  var pista = zona.querySelector(".derulare-pista");
  if (!pista) return;

  var linistit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var VITEZA = 0.4;                 // pixeli pe cadru
  var oprit  = linistit;
  var trage  = false;
  var reia;

  function jumatate() { return pista.scrollWidth / 2; }

  /* Pornim de la 1, nu de la 0: la zero, verificarea de rotire ar sări
     înainte și înapoi în fiecare cadru, iar banda ar părea încremenită. */
  zona.scrollLeft = 1;

  function opreste() { clearTimeout(reia); oprit = true; }
  function porneste(dupa) {
    if (linistit) return;
    clearTimeout(reia);
    reia = setTimeout(function () { oprit = false; }, dupa || 0);
  }

  zona.addEventListener("mouseenter", opreste);
  zona.addEventListener("mouseleave", function () { if (!trage) porneste(250); });
  zona.addEventListener("focusin",  opreste);
  zona.addEventListener("focusout", function () { porneste(600); });

  /* --- tragerea cu mouse-ul --------------------------------------------- */
  /* Doar pentru mouse. Degetul are derulare nativă, cu inerție — mai bună
     decât orice am scrie noi. */
  var plecatDe = 0, scrollLaStart = 0, dus = 0;

  zona.addEventListener("pointerdown", function (e) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    e.preventDefault();             // altfel browserul începe să tragă legătura
    trage = true; dus = 0;
    plecatDe = e.clientX;
    scrollLaStart = zona.scrollLeft;
    opreste();
    zona.setPointerCapture(e.pointerId);
    zona.classList.add("se-trage");
  });

  zona.addEventListener("pointermove", function (e) {
    if (!trage) return;
    var d = e.clientX - plecatDe;
    dus = Math.abs(d);
    zona.scrollLeft = scrollLaStart - d;
  });

  function lasa(e) {
    if (!trage) return;
    trage = false;
    zona.classList.remove("se-trage");
    if (e && e.pointerId != null && zona.hasPointerCapture(e.pointerId)) {
      zona.releasePointerCapture(e.pointerId);
    }
    porneste(1500);                 // răgaz, ca omul să apuce să citească
  }
  zona.addEventListener("pointerup", lasa);
  zona.addEventListener("pointercancel", lasa);

  /* O tragere nu trebuie să deschidă întrebarea de sub cursor */
  zona.addEventListener("click", function (e) {
    if (dus > 6) { e.preventDefault(); e.stopPropagation(); dus = 0; }
  }, true);

  /* Browserul nu are voie să tragă legăturile ca pe niște fișiere */
  zona.addEventListener("dragstart", function (e) { e.preventDefault(); });

  /* --- degetul, pe telefon ---------------------------------------------- */
  zona.addEventListener("touchstart", opreste, { passive: true });
  zona.addEventListener("touchend",   function () { porneste(1500); }, { passive: true });

  /* --- bucla ------------------------------------------------------------ */
  zona.addEventListener("scroll", roteste, { passive: true });

  function roteste() {
    var j = jumatate();
    if (j < 2) return;
    if (zona.scrollLeft >= j) {
      zona.scrollLeft -= j;
      scrollLaStart -= j;           // ca tragerea în curs să nu se smucească
    } else if (zona.scrollLeft <= 0) {
      zona.scrollLeft += j;
      scrollLaStart += j;
    }
  }

  function cadru() {
    if (!oprit && !trage) zona.scrollLeft += VITEZA;
    requestAnimationFrame(cadru);
  }
  requestAnimationFrame(cadru);
})();

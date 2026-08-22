/* Banda cu întrebări: se mișcă singură, dar rămâne o zonă derulabilă
   adevărată — se poate trage cu degetul pe telefon și cu mouse-ul pe
   calculator. Lista e scrisă de două ori, iar când s-a parcurs o copie
   întreagă sărim înapoi cu exact o copie: bucla nu se vede. */
(function () {
  "use strict";

  var zona = document.querySelector(".derulare");
  if (!zona) return;

  var lin = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var VITEZA = 0.45;              // pixeli pe cadru
  var oprit  = lin;               // cine a cerut mișcare redusă nu primește deloc
  var reia;

  function jumatate() { return zona.scrollWidth / 2; }

  function opreste()  { clearTimeout(reia); oprit = true; }
  function porneste(intarziere) {
    if (lin) return;
    clearTimeout(reia);
    reia = setTimeout(function () { oprit = false; }, intarziere || 0);
  }

  zona.addEventListener("mouseenter", opreste);
  zona.addEventListener("mouseleave", function () { porneste(300); });
  zona.addEventListener("focusin",  opreste);
  zona.addEventListener("focusout", function () { porneste(600); });

  /* --- tragere cu degetul sau cu mouse-ul ------------------------------- */
  var trage = false, plecatDeLa = 0, scrollLaStart = 0, distanta = 0;

  zona.addEventListener("pointerdown", function (e) {
    trage = true; distanta = 0;
    plecatDeLa = e.clientX;
    scrollLaStart = zona.scrollLeft;
    opreste();
    zona.classList.add("se-trage");
  });

  window.addEventListener("pointermove", function (e) {
    if (!trage) return;
    var d = e.clientX - plecatDeLa;
    distanta = Math.abs(d);
    if (distanta > 3) zona.scrollLeft = scrollLaStart - d;
  });

  window.addEventListener("pointerup", function () {
    if (!trage) return;
    trage = false;
    zona.classList.remove("se-trage");
    porneste(1200);               // răgaz, ca omul să apuce să citească
  });

  /* O tragere nu trebuie să deschidă întrebarea peste care s-a nimerit */
  zona.addEventListener("click", function (e) {
    if (distanta > 6) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  /* Degetul pe telefon derulează nativ; oprim doar mișcarea automată */
  zona.addEventListener("touchstart", opreste, { passive: true });
  zona.addEventListener("touchend",   function () { porneste(1200); }, { passive: true });
  zona.addEventListener("scroll", function () { if (!trage) roteste(); }, { passive: true });

  function roteste() {
    var j = jumatate();
    if (j < 2) return;
    if (zona.scrollLeft >= j)  zona.scrollLeft -= j;
    else if (zona.scrollLeft <= 0) zona.scrollLeft += j;
  }

  function cadru() {
    if (!oprit && !trage) {
      zona.scrollLeft += VITEZA;
      roteste();
    }
    requestAnimationFrame(cadru);
  }
  requestAnimationFrame(cadru);
})();

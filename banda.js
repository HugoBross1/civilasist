/* Banda cu întrebări.
   Se mișcă singură spre stânga; se oprește când cursorul stă deasupra ei.
   Cu butonul apăsat se trage în orice direcție, iar pe telefon se trage cu
   degetul, prin derularea nativă. Lista e scrisă de două ori: după o copie
   întreagă sărim înapoi cu exact o copie, iar cusătura nu se vede. */
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

  /* Poziția se ține aici, nu în scrollLeft: browserul rotunjește scrollLeft
     la pixel întreg, iar pașii de sub un pixel s-ar pierde toți, cadru după
     cadru, și banda ar sta pe loc. */
  var poz = 0;

  function jumatate() { return pista.scrollWidth / 2; }

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
  /* Doar pentru mouse: degetul are derulare nativă, cu inerție, mai bună
     decât orice am scrie noi. */
  var plecatDe = 0, pozLaStart = 0, dus = 0;

  /* Cat poate aluneca mana intr-un clic normal si tot sa conteze clic.
     Sase pixeli erau prea putin: orice om miscă mouse-ul atat, mai ales
     pe laptop, iar intrebarea nu se mai deschidea. */
  var PRAG = 14;
  var aFostTragere = false;

  zona.addEventListener("pointerdown", function (e) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    e.preventDefault();             // altfel browserul începe să tragă legătura
    trage = true; dus = 0;
    plecatDe = e.clientX;
    pozLaStart = poz;
    opreste();
    zona.setPointerCapture(e.pointerId);
    zona.classList.add("se-trage");
  });

  zona.addEventListener("pointermove", function (e) {
    if (!trage) return;
    var d = e.clientX - plecatDe;
    dus = Math.abs(d);
    poz = pozLaStart - d;
    aseaza();
  });

  function lasa(e) {
    if (!trage) return;
    trage = false;
    aFostTragere = dus > PRAG;   /* se decide o data, aici, nu in click */
    zona.classList.remove("se-trage");
    if (e && e.pointerId != null && zona.hasPointerCapture(e.pointerId)) {
      zona.releasePointerCapture(e.pointerId);
    }
    porneste(1500);                 // răgaz, ca omul să apuce să citească
  }
  zona.addEventListener("pointerup", lasa);
  zona.addEventListener("pointercancel", lasa);

  /* O tragere adevărată nu trebuie să deschidă întrebarea de sub cursor.
     Steagul se șterge la fiecare clic, ca o tragere de acum să nu blocheze
     apăsarea următoare. */
  zona.addEventListener("click", function (e) {
    if (aFostTragere) { e.preventDefault(); e.stopPropagation(); }
    aFostTragere = false;
  }, true);

  /* Browserul nu are voie să tragă legăturile ca pe niște fișiere */
  zona.addEventListener("dragstart", function (e) { e.preventDefault(); });

  /* --- degetul, pe telefon ---------------------------------------------- */
  /* Aici derulează browserul; noi doar oprim mișcarea automată și, la final,
     ne luăm poziția de la el. */
  zona.addEventListener("touchstart", opreste, { passive: true });
  zona.addEventListener("touchend", function () {
    poz = zona.scrollLeft;
    porneste(1500);
  }, { passive: true });

  /* --- bucla ------------------------------------------------------------ */
  function aseaza() {
    var j = jumatate();
    if (j > 2) {
      while (poz >= j) { poz -= j; pozLaStart -= j; }
      while (poz < 0)  { poz += j; pozLaStart += j; }
    }
    zona.scrollLeft = poz;
  }

  function cadru() {
    if (!oprit && !trage) { poz += VITEZA; aseaza(); }
    requestAnimationFrame(cadru);
  }
  requestAnimationFrame(cadru);
})();

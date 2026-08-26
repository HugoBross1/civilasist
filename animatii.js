/* Animatiile site-ului: dezvaluirea cardurilor la derulare, pornirea
   planselor tehnice din capul paginilor de serviciu si ornamentul de cota
   de sub titluri. Totul e imbunatatire progresiva: fara JavaScript sau cu
   "miscare redusa" cerut de sistem, pagina arata la fel, doar nemiscat. */

(function () {
  "use strict";

  var redus = window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var areIO = "IntersectionObserver" in window;

  /* ---- ornamentul de cota: o linie de masurare sub fiecare h1 ----------- */
  /* Se pune si cu miscare redusa — CSS-ul il tine atunci desenat complet. */

  var h1 = document.querySelector("h1");
  if (h1) {
    var NS = "http://www.w3.org/2000/svg";
    var orn = document.createElementNS(NS, "svg");
    orn.setAttribute("class", "ornament-cota");
    orn.setAttribute("viewBox", "0 0 190 20");
    orn.setAttribute("aria-hidden", "true");
    orn.setAttribute("focusable", "false");
    var piese = [
      ["line", { x1: 4,   y1: 2,  x2: 4,   y2: 18, "class": "oc-fin tras" }, 0],
      ["line", { x1: 186, y1: 2,  x2: 186, y2: 18, "class": "oc-fin tras" }, 0],
      ["line", { x1: 10,  y1: 10, x2: 180, y2: 10, "class": "oc-lin tras" }, 150],
      ["path", { d: "M10 10 l8 -4 M10 10 l8 4",    "class": "oc-lin tras" }, 600],
      ["path", { d: "M180 10 l-8 -4 M180 10 l-8 4", "class": "oc-lin tras" }, 600]
    ];
    for (var i = 0; i < piese.length; i++) {
      var el = document.createElementNS(NS, piese[i][0]);
      var at = piese[i][1];
      for (var k in at) el.setAttribute(k, at[k]);
      el.setAttribute("pathLength", "1");
      if (piese[i][2]) el.style.setProperty("--tras-d", piese[i][2] + "ms");
      orn.appendChild(el);
    }
    h1.insertAdjacentElement("afterend", orn);
  }

  if (redus) return;   /* de aici incolo e numai miscare */

  /* ---- plansele tehnice: liniile se traseaza cand desenul se vede ------- */

  var planse = document.querySelectorAll("svg.art-anim");
  for (var p = 0; p < planse.length; p++) {
    (function (svg) {
      var linii = svg.querySelectorAll(".tras");
      for (var j = 0; j < linii.length; j++) {
        linii[j].style.setProperty("--tras-d", Math.min(j * 70, 1500) + "ms");
      }
      var dupa = Math.min(linii.length * 70, 1500) + 350;
      svg.style.setProperty("--apare-d", dupa + "ms");

      /* Ce e deja pe ecran porneste direct, din masuratoare — nu asteapta
         observatorul (care in taburi de fundal poate tacea pana la focus). */
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var rr = svg.getBoundingClientRect();
      if (vh > 0 && rr.top < vh && rr.bottom > 0) {
        svg.classList.add("porneste");
        return;
      }
      if (!areIO) { svg.classList.add("porneste"); return; }
      var ob = new IntersectionObserver(function (intrari) {
        for (var q = 0; q < intrari.length; q++) {
          if (intrari[q].isIntersecting) {
            svg.classList.add("porneste");
            ob.disconnect();
          }
        }
      }, { threshold: 0.25 });
      ob.observe(svg);
    })(planse[p]);
  }

  /* ---- dezvaluirea la derulare ------------------------------------------ */

  if (!areIO) return;

  var tinte = document.querySelectorAll(
    ".svc, .card, .card-contact, .listcol, .callout, .project, " +
    ".galerie figure, .figura, .prose h2, .quals li"
  );
  if (!tinte.length) return;

  var jos = window.innerHeight || document.documentElement.clientHeight;
  var obAnima = new IntersectionObserver(function (intrari) {
    for (var q = 0; q < intrari.length; q++) {
      if (intrari[q].isIntersecting) {
        intrari[q].target.classList.add("vazut");
        obAnima.unobserve(intrari[q].target);
      }
    }
  }, { rootMargin: "0px 0px -7% 0px" });

  for (var t = 0; t < tinte.length; t++) {
    var el2 = tinte[t];
    var r = el2.getBoundingClientRect();
    /* ce e deja in fata ochilor (sau deasupra, dupa un salt la ancora)
       ramane pe loc — animam doar ce urmeaza sa apara de jos */
    if (r.top < jos) continue;
    var frate = 0, cauta = el2;
    while ((cauta = cauta.previousElementSibling) && frate < 5) frate++;
    el2.style.setProperty("--anima-d", (frate % 6) * 70 + "ms");
    el2.classList.add("anima");
    obAnima.observe(el2);
  }
})();

/* Căutare în tot site-ul, fără server: se descarcă o dată lista de întrebări
   și pagini, apoi filtrarea se face în browser.
   Diacriticele sunt ignorate în ambele sensuri — cine scrie „receptie"
   găsește „recepția", și invers. */
(function () {
  "use strict";

  var cutie = document.querySelector("[data-cautare]");
  if (!cutie) return;

  var camp      = cutie.querySelector("input");
  var rezultate = cutie.querySelector("[data-rezultate]");
  var index     = null;
  var ales      = -1;

  cutie.hidden = false;                       // fără JS rămâne ascunsă

  function fara(t) {
    return t.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/ș/g, "s").replace(/ț/g, "t");
  }

  function adu() {
    if (index) return Promise.resolve(index);
    return fetch("/cautare.json")
      .then(function (r) { return r.json(); })
      .then(function (d) {
        index = d.map(function (x) {
          x._t = fara(x.t); x._c = fara(x.c);
          return x;
        });
        return index;
      });
  }

  function caut(q) {
    var cuvinte = fara(q).split(/\s+/).filter(Boolean);
    if (!cuvinte.length) return [];
    return index
      .map(function (x) {
        var scor = 0;
        for (var i = 0; i < cuvinte.length; i++) {
          var c = cuvinte[i];
          if (x._t.indexOf(c) === -1 && x._c.indexOf(c) === -1) return null;
          if (x._t.indexOf(c) === 0) scor += 3;          // începe cu termenul
          else if (x._t.indexOf(" " + c) > -1) scor += 2; // cuvânt întreg
          else if (x._t.indexOf(c) > -1) scor += 1;
          if (x._c.indexOf(c) > -1) scor += 1;            // e în titlul paginii
        }
        if (x.k === "întrebare") scor += 1;               // întrebările primele
        return { x: x, scor: scor };
      })
      .filter(Boolean)
      .sort(function (a, b) { return b.scor - a.scor; })
      .slice(0, 8)
      .map(function (r) { return r.x; });
  }

  function scrie(lista, q) {
    ales = -1;
    if (!q.trim()) { rezultate.hidden = true; rezultate.innerHTML = ""; return; }
    if (!lista.length) {
      rezultate.innerHTML = '<p class="nimic">Nimic pentru „' +
        q.replace(/[<>&]/g, "") + '". Încercați alt cuvânt — de pildă ' +
        '<em>recepție</em>, <em>autorizație</em>, <em>teren</em>, <em>drona</em>.</p>';
      rezultate.hidden = false;
      return;
    }
    rezultate.innerHTML = lista.map(function (x) {
      return '<a href="' + x.u + '"><span class="ce">' + x.t +
             '</span><span class="unde">' + x.c + '</span></a>';
    }).join("");
    rezultate.hidden = false;
  }

  var asteapta;
  camp.addEventListener("input", function () {
    var q = camp.value;
    clearTimeout(asteapta);
    asteapta = setTimeout(function () {
      adu().then(function () { scrie(caut(q), q); });
    }, 90);
  });

  camp.addEventListener("keydown", function (e) {
    var linkuri = rezultate.querySelectorAll("a");
    if (e.key === "Escape") { rezultate.hidden = true; camp.blur(); return; }
    if (!linkuri.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      ales += (e.key === "ArrowDown" ? 1 : -1);
      if (ales < 0) ales = linkuri.length - 1;
      if (ales >= linkuri.length) ales = 0;
      linkuri[ales].focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      linkuri[ales > -1 ? ales : 0].click();
    }
  });

  document.addEventListener("click", function (e) {
    if (!cutie.contains(e.target)) rezultate.hidden = true;
  });
})();

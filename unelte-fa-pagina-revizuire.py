"""Generează pagina de revizuire a întrebărilor din intrebari.json."""
import json, io, html, os

CALE = "C:/Users/user/Documents/00 Claude/site/intrebari.json"
IESIRE = ("C:/Users/user/AppData/Local/Temp/claude/"
          "C--Users-user-Documents-00-Claude/"
          "f19a3161-b6e7-4a90-a519-32968ea97187/scratchpad/revizuire.html")

GHIDURI_NOI = {
    "cat-costa-si-cat-dureaza-un-proiect",
    "cat-pot-construi-pe-teren",
    "mansardare-si-modificari",
    "studii-si-verificari-de-proiect",
}
TITLURI = {
    "cat-costa-si-cat-dureaza-un-proiect": "Cât costă și cât durează un proiect",
    "cat-pot-construi-pe-teren": "Cât pot construi pe teren",
    "mansardare-si-modificari": "Mansardare și modificări",
    "studii-si-verificari-de-proiect": "Studii și verificări de proiect",
    "certificat-de-urbanism": "Certificatul de urbanism",
    "autorizatie-de-construire": "Autorizația de construire",
    "avize-utilitati": "Avizele de la utilități",
    "acorduri-mediu-dsp-dsv": "Acorduri: mediu, DSP, DSV",
    "anexe-gospodaresti": "Anexe gospodărești",
    "intrare-in-legalitate": "Intrarea în legalitate",
    "verificari-inainte-de-cumparare-teren": "Verificări înainte de a cumpăra teren",
    "cartea-funciara": "Cartea funciară",
}

d = [x for x in json.load(io.open(CALE, encoding="utf-8"))
     if x["serviciu"] == "proiectare"]

# ghidurile noi primele — sunt textele pe care nu le-a citit încă
ordine = [g for g in TITLURI if g in GHIDURI_NOI] + \
         [g for g in TITLURI if g not in GHIDURI_NOI]
grupe = []
for g in ordine:
    lot = [x for x in d if x["ghid"] == g]
    if lot:
        grupe.append((g, TITLURI.get(g, g), lot))

date = [{"id": x["id"], "i": x["i"], "r": x["r"], "g": x["ghid"],
         "nou": x["ghid"] in GHIDURI_NOI} for x in d]

corp = []
n = 0
for gid, titlu, lot in grupe:
    nou = ' <span class="chip nou">nou</span>' if gid in GHIDURI_NOI else ""
    corp.append('<section class="grup" data-grup="%s">' % html.escape(gid))
    corp.append('  <h2>%s%s <span class="cat">%d</span></h2>'
                % (html.escape(titlu), nou, len(lot)))
    for x in lot:
        n += 1
        corp.append(
            '  <article class="fisa" data-id="%s" data-nou="%s">'
            % (html.escape(x["id"]), "1" if x["ghid"] in GHIDURI_NOI else "0"))
        corp.append('    <div class="cap"><span class="nr">%d</span>'
                    '<h3>%s</h3><span class="stare" data-stare></span></div>'
                    % (n, html.escape(x["i"])))
        corp.append('    <p class="rasp">%s</p>' % x["r"])
        corp.append('    <div class="acte">'
                    '<button type="button" class="b bun" data-act="bun">E bine</button>'
                    '<button type="button" class="b sch" data-act="schimb">De schimbat</button>'
                    '</div>')
        corp.append('    <div class="nota" hidden>'
                    '<label>Ce schimbăm?<textarea rows="3" '
                    'placeholder="Scrieți cum ar trebui să sune, sau doar ce vă deranjează."></textarea></label>'
                    '<button type="button" class="b mic" data-act="salveaza">Salvează nota</button>'
                    '</div>')
        corp.append('  </article>')
    corp.append('</section>')

SABLON = """<title>Revizuire întrebări proiectare</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap">
<style>
:root{
  --fund:#f7f8fa; --carte:#ffffff; --cerneala:#10141a; --stins:#5a6472;
  --linie:#e3e7ed; --brand:#1e6bb8; --atentie:#ab5d15; --bine:#1c7a4a;
  --bine-fund:#e8f5ee; --atentie-fund:#fdf1e3; --umbra:0 1px 2px rgba(16,20,26,.06);
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --fund:#0e1116; --carte:#161b22; --cerneala:#e8ecf2; --stins:#93a0b0;
    --linie:#242c36; --brand:#66aaea; --atentie:#e39a4e; --bine:#5bc98d;
    --bine-fund:#13251b; --atentie-fund:#2a1f12; --umbra:none;
  }
}
:root[data-theme="dark"]{
  --fund:#0e1116; --carte:#161b22; --cerneala:#e8ecf2; --stins:#93a0b0;
  --linie:#242c36; --brand:#66aaea; --atentie:#e39a4e; --bine:#5bc98d;
  --bine-fund:#13251b; --atentie-fund:#2a1f12; --umbra:none;
}
*{box-sizing:border-box}
body{
  margin:0; background:var(--fund); color:var(--cerneala);
  font:400 16px/1.6 Inter,system-ui,-apple-system,Segoe UI,sans-serif;
  -webkit-font-smoothing:antialiased;
}
.folie{max-width:760px; margin:0 auto; padding:0 20px 80px}
header.sus{padding:44px 0 22px}
header.sus p.sub{color:var(--stins); margin:.5em 0 0; max-width:62ch}
h1{
  font:700 clamp(1.6rem,4vw,2.15rem)/1.15 "Space Grotesk",Inter,sans-serif;
  letter-spacing:-.02em; margin:0; text-wrap:balance;
}
.bara{
  position:sticky; top:0; z-index:10; background:var(--fund);
  border-bottom:1px solid var(--linie); padding:12px 0;
  display:flex; flex-wrap:wrap; gap:10px 16px; align-items:center;
}
.numar{display:flex; gap:14px; font-size:.85rem; color:var(--stins);
  font-variant-numeric:tabular-nums}
.numar b{color:var(--cerneala); font-weight:600}
.filtre{display:flex; gap:6px; margin-left:auto; flex-wrap:wrap}
.f{
  font:500 .8rem/1 Inter,sans-serif; padding:7px 12px; border-radius:999px;
  border:1px solid var(--linie); background:var(--carte); color:var(--stins);
  cursor:pointer;
}
.f[aria-pressed="true"]{border-color:var(--brand); color:var(--brand)}
.f:focus-visible,.b:focus-visible{outline:2px solid var(--brand); outline-offset:2px}
.grup{margin:38px 0 0}
.grup h2{
  font:500 .78rem/1.3 Inter,sans-serif; text-transform:uppercase;
  letter-spacing:.09em; color:var(--stins); margin:0 0 12px;
  display:flex; align-items:center; gap:8px;
}
.cat{font-variant-numeric:tabular-nums; color:var(--stins); font-weight:400}
.chip{
  font:500 .66rem/1 Inter,sans-serif; text-transform:uppercase;
  letter-spacing:.08em; padding:3px 7px; border-radius:4px;
}
.chip.nou{background:var(--atentie-fund); color:var(--atentie)}
.fisa{
  background:var(--carte); border:1px solid var(--linie); border-left:3px solid var(--linie);
  border-radius:8px; padding:16px 18px; margin:0 0 10px; box-shadow:var(--umbra);
}
.fisa[data-d="bun"]{border-left-color:var(--bine)}
.fisa[data-d="schimb"]{border-left-color:var(--atentie)}
.cap{display:flex; gap:10px; align-items:baseline}
.nr{
  font:500 .78rem/1.5 Inter,sans-serif; color:var(--stins);
  font-variant-numeric:tabular-nums; min-width:2ch; text-align:right;
}
.fisa h3{
  font:600 1.02rem/1.4 Inter,sans-serif; margin:0; flex:1; text-wrap:balance;
}
.stare{font:500 .72rem/1 Inter,sans-serif; white-space:nowrap}
.fisa[data-d="bun"] .stare{color:var(--bine)}
.fisa[data-d="schimb"] .stare{color:var(--atentie)}
.rasp{margin:.6em 0 0 calc(2ch + 10px); color:var(--stins)}
.acte{display:flex; gap:8px; margin:14px 0 0 calc(2ch + 10px)}
.b{
  font:500 .84rem/1 Inter,sans-serif; padding:9px 14px; border-radius:6px;
  border:1px solid var(--linie); background:var(--carte); color:var(--cerneala);
  cursor:pointer;
}
.b:hover{border-color:var(--brand)}
.fisa[data-d="bun"] .b.bun{background:var(--bine-fund); border-color:var(--bine); color:var(--bine)}
.fisa[data-d="schimb"] .b.sch{background:var(--atentie-fund); border-color:var(--atentie); color:var(--atentie)}
.b.mic{padding:7px 12px; font-size:.8rem}
.b.salv{padding:7px 13px; font-size:.8rem}
.b.salv:disabled{color:var(--stins); cursor:default; border-color:var(--linie)}
.b.salv.aprins{background:var(--brand); border-color:var(--brand); color:#fff}
.nota{margin:12px 0 0 calc(2ch + 10px); display:flex; flex-direction:column; gap:8px; align-items:flex-start}
/* display din clasa bate atributul hidden, deci il spunem explicit */
[hidden]{display:none !important}
.nota label{display:flex; flex-direction:column; gap:6px; width:100%;
  font:500 .78rem/1.4 Inter,sans-serif; color:var(--stins)}
.nota textarea{
  width:100%; font:400 .93rem/1.5 Inter,sans-serif; padding:10px 12px;
  border-radius:6px; border:1px solid var(--linie);
  background:var(--fund); color:var(--cerneala); resize:vertical;
}
.nota textarea:focus{outline:2px solid var(--brand); outline-offset:1px}
.scris{margin:.4em 0 0 calc(2ch + 10px); font-size:.86rem; color:var(--atentie)}
.fisa[hidden]{display:none}
.grup[hidden]{display:none}
footer.jos{margin:46px 0 0; padding-top:18px; border-top:1px solid var(--linie);
  color:var(--stins); font-size:.86rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
<script id="stare" type="application/json">{"d":{}}</script>
<div class="folie">
<header class="sus">
  <h1>Întrebările de proiectare</h1>
  <p class="sub">Șaizeci de întrebări, cu răspunsurile așa cum vor apărea pe site.
  Cele marcate <span class="chip nou">nou</span> sunt scrise acum și nu le-ați
  citit încă. Apăsați <b>E bine</b> sau <b>De schimbat</b> la fiecare — alegerile
  rămân salvate, puteți închide pagina și reveni.</p>
</header>
<div class="bara">
  <div class="numar">
    <span><b data-n="bun">0</b> bune</span>
    <span><b data-n="schimb">0</b> de schimbat</span>
    <span><b data-n="rest">0</b> necitite</span>
  </div>
  <div class="filtre">
    <button type="button" class="f" data-f="tot" aria-pressed="true">Toate</button>
    <button type="button" class="f" data-f="nou" aria-pressed="false">Doar noi</button>
    <button type="button" class="f" data-f="rest" aria-pressed="false">Necitite</button>
    <button type="button" class="f" data-f="schimb" aria-pressed="false">De schimbat</button>
    <button type="button" class="b salv" data-salveaza disabled>Salvat</button>
  </div>
</div>
__CORP__
<footer class="jos">Alegerile se salvează în pagină. Când terminați, spuneți-mi
și le citesc de aici.</footer>
</div>
<script>
(function(){
  "use strict";
  var PRISTIN = document.documentElement.outerHTML;
  var publicat = JSON.parse(document.getElementById("stare").textContent).d || {};
  var stare = publicat;
  var aparat = null, nesalvate = 0;

  /* Ciornă locală: dacă închide pagina fără să salveze, nu pierde nimic. */
  var CHEIE = "civilasist-revizuire-proiectare";
  try {
    var c = JSON.parse(localStorage.getItem(CHEIE) || "null");
    if (c && c.n > Object.keys(publicat).length) { stare = c.d; nesalvate = c.n - Object.keys(publicat).length; }
  } catch(e){}

  function butonSalvare(){
    var b = document.querySelector("[data-salveaza]");
    if (nesalvate > 0) { b.disabled = false; b.textContent = "Salvează (" + nesalvate + ")"; b.classList.add("aprins"); }
    else { b.disabled = true; b.textContent = "Salvat"; b.classList.remove("aprins"); }
  }
  function ciorna(){
    nesalvate++;
    try { localStorage.setItem(CHEIE, JSON.stringify({d:stare, n:Object.keys(stare).length})); } catch(e){}
    butonSalvare();
  }

  function pune(){
    var b=0,s=0,t=0;
    document.querySelectorAll(".fisa").forEach(function(f){
      var id=f.dataset.id, x=stare[id];
      t++;
      if(x&&x.d==="bun"){b++;f.dataset.d="bun";f.querySelector("[data-stare]").textContent="bine";}
      else if(x&&x.d==="schimb"){s++;f.dataset.d="schimb";f.querySelector("[data-stare]").textContent="de schimbat";
        f.querySelector(".nota").hidden=false;
        var ta=f.querySelector("textarea"); if(x.n&&ta.value!==x.n) ta.value=x.n;
        var v=f.querySelector(".scris");
        if(x.n){ if(!v){v=document.createElement("p");v.className="scris";f.appendChild(v);} v.textContent="Notat: "+x.n; }
      }
      else { delete f.dataset.d; f.querySelector("[data-stare]").textContent=""; }
    });
    document.querySelector('[data-n="bun"]').textContent=b;
    document.querySelector('[data-n="schimb"]').textContent=s;
    document.querySelector('[data-n="rest"]').textContent=t-b-s;
    filtreaza();
  }

  var filtruActiv="tot";
  function filtreaza(){
    document.querySelectorAll(".fisa").forEach(function(f){
      var x=stare[f.dataset.id], d=x?x.d:null, arata=true;
      if(filtruActiv==="nou") arata = f.dataset.nou==="1";
      else if(filtruActiv==="rest") arata = !d;
      else if(filtruActiv==="schimb") arata = d==="schimb";
      f.hidden=!arata;
    });
    document.querySelectorAll(".grup").forEach(function(g){
      g.hidden = !g.querySelector(".fisa:not([hidden])");
    });
  }

  async function salveaza(){
    var b = document.querySelector("[data-salveaza]");
    b.disabled = true; b.textContent = "Se salvează…";
    if(!aparat){ aparat = await claude.use("artifact"); }
    if(!aparat){ b.textContent = "Nu se poate salva"; return; }
    var nou = PRISTIN.replace(
      /(<script id="stare" type="application\\/json">)[\\s\\S]*?(<\\/script>)/,
      "$1" + JSON.stringify({d:stare}).replace(/\\$/g,"$$$$") + "$2");
    try {
      await aparat.publish("<!doctype html>\\n" + nou);
      try { localStorage.removeItem(CHEIE); } catch(e){}
    } catch(e){
      b.disabled = false; b.textContent = "Reîncercați";
    }
  }

  document.addEventListener("click", function(e){
    if(e.target.closest("[data-salveaza]")){ salveaza(); return; }
    var b=e.target.closest("[data-act]"); if(b){
      var f=b.closest(".fisa"), id=f.dataset.id, a=b.dataset.act;
      var acum = stare[id] && stare[id].d;
      if(a==="bun"){
        if(acum==="bun"){ delete stare[id]; }              /* a doua apăsare anulează */
        else { stare[id]={d:"bun"}; }
        f.querySelector(".nota").hidden=true;
        var v=f.querySelector(".scris"); if(v) v.remove(); }
      else if(a==="schimb"){
        if(acum==="schimb"){ delete stare[id]; f.querySelector(".nota").hidden=true;
          var v2=f.querySelector(".scris"); if(v2) v2.remove(); }
        else { stare[id]={d:"schimb", n:""};
          f.querySelector(".nota").hidden=false; f.querySelector("textarea").focus(); } }
      else if(a==="salveaza"){ stare[id]={d:"schimb", n:f.querySelector("textarea").value.trim()}; }
      pune(); ciorna(); return;
    }
    var ff=e.target.closest("[data-f]"); if(ff){
      filtruActiv=ff.dataset.f;
      document.querySelectorAll("[data-f]").forEach(function(x){
        x.setAttribute("aria-pressed", String(x===ff)); });
      filtreaza();
    }
  });
  document.addEventListener("change", function(e){
    if(e.target.tagName==="TEXTAREA"){
      var f=e.target.closest(".fisa");
      stare[f.dataset.id]={d:"schimb", n:e.target.value.trim()};
      pune(); ciorna();
    }
  });

  pune(); butonSalvare();
})();
</script>
"""

pagina = SABLON.replace("__DATE__", json.dumps(date, ensure_ascii=False)) \
               .replace("__CORP__", "\n".join(corp))
io.open(IESIRE, "w", encoding="utf-8").write(pagina)
print("scris:", IESIRE)
print("intrebari in pagina:", len(date), " grupe:", len(grupe))
print("marime:", len(pagina), "octeti")

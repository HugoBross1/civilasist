/* Publică zilnic câte o întrebare pe fiecare pagină de Facebook configurată.
   Fiecare pagină primește numai temele care o privesc, ca publicul ei să nu
   fie luat pe nepregătite cu subiecte străine.

   Configurarea se face din variabilele de mediu ale proiectului, nu din cod:

     FB_TOKEN           jetonul utilizatorului de sistem — unul singur,
                        valabil pentru toate paginile
     FB_PAGINA_1_ID     identificatorul paginii
     FB_PAGINA_1_TEME   temele, despărțite prin virgulă: autorizare,teren,executie,iscir
     FB_PAGINA_1_NUME   (opțional) un nume, doar ca să se citească în jurnal
     FB_PAGINA_1_TOKEN  (opțional) jeton doar pentru pagina asta, dacă e nevoie

   La fel pentru _2 și _3. Jetonul stă numai acolo; în cod nu apare. */

const toate = require("../postari-facebook.json");

const GRAPH = "https://graph.facebook.com/v21.0";
const SITE  = process.env.SITE_URL || "https://civilasist.vercel.app";

function pagini() {
  const lista = [];
  for (let n = 1; n <= 5; n++) {
    const id = process.env["FB_PAGINA_" + n + "_ID"];
    // jetonul propriu al paginii, dacă există; altfel cel comun
    const token = process.env["FB_PAGINA_" + n + "_TOKEN"] || process.env.FB_TOKEN;
    if (!id || !token) continue;
    const teme = (process.env["FB_PAGINA_" + n + "_TEME"] || "")
      .split(",").map(t => t.trim()).filter(Boolean);
    lista.push({
      nume: process.env["FB_PAGINA_" + n + "_NUME"] || ("pagina " + n),
      id, token, teme,
    });
  }
  return lista;
}

function ziuaCurenta() {
  const start = Date.parse((process.env.FB_START || "2026-08-23") + "T00:00:00Z");
  return Math.floor((Date.now() - start) / 86400000);
}

/* Fiecare pagină își parcurge propria listă, în ritmul ei: o pagină cu zece
   întrebări le reia din zece în zece zile, independent de celelalte. */
function pentru(pagina, zi) {
  const ale_ei = pagina.teme.length
    ? toate.filter(x => pagina.teme.includes(x.tema))
    : toate;
  if (!ale_ei.length) return null;
  const i = ((zi % ale_ei.length) + ale_ei.length) % ale_ei.length;
  return ale_ei[i];
}

function compune(p) {
  return p.i + "\n\n" + p.c + "\n\nRăspunsul întreg 👉 " + p.u;
}

async function publica(pagina, p) {
  const r = await fetch(GRAPH + "/" + pagina.id + "/photos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: SITE + p.img,
      caption: compune(p),
      access_token: pagina.token,
    }),
  });
  const raspuns = await r.json();
  if (!r.ok) throw new Error(JSON.stringify(raspuns));
  return raspuns.id;
}

module.exports = async function (req, res) {
  const zi = ziuaCurenta();
  const lista = pagini();
  const proba = req.query && (req.query.proba === "1" || req.query.proba === "da");

  if (!lista.length) {
    return res.status(200).json({
      publicat: false,
      motiv: "Nicio pagină configurată. Se adaugă FB_TOKEN, plus FB_PAGINA_1_ID și _TEME, în setările Vercel.",
      zi,
    });
  }

  const planul = lista.map(pg => {
    const p = pentru(pg, zi);
    return {
      pagina: pg.nume, teme: pg.teme,
      intrebare: p ? p.i : null,
      imagine: p ? SITE + p.img : null,
      mesaj: p ? compune(p) : null,
      _p: p, _pg: pg,
    };
  });

  if (proba) {
    return res.status(200).json({
      proba: true, zi,
      pagini: planul.map(({ _p, _pg, ...restul }) => restul),
    });
  }

  // Programarea Vercel se autentifică singură; în rest cerem secretul.
  const secret = process.env.CRON_SECRET;
  if (!req.headers["x-vercel-cron"] && secret &&
      req.headers["authorization"] !== "Bearer " + secret) {
    return res.status(401).json({ eroare: "Neautorizat" });
  }

  if (process.env.FB_ACTIV !== "da") {
    return res.status(200).json({
      publicat: false,
      motiv: "Publicarea e oprită. Se pornește punând FB_ACTIV=da în setările Vercel.",
      zi, pagini: planul.map(({ _p, _pg, ...restul }) => restul),
    });
  }

  /* O pagină care dă greș nu le oprește pe celelalte. */
  const rezultate = [];
  for (const x of planul) {
    if (!x._p) { rezultate.push({ pagina: x.pagina, sarit: "nicio întrebare pe temele ei" }); continue; }
    try {
      const id = await publica(x._pg, x._p);
      console.log("Publicat pe " + x.pagina + ": " + x._p.i);
      rezultate.push({ pagina: x.pagina, publicat: true, id, intrebare: x._p.i });
    } catch (e) {
      console.error("Eșec pe " + x.pagina + ": " + e.message);
      rezultate.push({ pagina: x.pagina, publicat: false, eroare: e.message });
    }
  }
  const reusite = rezultate.filter(r => r.publicat).length;
  return res.status(reusite ? 200 : 502).json({ zi, rezultate });
};

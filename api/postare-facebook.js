/* Publică zilnic o întrebare pe pagina de Facebook, cu legătură spre răspuns.
   Rulează din programarea Vercel, o dată pe zi. Nu ține nicio evidență:
   postarea se alege după numărul zilei, deci lista se parcurge singură, în
   ordine, și se reia de la capăt după ce se termină. */

const postari = require("../postari-facebook.json");

const GRAPH = "https://graph.facebook.com/v21.0";
const SITE  = process.env.SITE_URL || "https://civilasist.vercel.app";

function aleasaPentruAzi() {
  /* Numărăm de la ziua pornirii, nu de la 1970 — altfel seria ar începe de
     unde nimerește calendarul, iar întrebările puternice, așezate primele,
     s-ar rata. Data se poate schimba din FB_START, în setările Vercel. */
  const start = Date.parse((process.env.FB_START || "2026-08-22") + "T00:00:00Z");
  const zile = Math.floor((Date.now() - start) / 86400000);
  const i = ((zile % postari.length) + postari.length) % postari.length;
  return postari[i];
}

function compune(p) {
  return p.i + "\n\n" + p.c + "\n\nRăspunsul întreg 👉 " + p.u;
}

module.exports = async function (req, res) {
  const proba = req.query && (req.query.proba === "1" || req.query.proba === "da");
  const p = aleasaPentruAzi();
  const mesaj = compune(p);

  // La probă arătăm ce s-ar publica, fără să publicăm nimic.
  if (proba) {
    return res.status(200).json({ proba: true, zi: p.zi, mesaj,
      imagine: SITE + p.img, legatura: p.u });
  }

  // Programarea Vercel se autentifică singură; în rest cerem secretul,
  // ca să nu poată declanșa oricine o postare.
  const secret = process.env.CRON_SECRET;
  const antet = req.headers["authorization"];
  const dinCron = req.headers["x-vercel-cron"];
  if (!dinCron && secret && antet !== "Bearer " + secret) {
    return res.status(401).json({ eroare: "Neautorizat" });
  }

  /* Siguranță: nu publicăm nimic până nu se aprinde comutatorul, chiar dacă
     jetonul e deja pus. Așa, cine adaugă jetonul nu declanșează din greșeală
     o postare publică înainte de a citi textele. */
  if (process.env.FB_ACTIV !== "da") {
    return res.status(200).json({
      publicat: false,
      motiv: "Publicarea e oprită. Se pornește punând FB_ACTIV=da în setările Vercel.",
      zi: p.zi, mesaj
    });
  }

  const PAGE = process.env.FB_PAGE_ID;
  const TOKEN = process.env.FB_PAGE_TOKEN;
  if (!PAGE || !TOKEN) {
    return res.status(500).json({ eroare: "Lipsesc FB_PAGE_ID sau FB_PAGE_TOKEN" });
  }

  /* Postare cu imagine, nu cu legătură. Ajunge la mai multă lume, iar
     întrebarea se citește din fotografie, fără să fie nevoie de clic.
     Facebook aduce singur imaginea de la adresa dată. */
  const r = await fetch(GRAPH + "/" + PAGE + "/photos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: SITE + p.img,
      caption: mesaj,
      access_token: TOKEN,
    }),
  });
  const raspuns = await r.json();

  if (!r.ok) {
    console.error("Facebook a refuzat:", JSON.stringify(raspuns));
    return res.status(502).json({ eroare: "Facebook a refuzat", detaliu: raspuns });
  }
  console.log("Publicat ziua " + p.zi + ": " + p.i);
  return res.status(200).json({ publicat: true, zi: p.zi, id: raspuns.id, intrebare: p.i });
};

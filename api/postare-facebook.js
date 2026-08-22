/* Publică zilnic o întrebare pe pagina de Facebook, cu legătură spre răspuns.
   Rulează din programarea Vercel, o dată pe zi. Nu ține nicio evidență:
   postarea se alege după numărul zilei, deci lista se parcurge singură, în
   ordine, și se reia de la capăt după ce se termină. */

const postari = require("../postari-facebook.json");

const GRAPH = "https://graph.facebook.com/v21.0";

function aleasaPentruAzi() {
  // zile scurse de la 1 ianuarie 1970, în ora României
  const acum = new Date();
  const zile = Math.floor(acum.getTime() / 86400000);
  return postari[zile % postari.length];
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
    return res.status(200).json({ proba: true, zi: p.zi, mesaj, legatura: p.u });
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

  const r = await fetch(GRAPH + "/" + PAGE + "/feed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: mesaj, link: p.u, access_token: TOKEN }),
  });
  const raspuns = await r.json();

  if (!r.ok) {
    console.error("Facebook a refuzat:", JSON.stringify(raspuns));
    return res.status(502).json({ eroare: "Facebook a refuzat", detaliu: raspuns });
  }
  console.log("Publicat ziua " + p.zi + ": " + p.i);
  return res.status(200).json({ publicat: true, zi: p.zi, id: raspuns.id, intrebare: p.i });
};

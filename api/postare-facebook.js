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
const SITE  = process.env.SITE_URL || "https://civilasist.ro";

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

/* Facebook cere ca postarea să vină „ca pagina", nu ca utilizatorul de
   sistem — mai ales la ciorne. Jetonul paginii se cere o dată, cu cel de
   sistem, și se folosește mai departe. Nu se scrie nicăieri și nu apare în
   niciun mesaj de eroare. */
async function jetonPagina(pg) {
  if (pg._jeton) return pg._jeton;
  const r = await fetch(GRAPH + "/" + pg.id +
    "?fields=access_token&access_token=" + encodeURIComponent(pg.token));
  const j = await r.json();
  if (!r.ok || !j.access_token) {
    throw new Error("nu s-a putut obține jetonul paginii" +
      (j.error ? ": " + j.error.message : ""));
  }
  pg._jeton = j.access_token;
  return pg._jeton;
}

/* Calea clasica de video, nu cea de Reels. O pastram ca plasa de siguranta:
   /video_reels cere pages_show_list, pe care jetonul de utilizator de sistem
   nu-l are. Atentie: un video vertical urcat aici NU e un Reel — ajunge in
   feedul de video, iar Facebook il poate arata si in Reels, dar nu garanteaza.
   De aceea nu se foloseste automat; doar la cerere explicita. */
async function publicaVideo(pagina, p, acum, nepublicat) {
  const jeton = await jetonPagina(pagina);
  const corp = {
    file_url: SITE + caleReel(p),
    description: compune(p),
    access_token: jeton,
  };
  if (nepublicat) {
    corp.published = false;
  } else if (!acum) {
    corp.published = false;
    corp.scheduled_publish_time = maineLaOpt();
  }
  const r = await fetch(GRAPH + "/" + pagina.id + "/videos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corp),
  });
  const j = await r.json();
  if (!r.ok || !j.id) throw new Error("video: " + JSON.stringify(j));
  return j.id;
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

/* Mâine la ora 8, în ceasul serverului. Facebook cere între 10 minute și
   6 luni în viitor, deci 24 de ore intră fără discuție. */
function maineLaOpt() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCHours(8, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

/* Nu publicăm pe loc: programăm pentru a doua zi. Postarea apare imediat în
   Business Suite, la programate, unde beneficiarul o poate citi, schimba sau
   șterge. Dacă n-o atinge nimeni, pleacă singură. */
async function publica(pagina, p, acum) {
  const corp = {
    url: SITE + p.img,
    caption: compune(p),
    access_token: await jetonPagina(pagina),
  };
  /* Implicit programăm pe mâine. Cu ?acum=1 se publică pe loc — util când
     vrem o rundă imediată, fără să așteptăm o zi. */
  if (!acum) {
    corp.published = false;
    corp.scheduled_publish_time = maineLaOpt();
  }
  const r = await fetch(GRAPH + "/" + pagina.id + "/photos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corp),
  });
  const raspuns = await r.json();
  if (!r.ok) throw new Error(JSON.stringify(raspuns));
  return raspuns.id;
}

/* --- Reels ---------------------------------------------------------------

   Aceeași întrebare, același material, dar pe verticală. Fișierul se cheamă
   ca fotografia postării: /imagini/postari/04.jpg -> /reels/04.mp4. Dacă nu
   există încă, pagina primește doar postarea cu fotografie, fără Reel — nu e
   o eroare, doar n-a fost generat.

   Publicarea are trei faze (documentația Meta, Reels Publishing API):
     1. start   — Facebook deschide o sesiune și dă video_id
     2. upload  — nu trecem octeții prin funcție: trimitem antetul file_url,
                  iar Facebook aduce singur fișierul de pe site
     3. finish  — PUBLISHED pe loc, ori SCHEDULED pentru mâine

   Reels acceptă și programare, deci se poartă la fel ca postările: implicit
   pe mâine, cu ?acum=1 pe loc. */

const VERSIUNE = GRAPH.split("/").pop();
const RUPLOAD  = "https://rupload.facebook.com/video-upload/" + VERSIUNE;

function caleReel(p) {
  const nume = p.img.split("/").pop().replace(/\.jpe?g$/i, ".mp4");
  return "/reels/" + nume;
}

/* Ne uităm dacă fișierul e chiar acolo înainte să deranjăm Facebook. */
async function areReel(p) {
  try {
    const r = await fetch(SITE + caleReel(p), { method: "HEAD" });
    return r.ok;
  } catch (e) {
    return false;
  }
}

async function publicaReel(pagina, p, acum, stare) {
  const jeton = await jetonPagina(pagina);
  const url = SITE + caleReel(p);

  const r1 = await fetch(GRAPH + "/" + pagina.id + "/video_reels", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ upload_phase: "start", access_token: jeton }),
  });
  const start = await r1.json();
  if (!r1.ok || !start.video_id) {
    throw new Error("faza start: " + JSON.stringify(start));
  }

  const r2 = await fetch(RUPLOAD + "/" + start.video_id, {
    method: "POST",
    headers: { Authorization: "OAuth " + jeton, file_url: url },
  });
  const incarcat = await r2.json().catch(() => ({}));
  if (!r2.ok || incarcat.success === false) {
    throw new Error("faza upload: " + JSON.stringify(incarcat));
  }

  const final = {
    upload_phase: "finish",
    video_id: start.video_id,
    description: compune(p),
    video_state: stare || (acum ? "PUBLISHED" : "SCHEDULED"),
    access_token: jeton,
  };
  if (final.video_state === "SCHEDULED") final.scheduled_publish_time = maineLaOpt();

  const r3 = await fetch(GRAPH + "/" + pagina.id + "/video_reels", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(final),
  });
  const gata = await r3.json();
  if (!r3.ok || gata.success === false) {
    throw new Error("faza finish: " + JSON.stringify(gata));
  }
  return start.video_id;
}

module.exports = async function (req, res) {
  const zi = ziuaCurenta();
  const lista = pagini();
  const proba = req.query && (req.query.proba === "1" || req.query.proba === "da");
  const acum  = req.query && (req.query.acum === "1" || req.query.acum === "da");

  if (!lista.length) {
    return res.status(200).json({
      publicat: false,
      motiv: "Nicio pagină configurată. Se adaugă FB_TOKEN, plus FB_PAGINA_1_ID și _TEME, în setările Vercel.",
      zi,
    });
  }

  const planul = lista.map(pg => {
    const p = pentru(pg, zi + 1);   /* se publică mâine */
    return {
      pagina: pg.nume, teme: pg.teme,
      intrebare: p ? p.i : null,
      imagine: p ? SITE + p.img : null,
      mesaj: p ? compune(p) : null,
      _p: p, _pg: pg,
    };
  });

  /* Verificare: întreabă Facebook dacă jetonul chiar deschide fiecare pagină,
     fără să publice nimic. Mai bine aflăm acum decât la 8 dimineața. */
  if (req.query && (req.query.verifica === "1" || req.query.verifica === "da")) {
    const stare = [];
    for (const pg of lista) {
      try {
        const r = await fetch(GRAPH + "/" + pg.id +
          "?fields=name,id&access_token=" + encodeURIComponent(pg.token));
        const j = await r.json();
        stare.push(r.ok
          ? { pagina: pg.nume, acces: true, numeReal: j.name, id: j.id }
          : { pagina: pg.nume, acces: false, motiv: (j.error && j.error.message) || "necunoscut" });
      } catch (e) {
        stare.push({ pagina: pg.nume, acces: false, motiv: e.message });
      }
    }
    return res.status(stare.every(x => x.acces) ? 200 : 502).json({ verificare: true, pagini: stare });
  }

  /* Postare de probă, nepublicată: fotografia se încarcă ascunsă, apoi se
     face o ciornă cu ea. Nu apare în feed și n-o vede decât administratorul
     paginii, în Meta Business Suite, la conținut nepublicat. Se șterge de
     acolo. Nu ține cont de FB_ACTIV, fiindcă nimic nu devine public. */
  if (req.query && req.query.test) {
    const care = String(req.query.test);
    const pg = lista.find(x => x.nume === care) || lista[parseInt(care, 10) - 1] || lista[0];
    const p = pentru(pg, ziuaCurenta());
    if (!p) return res.status(400).json({ eroare: "Pagina nu are nicio întrebare pe temele ei" });
    try {
      const rf = await fetch(GRAPH + "/" + pg.id + "/photos", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: SITE + p.img, published: false, access_token: await jetonPagina(pg) }),
      });
      const foto = await rf.json();
      if (!rf.ok) throw new Error("încărcarea fotografiei: " + JSON.stringify(foto));

      const rp = await fetch(GRAPH + "/" + pg.id + "/feed", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: compune(p),
          attached_media: [{ media_fbid: foto.id }],
          published: false,
          access_token: await jetonPagina(pg),
        }),
      });
      const post = await rp.json();
      if (!rp.ok) throw new Error("crearea ciornei: " + JSON.stringify(post));

      return res.status(200).json({
        test: true, nepublicat: true, pagina: pg.nume,
        idCiorna: post.id, intrebare: p.i,
        unde: "Meta Business Suite → Conținut → postări nepublicate, pe pagina " + pg.nume,
      });
    } catch (e) {
      return res.status(502).json({ test: true, pagina: pg.nume, eroare: e.message });
    }
  }

  /* Ce permisiuni are jetonul, de fapt. Reels cere pages_show_list,
     pages_read_engagement și pages_manage_posts; postarea cu fotografie merge
     și fără prima. Jetonul nu apare în răspuns, doar lista de drepturi. */
  if (req.query && (req.query.permisiuni === "1" || req.query.permisiuni === "da")) {
    const NECESARE = ["pages_show_list", "pages_read_engagement", "pages_manage_posts"];
    const raport = [];
    for (const pg of lista) {
      try {
        const r = await fetch(GRAPH + "/debug_token?input_token=" +
          encodeURIComponent(pg.token) + "&access_token=" + encodeURIComponent(pg.token));
        const j = await r.json();
        const are = (j.data && j.data.scopes) || [];
        raport.push({
          pagina: pg.nume,
          tip: (j.data && j.data.type) || "?",
          are: are,
          lipsesc: NECESARE.filter(x => !are.includes(x)),
          potReels: NECESARE.every(x => are.includes(x)),
        });
      } catch (e) {
        raport.push({ pagina: pg.nume, eroare: e.message });
      }
    }
    return res.status(200).json({ permisiuni: true, necesarePentruReels: NECESARE, pagini: raport });
  }

  /* Reel de probă, ciornă: apare în Business Suite la conținut nepublicat,
     nu în feed. Nu ține cont de FB_ACTIV, fiindcă nimic nu devine public. */
  if (req.query && req.query.reeltest) {
    const care = String(req.query.reeltest);
    const pg = lista.find(x => x.nume === care) || lista[parseInt(care, 10) - 1] || lista[0];
    const p = pentru(pg, zi + 1);
    if (!p) return res.status(400).json({ eroare: "Pagina nu are nicio întrebare pe temele ei" });
    if (!(await areReel(p))) {
      return res.status(400).json({
        eroare: "Reel-ul nu e generat pentru întrebarea asta",
        asteptat: SITE + caleReel(p), intrebare: p.i,
      });
    }
    try {
      const id = await publicaReel(pg, p, false, "DRAFT");
      return res.status(200).json({
        reeltest: true, nepublicat: true, pagina: pg.nume,
        idVideo: id, intrebare: p.i, fisier: SITE + caleReel(p),
        unde: "Meta Business Suite → Conținut → nepublicate, pe pagina " + pg.nume,
      });
    } catch (e) {
      return res.status(502).json({ reeltest: true, pagina: pg.nume, eroare: e.message });
    }
  }

  /* Probă pe calea clasică de video: ciornă, deci nimic public. Ne spune dacă
     permisiunea care lipsește blochează numai Reels sau și video-ul obișnuit.
     Nu ține cont de FB_ACTIV, fiindcă nimic nu devine public. */
  if (req.query && req.query.videotest) {
    const care = String(req.query.videotest);
    const pg = lista.find(x => x.nume === care) || lista[parseInt(care, 10) - 1] || lista[0];
    const p = pentru(pg, zi + 1);
    if (!p) return res.status(400).json({ eroare: "Pagina nu are nicio întrebare pe temele ei" });
    if (!(await areReel(p))) {
      return res.status(400).json({ eroare: "Fișierul video nu e generat", asteptat: SITE + caleReel(p) });
    }
    try {
      const id = await publicaVideo(pg, p, false, true);
      return res.status(200).json({
        videotest: true, nepublicat: true, cale: "/videos (nu /video_reels)",
        pagina: pg.nume, idVideo: id, intrebare: p.i, fisier: SITE + caleReel(p),
        atentie: "Un video vertical urcat aici NU e un Reel. Facebook îl poate arăta în Reels, dar nu garantează.",
        unde: "Meta Business Suite → Conținut → nepublicate, pe pagina " + pg.nume,
      });
    } catch (e) {
      return res.status(502).json({ videotest: true, pagina: pg.nume, eroare: e.message });
    }
  }

  /* Starea comutatoarelor, ca sa se vada dintr-o privire daca postarile sunt
     pornite sau oprite. Nu intoarce nicio valoare secreta, doar daca exista. */
  if (req.query && (req.query.stare === "1" || req.query.stare === "da")) {
    return res.status(200).json({
      stare: true,
      zi,
      publicareaEPornita: process.env.FB_ACTIV === "da",
      comutator: "FB_ACTIV (=da porneste, orice altceva opreste)",
      cereSecret: Boolean(process.env.CRON_SECRET),
      /* incuiat = nimeni nu poate publica, nici din greseala: calea de postare
         cere Authorization: Bearer <CRON_SECRET>, iar secretul nu e pus. */
      incuiat: !process.env.CRON_SECRET,
      pagini: lista.map(pg => ({ pagina: pg.nume, teme: pg.teme, jetonPropriu: Boolean(process.env["FB_PAGINA_" + (lista.indexOf(pg) + 1) + "_TOKEN"]) })),
      urmatoarea: planul.map(x => ({ pagina: x.pagina, intrebare: x.intrebare })),
    });
  }

  /* Ce e pe pagini: ultimele postari publicate si, mai important, cele care
     stau programate. Cand s-a oprit ceasul, o postare deja programata pleaca
     singura la ora ei - deci "oprit" nu inseamna nimic pana nu o vedem. */
  if (req.query && (req.query.ultimele === "1" || req.query.ultimele === "da")) {
    const raport = [];
    for (const pg of lista) {
      const rand = { pagina: pg.nume };
      try {
        const jeton = await jetonPagina(pg);
        const cere = async (ce, cate) => {
          const r = await fetch(GRAPH + "/" + pg.id + "/" + ce +
            "?fields=id,created_time,scheduled_publish_time,message&limit=" + cate +
            "&access_token=" + encodeURIComponent(jeton));
          const j = await r.json();
          if (!r.ok) return { eroare: (j.error && j.error.message) || "necunoscut" };
          return (j.data || []).map(x => ({
            id: x.id,
            facuta: x.created_time,
            pleaca: x.scheduled_publish_time
              ? new Date(x.scheduled_publish_time * 1000).toISOString()
              : null,
            text: (x.message || "").split(/\r?\n/)[0].slice(0, 60),
          }));
        };
        rand.publicate = await cere("published_posts", 4);
        rand.programate = await cere("scheduled_posts", 50);
        if (Array.isArray(rand.programate)) rand.cateProgramate = rand.programate.length;
      } catch (e) {
        rand.eroare = e.message;
      }
      raport.push(rand);
    }
    return res.status(200).json({ ultimele: true, pagini: raport });
  }

  if (proba) {
    for (const x of planul) x.reel = x._p && (await areReel(x._p)) ? SITE + caleReel(x._p) : null;
    return res.status(200).json({
      proba: true, zi,
      pagini: planul.map(({ _p, _pg, ...restul }) => restul),
    });
  }

  /* Publicarea cere strict secretul. Programarea Vercel il trimite singura,
     ca antet Authorization, cand CRON_SECRET e pus in setari.

     Nu ne mai uitam la antetul x-vercel-cron: el vine de la client, deci
     putea fi imitat de oricine. Iar cand CRON_SECRET lipsea, conditia se
     scurtcircuita si adresa publica pe cele trei pagini fara nicio parola.
     Acum, fara secret pus, publicarea e inchisa pentru toata lumea. */
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return res.status(503).json({
      publicat: false,
      motiv: "Publicarea e incuiata: CRON_SECRET nu e pus in setarile Vercel.",
      cumSePorneste: "Adaugati CRON_SECRET in Vercel (o parola lunga, aleasa de dumneavoastra) si repuneti programarea in vercel.json.",
      zi,
    });
  }
  if (req.headers["authorization"] !== "Bearer " + secret) {
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
    const r = { pagina: x.pagina, intrebare: x._p.i };
    try {
      r.id = await publica(x._pg, x._p, acum);
      r.programat = !acum;
      r.publicat = acum;
      console.log((acum ? "Publicat pe " : "Programat pe ") + x.pagina + ": " + x._p.i);
    } catch (e) {
      console.error("Eșec pe " + x.pagina + ": " + e.message);
      r.publicat = false;
      r.eroare = e.message;
    }

    /* Reel-ul merge separat: dacă el cade, postarea cu fotografie rămâne. */
    if (await areReel(x._p)) {
      try {
        r.idReel = await publicaReel(x._pg, x._p, acum);
        console.log("Reel " + (acum ? "publicat" : "programat") + " pe " + x.pagina);
      } catch (e) {
        console.error("Reel eșuat pe " + x.pagina + ": " + e.message);
        r.eroareReel = e.message;
      }
    } else {
      r.reel = "nu e generat";
    }
    rezultate.push(r);
  }
  const reusite = rezultate.filter(r => r.programat || r.publicat).length;
  return res.status(reusite ? 200 : 502).json({ zi, rezultate });
};

# CivilAsist.ro

Site static — doar HTML, CSS și două scripturi mici. Fără pas de compilare, fără
dependențe. Orice fișier se deschide direct în browser.

**Adresa publică:** https://civilasist.ro
**Depozitul:** github.com/HugoBross1/civilasist
**Găzduirea:** Vercel, proiectul `civilasist`, contul `hugo1-f91d`

---

## Cum se lucrează

Orice modificare salvată și trimisă pe ramura `main` se publică singură, în
câteva zeci de secunde:

```bash
git add -A
git commit -m "ce am schimbat"
git push
```

Se trimite doar ce s-a schimbat, deci fotografiile nu se reîncarcă de fiecare
dată. Fiecare versiune rămâne în istoric — dacă ceva iese prost, se revine cu
un pas: `git revert <commit>`.

### Ca să continuați pe alt calculator

```bash
git clone https://github.com/HugoBross1/civilasist.git
```

Atât. Jetoanele și variabilele stau în Vercel, nu în depozit, deci nu se copiază
nimic sensibil. Pentru fotografiile-sursă, montați Google Drive — folderele
`4 Rapoarte drone/anunturi` și `17 Claude/site/imagini`.

---

## Structura

```
index.html                  pagina principală
despre.html                 despre echipă și datele societății
confidentialitate.html      politica de confidențialitate
style.css                   tot stilul, cu paleta la început
favicon.svg                 emblema din bara browserului

servicii/                   12 pagini de serviciu
ghiduri/                    11 ghiduri + cuprins („Cum se face")
imagini/                    fotografiile din pagini
  carduri/                  miniaturi pentru prima pagină
  postari/                  58 de imagini pentru Facebook
fonturi/                    Inter și Space Grotesk, găzduite local

cautare.js  cautare.json    căutarea din site, fără server
banda.js                    banda cu întrebări care se derulează
api/postare-facebook.js     publicarea zilnică pe Facebook
postari-facebook.json       cele 58 de postări
vercel.json                 programarea zilnică, ora 8
robots.txt sitemap.xml llms.txt
```

---

## Domeniul

`civilasist.ro`, înregistrat la ROTLD pe 22 august 2026, expiră 22 august 2027.
Administrare la rotld.ro/domadmin, cu numele domeniului și parola de
administrare. Orice schimbare acolo cere confirmare printr-un link trimis pe
`ing.radu.branici@gmail.com`, valabil 36 de ore.

Nameserverele sunt ale Vercel: `ns1.vercel-dns.com` și `ns2.vercel-dns.com`.
**DNS-ul se administrează deci din Vercel, nu de la ROTLD** — inclusiv
înregistrările MX, când se va cumpăra găzduirea de e-mail.

`www.civilasist.ro` redirectează permanent (308) către domeniul simplu, iar
`http` către `https`. Forma canonică e cea fără `www`.

## Marca

| | |
|---|---|
| Nume | CivilAsist.ro |
| Slogan | Inspectăm. Proiectăm. Construim. |
| Titluri | Space Grotesk, spațiere strânsă |
| Text | Inter |
| Albastru | `#1e6bb8` — accentul principal, ca emblema |
| Portocaliu | `#f5851f` — accent secundar; pentru **text** se folosește `#ab5d15`, altfel nu are contrast destul |
| Negru-cenușiu | `#0e0e12` — bara de sus, subsolul, secțiunile închise |

Culorile sunt definite o singură dată, la începutul lui `style.css`.

**Fonturile sunt găzduite local, intenționat.** Nu se pun înapoi de la Google:
ar trimite adresa IP a fiecărui vizitator către Google înainte de orice
consimțământ.

---

## Banda cu întrebări

`banda.js`. Se mișcă singură, se oprește la hover, se trage cu mouse-ul sau cu
degetul.

**Deschiderea întrebării o face scriptul, nu clicul nativ. Nu scoateți asta.**
Când banda e trasă, pastilele alunecă sub cursor, iar Chrome pune clicul pe cel
mai apropiat strămoș comun între locul apăsării și cel al eliberării — adică pe
bandă, nu pe legătură. Rezultatul era că întrebarea nu se deschidea niciodată
dacă mâna se mișca puțin. De aceea reținem pastila apăsată la `pointerdown` și
navigăm noi la `pointerup`, dacă mișcarea a fost sub `PRAG` (14 px). Peste
prag e tragere și nu se deschide nimic.

## Societatea

INDUSTRIAL IMOBIL S.R.L. · J37/713/2020 · CUI 43308030 (neplătitoare de TVA)
Sediul social: mun. Huși, jud. Vaslui · Birou: Șos. Huși–Stănilești nr. 23

Verificat în registrul ANAF. **CUI-ul se scrie fără prefixul RO** — societatea
nu e plătitoare de TVA.

Datele apar în subsolul tuturor paginilor, cerute de Legea 31/1990 art. 74 și
de Legea 365/2002.

---

## E-mail

`contact@civilasist.ro`, la **Zoho Mail**, planul Forever Free: un utilizator,
5 GB, centru de date european (zoho.eu). Cont de organizație „CivilAsist.ro",
administrare la mailadmin.zoho.eu, citire la mail.zoho.eu.

Aceeași adresă e și contul de super-administrator al organizației.

**Planul gratuit nu are IMAP, POP sau SMTP.** Se citește doar din interfața web
Zoho și din aplicația lor de telefon — nu se poate lega în Outlook sau în
aplicația Gmail.

Înregistrările DNS, toate în panoul Vercel:

| Tip | Nume | Valoare | Prioritate |
|---|---|---|---|
| MX | @ | mx.zoho.eu | 10 |
| MX | @ | mx2.zoho.eu | 20 |
| MX | @ | mx3.zoho.eu | 50 |
| TXT | @ | `v=spf1 include:zohomail.eu ~all` | — |
| TXT | `zmail._domainkey` | cheia DKIM, 234 de caractere | — |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:contact@civilasist.ro` | — |
| TXT | @ | `zoho-verification=zb62135549.zmverify.zoho.eu` | — |

DMARC e pe `p=none`, adică doar raportează, nu respinge. După câteva săptămâni,
dacă rapoartele arată curat, se poate strânge la `p=quarantine`.

## Google Search Console

Proprietate de tip **domeniu** pentru `civilasist.ro` — acoperă și `www` și
ambele protocoale. Confirmată prin TXT `google-site-verification=...`, tot în
panoul Vercel. **Nu ștergeți acea înregistrare**, altfel se pierde confirmarea.

Sitemap trimis: `https://civilasist.ro/sitemap.xml`, 26 de adrese.

## Confidențialitate

**Site-ul nu pune niciun cookie.** Nici propriu, nici al altcuiva. De aceea nu
are banner de consimțământ — nu are pentru ce.

Statisticile sunt Vercel Web Analytics: agregate, fără cookie-uri, fără
identificarea persoanelor. Se văd la vercel.com → `civilasist` → Analytics.

Dacă se adaugă vreodată Google Analytics, pixel de Facebook sau caseta
încorporată de Facebook, **toate afirmațiile de mai sus devin false** și trebuie
construit bannerul de consimțământ și rescrisă politica.

---

## Publicarea pe Facebook

Rulează zilnic la ora 8, din `vercel.json`. Alege câte o întrebare pentru
fiecare pagină, după temele ei, și o publică sub formă de fotografie cu legendă.

### Paginile

| Pagina | Identificator | Teme | Întrebări |
|---|---|---|---|
| Proiecte Case Husi | `113574381706396` | autorizare, teren | 43 |
| Diriginte de Santier Husi | `1197148686823384` | executie | 10 |
| Verificari Centrale Termice - VTP - Husi | `706458899219948` | iscir | 5 |

Temele sunt scrise în `postari-facebook.json`, câmpul `tema`:
`autorizare` (33), `executie` (10), `teren` (10), `iscir` (5).

### Configurarea din Vercel

Settings → Environment Variables:

```
FB_TOKEN            jetonul utilizatorului de sistem (Sensitive)
FB_PAGINA_1_ID      113574381706396
FB_PAGINA_1_NUME    Proiecte Case Husi
FB_PAGINA_1_TEME    autorizare,teren
FB_PAGINA_2_ID      1197148686823384
FB_PAGINA_2_NUME    Diriginte de Santier Husi
FB_PAGINA_2_TEME    executie
FB_PAGINA_3_ID      706458899219948
FB_PAGINA_3_NUME    Verificari Centrale Termice VTP
FB_PAGINA_3_TEME    iscir
FB_START            data de la care se numără seria
FB_ACTIV            da   <- NU E PUS. Fără el nu se publică nimic.
```

**Variabilele intră în funcțiune doar după Redeploy.**

### Pe partea Facebook

- Aplicația: **Publicare Pagini Husi**, App ID `2061243851473221`, în Development
- Caz de utilizare: *Manage everything on your Page*
- Portofoliul de business: **Radu** (`9380150172079861`)
- Utilizator de sistem: **Postare automata** (`61593731698968`), rol Employee,
  cu cele trei pagini (doar permisiunea *Conținut*) și aplicația (*Dezvoltă*)
- Jetonul e generat cu expirare **Niciodată**, permisiuni `pages_manage_posts`
  și `pages_read_engagement`

Codul cere singur jetonul **paginii** pornind de la cel de sistem — Facebook
refuză ciornele trimise altfel.

**Programarea zilnică e OPRITĂ** (25 august 2026, la cererea beneficiarului).
`vercel.json` e gol. Ca să repornească postările automate, se pune înapoi:

```json
{
  "crons": [
    { "path": "/api/postare-facebook", "schedule": "0 8 * * *" }
  ]
}
```

Atenție: nu adăugați chei proprii în `vercel.json` — Vercel are schemă strictă
și deployment-ul pică cu eroare. Comentariile se scriu aici, nu acolo.

### Adrese de control

| | |
|---|---|
| `?proba=1` | arată ce s-ar publica azi, pe fiecare pagină. Nu publică |
| `?verifica=1` | întreabă Facebook dacă jetonul deschide fiecare pagină |
| `?test=1` | creează o **ciornă nepublicată** pe pagina 1 (`?test=2`, `?test=3`) |

Ciornele apar în Business Suite → Conținut → **Postări cu reclame**, nu la
„Schițe". Se șterg de acolo.

### Imaginile

1080×1080, generate din fotografiile proprii, cu întrebarea scrisă peste.
Marginea e de 11% din lățime — nu o micșorați, altfel textul se ciuntește în
previzualizările care taie lateral.

---

## Ce a mai rămas de făcut

### Blochează lansarea

1. **Găzduirea nu e conformă.** Planul Hobby al Vercel e, prin termenii lor,
   **numai pentru uz personal, necomercial** — iar „promovarea vânzării unui
   serviciu" e primul exemplu de uz comercial din lista lor. Site-ul e public
   pe Hobby, cu acordul beneficiarului, urmând să treacă pe Pro (20 $/lună).
   Riscul până atunci: Vercel poate suspenda proiectul. Alternativa gratuită
   și permisă comercial e Cloudflare Pages — ar cere rescrierea funcției de
   postare pe Facebook ca Worker.
2. **Formularul de contact trebuie activat o singură dată.** Trimite prin
   formsubmit.co către `contact@civilasist.ro`. La prima trimitere, FormSubmit
   expediază un mesaj cu link de activare în cutia Zoho. Până se apasă acel
   link, **mesajele din formular nu ajung nicăieri.**

### Profilul de companie Google

Există și e verificat. Cod: `09543091817909257320`. Se administrează de la
business.google.com/locations sau direct din căutarea Google, cu contul
radu@jciiasi.ro.

| | |
|---|---|
| Nume | CivilAsist.ro (redenumit din „PROIECTE CASE HUSI") |
| Categorii | Inginer în inginerie structurală (principală), Proiectant, Inspector de clădiri |
| Adresă | Șos. Huși–Stănilești nr. 23, 735100 Huși |
| Zonă de servicii | Iași, Vaslui |
| Program | luni–vineri 08:00–18:00; sâmbătă și duminică închis |
| Site | https://civilasist.ro/ |
| Recenzii | 2, medie 5,0 |

Sigla, fotografia de copertă și zece fotografii din lucrări proprii sunt
încărcate (drone, armături, săpături, proba de tasare, termografie, examinare
vizuală a unei suduri). Google le verifică înainte să le arate — până atunci
apar cu eticheta „ÎN AȘTEPTARE".

**De curățat:** au rămas în galerie imaginile vechi ale profilului „Proiecte
Case Husi" — randări de casă cu ștampilă străină („ID 26602"), un plan cu
inscripția „Modify this plan" și o schemă de șarpantă cu text în rusă. Nu sunt
fotografii proprii și contrazic regula stabilită. Se șterg din aceeași galerie,
cu coșul din colțul fiecărei imagini.

Când domeniul e legat, adresa site-ului din profil se schimbă în
`https://civilasist.ro`.

### Profilul WhatsApp Business

Numărul: +40 744 921 358. Se editează din web.whatsapp.com (după conectarea
telefonului) → **Instrumente pentru companii → Profil de companie**, sau din
aplicația de pe telefon.

Actualizat: descrierea (250 de caractere), programul (luni–vineri 08:00–18:00,
sâmbătă și duminică închis) și adresa site-ului. Categoriile erau deja bune:
Construction Company, Structural Engineer.

**Numele și adresa se schimbă doar din aplicația de pe telefon** — pe web sunt
doar de citit. Numele e încă „Radu Branici"; ar trebui „CivilAsist.ro".
Atenție, numărul de schimbări ale numelui e limitat.

**E-mailul din profil e `contact@civilasist.ro` și nu există.** Cine scrie
acolo nu primește răspuns și nici nu află de ce.

Site-ul din profil e `https://civilasist.ro`.

### Conținut

- **Lucrări** — secțiunea a fost scoasă, era goală. Fotografiile există (hala
  arcuită, casa A-frame, structura pe placă, amenajarea interioară). Trebuie:
  denumire, localitate, an și rol, pentru trei lucrări.
- **Prețuri orientative** — „cât costă" e prima întrebare din orice meserie.
- **Încă 100 de întrebări**, cerute de beneficiar. Nevoia e clară: vreo 40 pe
  execuție și dirigenție, vreo 40 pe centrale termice și ISCIR. Paginile 2 și 3
  au acum prea puține și se repetă la 10, respectiv 5 zile.

### Tehnic

- **Fonturile cântăresc 471 KB** — de douăzeci de ori cât HTML-ul. Se pot tăia
  la vreo 80 KB păstrând doar literele folosite efectiv.
- Fotografia din antet, 128 KB, se poate duce la vreo 70 fără diferență vizibilă.
- Două salturi în ierarhia titlurilor: pe prima pagină și la Proiectare.

---

## Reguli de conținut, stabilite de beneficiar

- **Numai fotografii proprii.** Nimic luat de pe internet, oricât de bine ar
  arăta. Mai multe propuneri au fost respinse pe motivul ăsta.
- **Fără numere de autorizație și fără valabilități.** Se spune doar că echipa
  are operatorul autorizat.
- **Fără date personale ale clienților** în fotografii — numele beneficiarului
  de pe o planșă se acoperă înainte de publicare.
- Marca afișată e CivilAsist.ro; societatea apare doar în subsol și în politică.

---

## De verificat înainte de a scoate `noindex`

Descrierile atribuțiilor și cele 11 ghiduri sunt scrise pe baza cadrului legal
general — în special Legea 50/1991 și Legea 10/1995 — **nu copiate din textul
în vigoare**. Sunt corecte ca sens, dar prescripțiile se modifică, iar
răspunderea pentru ce scrie pe site este a beneficiarului. Fiecare ghid are o
notă care spune că e orientativ.

Autorizările au fost confirmate de beneficiar: pilot acreditat AACR, dronă
înmatriculată, operatori autorizați, operator RSVTI cu legitimație nouă.

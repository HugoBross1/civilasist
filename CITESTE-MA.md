# CivilAsist.ro — cum funcționează site-ul

Site static: doar HTML și CSS, fără pas de compilare și fără dependențe. Orice fișier se poate
deschide direct în browser.

## Structura

```
site/
  index.html                          pagina principală
  style.css                           stilul comun, cu toate culorile mărcii
  favicon.svg                         emblema din bara browserului
  imagini/                            fotografiile din antetul paginilor
    carduri/                          aceleași fotografii, micșorate pentru pagina principală
  servicii/
    proiectare.html                   proiectare
    dirigentie-santier.html           dirigenție de șantier (I.S.C.)
    asistenta-tehnica.html            asistență tehnică, supraveghere și RTE
    rsvti.html                        RSVTI (ISCIR)
    rvt.html                          responsabil cu verificarea tehnică (ISCIR)
    management-proiect.html           management de proiect
    cartea-tehnica.html               cartea tehnică a construcției
    termografie.html                  inspecție termografică de la sol
    inspectie-drone.html              inspecție și măsurători cu drona
    ofertare-seap.html                ofertare SEAP și devize
    certificat-energetic.html         certificat de performanță energetică
```

## Cum se publică

Site-ul e legat la Vercel prin depozitul **github.com/HugoBross1/civilasist**.
Orice modificare salvată și încărcată pe ramura `main` se publică singură, în câteva secunde:

```bash
git add -A
git commit -m "ce am schimbat"
git push
```

Adresa publică: **https://civilasist.vercel.app**

Se trimite doar ce s-a schimbat, deci fotografiile nu se reîncarcă de fiecare dată. Fiecare
versiune rămâne în istoric — dacă ceva iese prost, se revine cu un pas.

## Culorile mărcii

Sunt definite o singură dată, la începutul lui `style.css`. Schimbi acolo și se schimbă peste tot.

| Variabilă | Valoare | Unde apare |
|---|---|---|
| `--brand` / `--accent` | `#1f6fc4` | butoane, accente, inelul emblemei |
| `--brand-dark` | `#14315e` | discul interior al emblemei |
| `--header` / `--bg-deep` | `#102a4f` | bara de navigație și subsolul |

Emblema stă ca imagine de fundal în regula `.logo-badge`, o singură dată pentru tot site-ul.

## Ce mai e de completat

Textul rămas de scris apare **evidențiat cu galben** în browser — sunt marcajele dintre paranteze
drepte, `[așa]`. Au mai rămas:

- cele trei lucrări din secțiunea **Lucrări** (denumire, localitate, an, rolul avut);
- paragraful din **Despre**, despre cum lucrați în concret.

Când nu mai există niciun marcaj, se șterge regula `.todo` de la finalul lui `style.css` și se
scoate `<meta name="robots" content="noindex">` din capul fiecărei pagini — abia atunci site-ul
devine vizibil în căutări.

## Fotografiile

Fiecare pagină de serviciu are fotografia ei în antet, iar aceeași fotografie apare, micșorată,
pe cardul din pagina principală. Miniaturile din `imagini/carduri` se generează la 420&nbsp;px
lățime — pagina principală încarcă 183&nbsp;KB în loc de 310&nbsp;KB.

Ofertarea SEAP și certificatul energetic n-au fotografie; cardurile lor au rămas cu ilustrația
desenată. Dacă apar fotografii și pentru ele, se pun la fel ca celelalte.

**Nu puneți `loading="lazy"`** pe imaginile cardurilor: grila de servicii e conținutul principal
al paginii, iar în unele randări atributul lăsa cardurile goale.

## Formularul de contact

Merge prin [FormSubmit](https://formsubmit.co) — gratuit, fără cont și fără server. Trimite către
`contact@civilasist.ro`.

**La prima trimitere**, FormSubmit cere o confirmare: completați o dată formularul de pe site,
apoi deschideți cutia și dați clic pe linkul primit. Până atunci **formularele nu livrează nimic**.

## De verificat înainte de a scoate site-ul din `noindex`

Descrierile atribuțiilor — diriginte de șantier, RSVTI, RVT, RTE, verificator de proiecte — sunt
scrise pe baza cunoștințelor generale despre aceste roluri, **nu copiate din textul legal în
vigoare**. Sunt corecte ca sens, dar prescripțiile tehnice se modifică, iar răspunderea pentru ce
scrie pe site este a dumneavoastră. Citiți-le o dată, cu atenție la:

- enumerarea atribuțiilor dirigintelui de șantier;
- lista instalațiilor aflate sub incidența ISCIR;
- delimitarea dintre RSVTI și RVT;
- afirmația că operatorul de drone este înregistrat la AACR și pilotul are certificat de
  competență — trebuie să fie adevărată la data publicării;
- afirmația că în echipă există auditor energetic atestat.

## Ce nu are site-ul încă

- **Politică de confidențialitate.** Formularul colectează date personale, deci este necesară
  înainte de publicare.
- Domeniul propriu `civilasist.ro` nu este încă legat.
- Statistici de trafic.

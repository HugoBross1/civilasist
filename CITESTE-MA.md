# Site personal — instrucțiuni

## Structura

```
site/
  index.html                          pagina principală, cu toate secțiunile
  style.css                           stilul comun pentru toate paginile
  servicii/
    asistenta-tehnica.html            asistență tehnică și supraveghere de șantier
    proiectare.html                   proiectare
    dirigentie-santier.html           dirigenție de șantier (I.S.C.)
    rsvti.html                        RSVTI (ISCIR)
    rvt.html                          responsabil cu verificarea tehnică (ISCIR)
    management-proiect.html           management de proiect
  imagini/                            aici pui fotografiile
```

## Cum îl vezi

Dublu-click pe `index.html`. Se deschide în browser, fără server și fără instalări.

## Ce trebuie completat

Tot ce e scris între paranteze drepte — `[așa]` — este text de înlocuit. Apare **evidențiat cu
galben** în browser, ca să nu-ți scape nimic.

Ordinea recomandată:

1. **Numele** — apare în bara de sus și în subsol, pe fiecare pagină. Fiind în 6 fișiere, cel mai
   rapid e o căutare-și-înlocuire `[Nume Prenume]` peste tot folderul.
2. **Numerele de autorizație** — în secțiunea Calificări din `index.html` și în capul fiecărei
   pagini de specialitate. La dirigenție trebuie și **domeniile** de autorizare.
3. **Datele de contact** — telefon, zonă, program.
4. **Fotografiile** — le pui în `imagini/` și înlocuiești blocul
   `<div class="thumb">...</div>` cu `<img src="imagini/nume.jpg" alt="descriere">`.

După ce ai terminat, șterge regula `.todo` de la finalul lui `style.css` — dispare evidențierea
galbenă. Cât timp regula e activă, orice placeholder rămas se vede imediat.

## Verifică textele juridice

Descrierile atribuțiilor de diriginte de șantier, RSVTI și RVT sunt scrise pe baza cunoștințelor
mele generale despre aceste roluri, **nu copiate din textul legal în vigoare**. Sunt corecte ca
sens, dar înainte de publicare citește-le tu — tu ești cel care răspunde pentru ce scrie acolo, și
prescripțiile tehnice se modifică.

Verifică în special:
- enumerarea atribuțiilor dirigintelui de șantier;
- lista instalațiilor care intră sub incidența ISCIR;
- delimitarea dintre RSVTI și RVT.

## Formularul de contact

Folosește [FormSubmit](https://formsubmit.co) — gratuit, fără cont, fără server. La **prima**
trimitere primești un e-mail de confirmare; dai click o dată pe link și de atunci mesajele ajung
în inbox.

Destinatarul e setat la `radu@jciiasi.ro`. Ca să-l schimbi, editează linia:

```html
<form action="https://formsubmit.co/radu@jciiasi.ro" method="POST">
```

## Cum îl publici

- **Netlify Drop** — `app.netlify.com/drop`, tragi folderul `site` în pagină, primești o adresă
  publică în câteva secunde. Gratuit.
- **GitHub Pages** — urci folderul într-un repository și activezi Pages din setări. Gratuit.
- **Găzduire proprie** — copiezi conținutul folderului `site` în rădăcina hostingului, prin FTP.

## Ce nu are site-ul încă

- **Politică de confidențialitate.** Formularul colectează date personale, deci este necesară
  înainte de publicare.
- Statistici de trafic.
- Versiune în engleză.

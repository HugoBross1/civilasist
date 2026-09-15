# -*- coding: utf-8 -*-
"""Modelul de cerere pentru certificatul de urbanism, pe formularul nou.

Cel vechi era scris pe F.1 și cita Legea 50/1991 — amândouă abrogate de
Legea nr. 169/2026, Codul amenajării teritoriului, urbanismului și
construcțiilor, în vigoare din 25 august 2026. Cine îl descărca depunea pe
un formular care nu mai există.

Codul a spart cererea unică în mai multe, după scop. Modelul ăsta merge pe
F_CU_04 — construire sau desființare — fiindcă ghidul în care stă butonul de
descărcare se adresează omului care vrea să ridice o casă. Cine vrea doar să
afle regimul terenului depune F_CU_01, iar pentru dezmembrare sau comasare
F_CU_02.

Sursa e formularul oficial publicat în Monitorul Oficial nr. 711 bis din
26.08.2026, aflat în Drive la
  X:\\My Drive\\1 Lucrari civile\\template\\0000 Formulare 2026\\1 CU\\
Secțiunile, bifele și ordinea sunt luate de acolo, nu inventate. Nu e un
înlocuitor al formularului oficial: primăria dă tipizatul, iar modelul ăsta
servește la pregătirea datelor înainte de ghișeu.

Se rulează cu: py unelte-fa-model-cerere-cu.py
"""
import os

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Pt, Cm

IESIRE = ("C:/Users/user/Documents/00 Claude/site/descarcari/"
          "model-cerere-certificat-de-urbanism.docx")

L = "____________________"      # linie scurtă
LL = "________________________________________"   # linie lungă


def stil(doc):
    n = doc.styles["Normal"]
    n.font.name = "Calibri"
    n.font.size = Pt(10.5)
    n.paragraph_format.space_after = Pt(4)
    for s in doc.sections:
        s.top_margin = s.bottom_margin = Cm(1.6)
        s.left_margin = s.right_margin = Cm(1.8)


def titlu(doc, text, marime=13, spatiu_inainte=10):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(spatiu_inainte)
    r = p.add_run(text)
    r.bold = True
    r.font.size = Pt(marime)
    return p


def sectiune(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(9)
    r = p.add_run(text)
    r.bold = True
    r.font.size = Pt(10.5)
    return p


def rand(doc, text, indent=0.0):
    p = doc.add_paragraph(text)
    if indent:
        p.paragraph_format.left_indent = Cm(indent)
    return p


def marunt(doc, text, indent=0.0):
    p = doc.add_paragraph()
    if indent:
        p.paragraph_format.left_indent = Cm(indent)
    r = p.add_run(text)
    r.italic = True
    r.font.size = Pt(8.5)
    return p


def main():
    doc = Document()
    stil(doc)

    marunt(doc, "Model orientativ pe structura formularului F_CU_04 din Legea nr. 169/2026 — "
                "Codul amenajării teritoriului, urbanismului și construcțiilor. "
                "Formularul oficial se ia de la primărie.")

    titlu(doc, "CERERE", 15, spatiu_inainte=14)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("pentru emiterea certificatului de urbanism")
    r.bold = True
    r.add_break()   # \n nu produce rând nou în Word, doar lipește textul
    r2 = p.add_run("pentru construire / desființare")
    r2.bold = True

    sectiune(doc, "1. CĂTRE")
    rand(doc, "Primăria municipiului / orașului / comunei " + LL)
    rand(doc, "Consiliul Județean " + LL)
    marunt(doc, "Se taie ce nu se potrivește. Pentru anumite categorii de lucrări emitentul este "
                "consiliul județean — primăria vă spune dacă e cazul.")

    sectiune(doc, "2. SOLICITANTUL")
    rand(doc, "Nume și prenume " + LL + "   CNP " + L)
    rand(doc, "Act de identitate: seria ______ nr. ____________ "
              "eliberat de " + L + " la data de ____________")
    rand(doc, "Domiciliul: județul " + L + ", municipiul / orașul / comuna " + L + ",")
    rand(doc, "satul / sectorul " + L + ", str. " + L +
              " nr. ______, bl. ______, sc. ______, et. ______, ap. ______,")
    rand(doc, "cod poștal ____________, țara ____________")
    rand(doc, "Telefon / fax " + L + "   E-mail " + L)
    rand(doc, "În calitate de reprezentant al " + LL + "   CUI / CIF " + L)
    rand(doc, "☐ titular al dreptului de proprietate          ☐ împuternicit al titularului")

    doc.add_paragraph()
    rand(doc, "în conformitate cu prevederile Legii nr. 169/2026 privind Codul amenajării "
              "teritoriului, urbanismului și construcțiilor, solicit emiterea")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("CERTIFICATULUI DE URBANISM")
    r.bold = True
    rand(doc, "pentru:    ☐ CONSTRUIRE          ☐ DESFIINȚARE")
    rand(doc, "☐ pentru clădiri și amenajări     ☐ lucrări inginerești     "
              "☐ pentru construcții cu caracter special")
    rand(doc, "în vederea realizării obiectivului de investiții:")
    rand(doc, LL + LL)
    marunt(doc, u"Scrieți-l cât mai exact: „locuință unifamilială P+1E "
                u"și împrejmuire”, nu „construire”. Certificatul "
                u"răspunde la ce ați cerut, nu la ce ați vrut să cereți.")

    sectiune(doc, "3. IMOBILUL")
    rand(doc, "☐ teren          ☐ construcții")
    rand(doc, "Județul " + L + ", municipiul / orașul / comuna " + L + ",")
    rand(doc, "satul / sectorul " + L + ", cod poștal ____________,")
    rand(doc, "str. " + L + " nr. ______, bl. / sc. / et. / ap. ____________")
    rand(doc, "Număr cadastral ____________   Carte funciară nr. ____________")
    rand(doc, "Suprafața terenului ____________ m²   Suprafața construcției ____________ m²")

    sectiune(doc, "4. ÎNCADRAREA LUCRĂRILOR")
    rand(doc, "A · Lucrări de construcții noi", 0.0)
    rand(doc, "☐ clădiri civile     ☐ clădiri industriale     ☐ clădiri agricole     "
              "☐ construcții cu caracter special", 0.5)
    rand(doc, "☐ în afara zonei de protecție a monumentelor     "
              "☐ în zona de protecție a monumentelor", 0.5)
    rand(doc, "☐ în afara zonelor construite protejate     ☐ în zone construite protejate", 0.5)
    rand(doc, "☐ nu sunt cunoscute solicitantului astfel de informații", 0.5)
    rand(doc, "B · Intervenții asupra construcțiilor existente")
    rand(doc, "☐ B.1 · la alte clădiri decât cele de la B.2 și B.3", 0.5)
    rand(doc, "☐ B.2 · la monumente istorice, în zona lor de protecție, în zone construite "
              "protejate sau la clădiri cu valoare arhitecturală ori istorică deosebită", 0.5)
    rand(doc, "☐ B.3 · la clădiri sau construcții cu caracter special", 0.5)
    rand(doc, "C · Amenajări")
    rand(doc, "☐ amenajări civile     ☐ amenajări și îmbunătățiri funciare     "
              "☐ construcții provizorii     ☐ foraje, excavări", 0.5)
    rand(doc, "☐ cercetări pentru zăcăminte     ☐ spații verzi, plantate     "
              "☐ spații publice     ☐ organizare de șantier", 0.5)
    rand(doc, "D · Lucrări inginerești")
    rand(doc, "☐ infrastructură de transport     ☐ infrastructură energetică     "
              "☐ rețele de comunicații electronice", 0.5)
    rand(doc, "☐ gospodărirea apelor     ☐ hidrotehnice     ☐ miniere     "
              "☐ alte lucrări inginerești de interes public", 0.5)

    sectiune(doc, "5. SE ANEXEAZĂ")
    rand(doc, "☐ extras de carte funciară actualizat")
    rand(doc, "☐ plan de situație propus, cu amprenta la sol a corpurilor de clădire propuse "
              "spre construire / desființare / extindere")
    rand(doc, "☐ plan de încadrare în zonă în sistem Stereo 70")
    rand(doc, "☐ descrierea succintă a investiției")
    rand(doc, "☐ împuternicirea, dacă este cazul")
    rand(doc, "☐ dovada plății taxei")

    sectiune(doc, "6. COMUNICAREA RĂSPUNSULUI")
    rand(doc, "☐ în format scris, prin poștă     ☐ în format digital, pe e-mailul indicat     "
              "☐ ridicare de la sediul autorității")

    sectiune(doc, "7. DATA ȘI SEMNĂTURA")
    rand(doc, "Data ____________          Solicitantul " + L +
              "          Semnătura ____________")

    doc.add_paragraph()
    marunt(doc, "Model orientativ pus la dispoziție de CivilAsist (civilasist.ro), pe structura "
                "formularului F_CU_04 publicat în Monitorul Oficial nr. 711 bis din 26.08.2026. "
                "Formularul oficial se ia de la primărie sau de pe site-ul ei; unele primării au "
                "propriul tipizat. Dacă vreți doar să aflați ce se poate construi pe teren, fără să "
                "depuneți încă un proiect, cererea potrivită e F_CU_01, iar pentru dezmembrare sau "
                "comasare, F_CU_02. Vă putem întocmi noi întreaga documentație — "
                "contact@civilasist.ro · 0744 921 358.")

    doc.save(IESIRE)
    print("scris: %s  (%d KB)" % (os.path.basename(IESIRE),
                                  os.path.getsize(IESIRE) // 1024))


if __name__ == "__main__":
    main()

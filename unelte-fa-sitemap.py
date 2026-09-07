# -*- coding: utf-8 -*-
"""Generează sitemap.xml cu date de modificare ADEVĂRATE, luate din Git.

De ce există unealta asta: sitemap-ul era scris de mână, iar `lastmod` a rămas
înțepenit pe 2026-08-27 pentru toate cele 26 de adrese - inclusiv după ce, pe
3 septembrie, s-au corectat 41 de afirmații juridice în ghiduri. Google
folosește `lastmod` ca să decidă ce merită recitit, deci corecțiile nu i-au
fost niciodată semnalate. Un sitemap care minte e mai rău decât unul care
lipsește.

Data vine din ultimul commit care a atins fiecare fișier, nu din ceasul
sistemului: așa e adevărată chiar dacă fișierul e regenerat sau copiat.

Se rulează după orice modificare de conținut, înainte de publicare:

    cd "C:/Users/user/Documents/00 Claude/site" && py unelte-fa-sitemap.py

Pe Windows: `py`, nu `python`.
"""
import glob
import io
import os
import subprocess
import sys

SITE = "https://civilasist.ro/"

# 404 nu are ce căuta într-un sitemap: nu e o pagină pe care vrem s-o găsească
# cineva prin căutare.
EXCLUSE = {"404.html"}

# Prioritățile păstrate din sitemap-ul scris de mână. Google le ia oricum în
# seamă foarte slab; ce contează e lastmod.
def prioritate(cale):
    if cale == "index.html":
        return "1.0"
    if cale.startswith("ghiduri/"):
        return "0.9"
    if cale.startswith("servicii/"):
        return "0.8"
    return "0.3"          # confidențialitate și alte pagini de serviciu


def adresa(cale):
    return SITE if cale == "index.html" else SITE + cale


def data_din_git(cale):
    """Ultimul commit care a atins fișierul. Dacă nu e în Git încă, ceasul
    fișierului de pe disc."""
    try:
        r = subprocess.run(
            ["git", "log", "-1", "--format=%ad", "--date=short", "--", cale],
            capture_output=True, text=True, timeout=15,
        )
        d = r.stdout.strip()
        if d:
            return d
    except Exception:
        pass
    import datetime
    t = os.path.getmtime(cale)
    return datetime.datetime.fromtimestamp(t).strftime("%Y-%m-%d")


def pagini():
    gasite = []
    for m in ("*.html", "*/*.html"):
        for f in glob.glob(m):
            f = f.replace(os.sep, "/")
            if os.path.basename(f) in EXCLUSE:
                continue
            gasite.append(f)
    # prima pagină întâi, apoi ghidurile, apoi serviciile, apoi restul
    rang = {"index.html": 0}
    def cheie(f):
        if f in rang:
            return (0, f)
        if f.startswith("ghiduri/"):
            return (1, f)
        if f.startswith("servicii/"):
            return (2, f)
        return (3, f)
    return sorted(set(gasite), key=cheie)


def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    lista = pagini()

    rinduri = ['<?xml version="1.0" encoding="UTF-8"?>',
               '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for f in lista:
        rinduri.append("  <url>")
        rinduri.append("    <loc>%s</loc>" % adresa(f))
        rinduri.append("    <lastmod>%s</lastmod>" % data_din_git(f))
        rinduri.append("    <priority>%s</priority>" % prioritate(f))
        rinduri.append("  </url>")
    rinduri.append("</urlset>")
    rinduri.append("")

    nou = "\n".join(rinduri)
    vechi = ""
    if os.path.exists("sitemap.xml"):
        vechi = io.open("sitemap.xml", encoding="utf-8").read()

    io.open("sitemap.xml", "w", encoding="utf-8", newline="\n").write(nou)

    print("scris sitemap.xml: %d adrese" % len(lista))
    if vechi and vechi != nou:
        import re
        d_vechi = set(re.findall(r"<lastmod>([^<]+)</lastmod>", vechi))
        d_nou = set(re.findall(r"<lastmod>([^<]+)</lastmod>", nou))
        print("  date de modificare inainte: %s" % ", ".join(sorted(d_vechi)))
        print("  date de modificare acum   : %s" % ", ".join(sorted(d_nou)))
    for f in lista:
        print("  %-52s %s  %s" % (f, data_din_git(f), prioritate(f)))


if __name__ == "__main__":
    main()

# -*- coding: utf-8 -*-
"""Construiește o imagine pătrată de postare: fotografie proprie, întunecată,
cu emblema sus și întrebarea scrisă peste, în josul cadrului."""
import io, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

L = 1080                 # latura imaginii
MARJA = 118              # 11% — sub asta scrisul se ciuntește în previzualizări
BOLD = "C:/Windows/Fonts/segoeuib.ttf"
SEMI = "C:/Windows/Fonts/seguisb.ttf"
REG  = "C:/Windows/Fonts/segoeui.ttf"
PORTOCALIU = (245, 133, 31)
ALB = (255, 255, 255)


def font(cale, dim):
    try:
        return ImageFont.truetype(cale, dim)
    except OSError:
        return ImageFont.truetype(BOLD, dim)


def patrat(cale):
    im = Image.open(cale).convert("RGB")
    w, h = im.size
    l = min(w, h)
    im = im.crop(((w - l) // 2, (h - l) // 2, (w - l) // 2 + l, (h - l) // 2 + l))
    return im.resize((L, L), Image.LANCZOS)


def intunec(im):
    """Voal uniform plus o umbră care se adâncește spre jos, unde stă scrisul."""
    v = Image.new("RGB", (L, L), (14, 20, 30))
    im = Image.blend(im, v, 0.42)
    masca = Image.new("L", (1, L))
    for y in range(L):
        t = y / (L - 1)
        masca.putpixel((0, y), int(20 + 150 * (t ** 1.7)))
    masca = masca.resize((L, L))
    return Image.composite(Image.new("RGB", (L, L), (10, 14, 22)), im, masca)


def emblema(d, x, y):
    r = 26
    d.ellipse([x, y, x + 2 * r, y + 2 * r], fill=(31, 111, 196))
    d.ellipse([x + 8, y + 8, x + 2 * r - 8, y + 2 * r - 8], fill=(20, 49, 94))
    cx, cy = x + r, y + r
    d.rounded_rectangle([cx - 2, cy - 11, cx + 2, cy - 6], radius=1, fill=ALB)
    d.pieslice([cx - 10, cy - 8, cx + 10, cy + 12], 180, 360, fill=ALB)
    d.rectangle([cx - 10, cy + 1, cx + 10, cy + 5], fill=ALB)
    d.rounded_rectangle([cx - 13, cy + 6, cx + 13, cy + 11], radius=2, fill=ALB)
    f = font(BOLD, 36)
    d.text((x + 2 * r + 16, cy), "CivilAsist", font=f, fill=ALB, anchor="lm")
    w = d.textlength("CivilAsist", font=f)
    d.text((x + 2 * r + 16 + w, cy), ".ro", font=f, fill=PORTOCALIU, anchor="lm")


def rupe(d, text, f, lat):
    linii, curent = [], ""
    for vorba in text.split():
        prob = (curent + " " + vorba).strip()
        if d.textlength(prob, font=f) <= lat:
            curent = prob
        else:
            if curent:
                linii.append(curent)
            curent = vorba
    if curent:
        linii.append(curent)
    return linii


def fa(foto, intrebare, iesire):
    im = intunec(patrat(foto))
    d = ImageDraw.Draw(im)
    emblema(d, MARJA, 76)

    lat = L - 2 * MARJA
    dim = 62
    while dim > 34:
        f = font(BOLD, dim)
        linii = rupe(d, intrebare, f, lat)
        if len(linii) <= 3:
            break
        dim -= 2
    pas = int(dim * 1.30)

    f_mic = font(REG, 27)
    f_dom = font(BOLD, 30)
    jos = L - MARJA
    y_dom = jos - 30
    y_mic = y_dom - 38
    y_text = y_mic - 42 - len(linii) * pas

    d.rounded_rectangle([MARJA, y_text - 34, MARJA + 72, y_text - 28], radius=3,
                        fill=PORTOCALIU)
    for i, ln in enumerate(linii):
        d.text((MARJA, y_text + i * pas), ln, font=f, fill=ALB)
    d.text((MARJA, y_mic), "Răspunsul întreg pe", font=f_mic, fill=(196, 202, 212))
    d.text((MARJA, y_dom), "civilasist.ro", font=f_dom, fill=PORTOCALIU)

    im.save(iesire, quality=90, optimize=True)
    return len(linii), dim


if __name__ == "__main__":
    foto, intrebare, iesire = sys.argv[1], sys.argv[2], sys.argv[3]
    n, dim = fa(foto, intrebare, iesire)
    print("scris %s  (%d linii, corp %d)" % (iesire, n, dim))

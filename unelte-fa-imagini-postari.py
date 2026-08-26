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
AURIU = (201, 144, 63)          # auriul logoului, #c9903f
ALB = (255, 255, 255)
LOGO = "C:/Users/user/Documents/00 Claude/site/imagini/logo-antet.png"


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


def emblema(im, x, y):
    """Logoul adevarat (varianta pentru fundal inchis), nu un desen de mana."""
    logo = Image.open(LOGO).convert("RGBA")
    h = 66
    w = round(logo.width * h / logo.height)
    logo = logo.resize((w, h), Image.LANCZOS)
    im.paste(logo, (x, y), logo)


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
    emblema(im, MARJA, 78)
    d = ImageDraw.Draw(im)

    lat = L - 2 * MARJA
    dim = 88
    while dim > 56:
        f = font(BOLD, dim)
        linii = rupe(d, intrebare, f, lat)
        if len(linii) <= 4:
            break
        dim -= 2
    pas = int(dim * 1.30)

    f_mic = font(REG, 38)
    f_dom = font(BOLD, 52)
    jos = L - MARJA
    y_dom = jos - 52
    y_mic = y_dom - 50
    y_text = y_mic - 54 - len(linii) * pas

    d.rounded_rectangle([MARJA, y_text - 46, MARJA + 104, y_text - 37], radius=5,
                        fill=AURIU)
    for i, ln in enumerate(linii):
        d.text((MARJA, y_text + i * pas), ln, font=f, fill=ALB)
    d.text((MARJA, y_mic), "Răspunsul întreg pe", font=f_mic, fill=(196, 202, 212))
    d.text((MARJA, y_dom), "civilasist.ro", font=f_dom, fill=AURIU)

    im.save(iesire, quality=90, optimize=True)
    return len(linii), dim


if __name__ == "__main__":
    foto, intrebare, iesire = sys.argv[1], sys.argv[2], sys.argv[3]
    n, dim = fa(foto, intrebare, iesire)
    print("scris %s  (%d linii, corp %d)" % (iesire, n, dim))

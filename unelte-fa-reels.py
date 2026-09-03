# -*- coding: utf-8 -*-
"""Construiește un Reel din aceeași întrebare și aceeași fotografie ca postarea
pătrată: compoziție verticală 9:16, apoi video de 8 secunde cu apropiere lentă.

Compoziția se desenează la 1,1× (1188×2112) ca să existe rezervă pentru zoom;
ffmpeg o strânge la 1080×1920, deci scrisul iese mai curat, nu mai moale.

Zonele pe care interfața Reels le acoperă (jos ~330 px, dreapta ~150 px) rămân
goale — altfel legenda și butoanele Facebook taie tocmai adresa site-ului.
"""
import io, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

S = 1.1                                  # rezerva pentru apropiere
L, H = int(1080 * S), int(1920 * S)       # 1188 × 2112
MARJA = int(118 * S)
JOS_LIBER = int(330 * S)                  # loc pentru legenda si butoanele Reels

BOLD = "C:/Windows/Fonts/segoeuib.ttf"
REG  = "C:/Windows/Fonts/segoeui.ttf"
AURIU = (201, 144, 63)
ALB = (255, 255, 255)
LOGO = "C:/Users/user/Documents/00 Claude/site/imagini/logo-antet.png"

FFMPEG = ("C:/Users/user/AppData/Local/Microsoft/WinGet/Packages/"
          "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/"
          "ffmpeg-9.0.1-full_build/bin/ffmpeg.exe")

DURATA = 8
FPS = 30


def font(cale, dim):
    try:
        return ImageFont.truetype(cale, int(dim))
    except OSError:
        return ImageFont.truetype(BOLD, int(dim))


def vertical(cale):
    """Decupează fotografia pe 9:16, din centru."""
    im = Image.open(cale).convert("RGB")
    w, h = im.size
    dorit = L / H
    if w / h > dorit:                     # prea lată: tăiem lateral
        nl = int(h * dorit)
        im = im.crop(((w - nl) // 2, 0, (w - nl) // 2 + nl, h))
    else:                                 # prea înaltă: tăiem sus-jos
        nh = int(w / dorit)
        sus = int((h - nh) * 0.35)        # puțin mai sus de centru: cerul contează mai puțin
        im = im.crop((0, sus, w, sus + nh))
    return im.resize((L, H), Image.LANCZOS)


def intunec(im):
    """Voal uniform, plus umbră care se adâncește spre jos, unde stă scrisul."""
    v = Image.new("RGB", (L, H), (14, 20, 30))
    im = Image.blend(im, v, 0.40)
    masca = Image.new("L", (1, H))
    for y in range(H):
        t = y / (H - 1)
        masca.putpixel((0, y), int(14 + 168 * (t ** 1.6)))
    masca = masca.resize((L, H))
    return Image.composite(Image.new("RGB", (L, H), (9, 14, 22)), im, masca)


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


def compune(foto, intrebare, iesire_png):
    im = intunec(vertical(foto))

    logo = Image.open(LOGO).convert("RGBA")
    hl = int(76 * S)
    logo = logo.resize((round(logo.width * hl / logo.height), hl), Image.LANCZOS)
    im.paste(logo, (MARJA, int(150 * S)), logo)

    d = ImageDraw.Draw(im)
    lat = L - 2 * MARJA

    dim = int(104 * S)
    while dim > int(66 * S):
        f = font(BOLD, dim)
        linii = rupe(d, intrebare, f, lat)
        if len(linii) <= 5:
            break
        dim -= int(3 * S)
    pas = int(dim * 1.28)

    f_mic = font(REG, 46 * S)
    f_dom = font(BOLD, 66 * S)

    jos = H - JOS_LIBER
    y_dom = jos - int(66 * S)
    y_mic = y_dom - int(58 * S)
    y_text = y_mic - int(74 * S) - len(linii) * pas

    d.rounded_rectangle([MARJA, y_text - int(52 * S), MARJA + int(116 * S), y_text - int(42 * S)],
                        radius=int(5 * S), fill=AURIU)
    for i, ln in enumerate(linii):
        d.text((MARJA, y_text + i * pas), ln, font=f, fill=ALB)
    d.text((MARJA, y_mic), "Răspunsul întreg pe", font=f_mic, fill=(196, 202, 212))
    d.text((MARJA, y_dom), "civilasist.ro", font=f_dom, fill=AURIU)

    im.save(iesire_png)
    return len(linii), dim


def video(png, mp4):
    """Apropiere lentă de la cadrul întreg până la 6%, cu sunet mut (Reels
    așteaptă o pistă audio)."""
    cadre = DURATA * FPS
    filtru = (
        "zoompan=z='min(1+0.06*on/%d,1.06)'"
        ":x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
        ":d=1:s=1080x1920:fps=%d,format=yuv420p" % (cadre, FPS)
    )
    cmd = [FFMPEG, "-y", "-loglevel", "error",
           "-loop", "1", "-framerate", str(FPS), "-t", str(DURATA), "-i", png,
           "-f", "lavfi", "-t", str(DURATA), "-i", "anullsrc=r=48000:cl=stereo",
           "-vf", filtru,
           "-c:v", "libx264", "-profile:v", "high", "-preset", "medium",
           "-crf", "20", "-pix_fmt", "yuv420p", "-r", str(FPS),
           "-c:a", "aac", "-b:a", "128k", "-ar", "48000", "-ac", "2",
           "-movflags", "+faststart", "-shortest", mp4]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        raise RuntimeError("ffmpeg: " + r.stderr[:400])
    return os.path.getsize(mp4)


def fa(foto, intrebare, png, mp4):
    n, dim = compune(foto, intrebare, png)
    o = video(png, mp4)
    return n, dim, o


if __name__ == "__main__":
    foto, intrebare, png, mp4 = sys.argv[1:5]
    n, dim, o = fa(foto, intrebare, png, mp4)
    print("%s  (%d linii, corp %d, %d KB)" % (mp4, n, dim, o // 1024))

# Contact sheet: one frame per story beat, labelled.
import sys
from PIL import Image, ImageDraw, ImageFont
out = sys.argv[1]; items = [a.split('=', 1) for a in sys.argv[2:]]   # "label=path"
w = 420; h = int(w * 1920 / 1080); pad = 24; head = 64
W = Image.new('RGB', (len(items) * (w + pad) + pad, h + head + pad), (18, 20, 26))
d = ImageDraw.Draw(W)
f1 = ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-Bold.otf', 24)
f2 = ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-Medium.otf', 18)
for i, (label, p) in enumerate(items):
    x = pad + i * (w + pad)
    title, t = label.split('@')
    d.text((x, 14), title, fill=(255, 255, 255), font=f1)
    d.text((x, 42), f't = {t}s', fill=(160, 170, 185), font=f2)
    W.paste(Image.open(p).convert('RGB').resize((w, h), Image.LANCZOS), (x, head))
W.save(out)

#!/usr/bin/env python3
"""Validate the kanbun-only PWA offline bundle without non-standard dependencies."""
import json
import pathlib
import re
import struct
import sys
import urllib.request
import zlib

HERE = pathlib.Path(__file__).resolve().parent
PREFIX = "/Alts/kanbun/"
passed = 0

def check(label, condition):
    global passed
    if not condition:
        raise AssertionError(label)
    passed += 1
    print(f"✓ {label}")

def decode_png(path):
    raw = path.read_bytes()
    check(f"{path.name} PNG signature", raw[:8] == b"\x89PNG\r\n\x1a\n")
    pos = 8
    pieces = []
    width = height = depth = color = None
    has_iend = False
    while pos < len(raw):
        if pos + 12 > len(raw):
            raise AssertionError(f"{path.name} has incomplete chunk")
        size = struct.unpack_from(">I", raw, pos)[0]
        typ = raw[pos + 4:pos + 8]
        payload = raw[pos + 8:pos + 8 + size]
        crc = struct.unpack_from(">I", raw, pos + 8 + size)[0]
        if (zlib.crc32(typ + payload) & 0xffffffff) != crc:
            raise AssertionError(f"{path.name}: bad {typ!r} CRC")
        pos += size + 12
        if typ == b"IHDR":
            width, height, depth, color = struct.unpack_from(">IIBB", payload)
        elif typ == b"IDAT":
            pieces.append(payload)
        elif typ == b"IEND":
            has_iend = True
            break
    if not has_iend or pos != len(raw):
        raise AssertionError(f"{path.name}: missing IEND or trailing bytes")
    if depth != 1 or color != 3:
        raise AssertionError(f"{path.name}: unexpected indexed PNG layout")
    pixels = zlib.decompress(b"".join(pieces))
    stride = (width + 7) // 8
    if len(pixels) != (stride + 1) * height:
        raise AssertionError(f"{path.name}: damaged pixel data")
    if any(pixels[y * (stride + 1)] != 0 for y in range(height)):
        raise AssertionError(f"{path.name}: unsupported scanline filter")
    return width, height

manifest = json.loads((HERE / "manifest.webmanifest").read_text(encoding="utf-8"))
index = (HERE / "index.html").read_text(encoding="utf-8")
sw = (HERE / "sw.js").read_text(encoding="utf-8")
app = (HERE / "app.js").read_text(encoding="utf-8")
check("Manifest scoped to /Alts/kanbun/ only",
      all(manifest.get(key) == PREFIX for key in ("id","start_url","scope")))
check("Manifest can launch as a standalone Japanese app",
      manifest.get("display") == "standalone" and manifest.get("lang") == "ja"
      and bool(manifest.get("name")))
icons = manifest.get("icons", [])
check("Manifest declares 192px and 512px PNG icons",
      all(any(i.get("src") == f"./icon-{n}.png"
                  and i.get("sizes") == f"{n}x{n}"
                  and i.get("type") == "image/png" for i in icons) for n in (192,512)))
for n in (192, 512):
    check(f"Icon {n}px decodes and matches manifest", decode_png(HERE / f"icon-{n}.png") == (n,n))
check("Head links PWA, icon and local stylesheet",
      'rel="manifest" href="./manifest.webmanifest"' in index
      and 'rel="apple-touch-icon"' in index and './icon.svg' in index)
check("Application registers project-local service worker",
      'navigator.serviceWorker.register("./sw.js",{scope:"./"})' in app)
match = re.search(r'const SHELL=(\[[^;]+\]);', sw)
if not match:
    raise AssertionError("Missing offline-shell definition")
shell = json.loads(match.group(1))
check("Offline shell contains required documents and icons",
      all(x in shell for x in ("./","./index.html","./styles.css",
                               "./editorial.css","./install.html","./lessons.js","./poems.js",
                               "./columns.js","./app.js","./manifest.webmanifest",
                               "./icon-192.png","./icon-512.png","./icon.svg")))
check("All project-only offline files exist",
      all((HERE / p.removeprefix("./")).exists() for p in shell if p != "./"))
check("Cache is versioned and old project-only caches removed",
      'const CACHE="alts-kanbun-v7"' in sw
      and '.startsWith("alts-kanbun-")' in sw
      and 'self.clients.claim()' in sw)
check("Worker rejects out-of-scope requests",
      'url.origin!==self.location.origin' in sw
      and '!url.pathname.startsWith(SCOPE_PATH)' in sw
      and 'new URL("./",self.registration.scope).pathname' in sw)
check("Update logic fetches scripts online before reusing cache", 
      'const response=await fetch(request)' in sw
      and 'cache.put(request,response.clone())' in sw)
check("Offline navigation falls back to cached entry point",
      'caches.match("./index.html")' in sw)

if len(sys.argv) > 1:
    root = sys.argv[1].rstrip("/") + "/"
    urls = ["", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "sw.js"]
    statuses = []
    for path in urls:
        with urllib.request.urlopen(root + path, timeout=7) as response:
            statuses.append(response.status == 200)
    check("Project path serves install assets over HTTP", all(statuses))
print(f"PASS {passed} / {passed}")

# Fonts

- `BigShoulders-72-800.woff2` — the site's display face. Static instance of
  Google Fonts' variable *Big Shoulders* at `opsz=72` (the "Display" cut),
  `wght=800`, subset to Latin. Rebuild with:

  ```sh
  curl -LO "https://raw.githubusercontent.com/google/fonts/main/ofl/bigshoulders/BigShoulders%5Bopsz,wght%5D.ttf"
  python3 -m fontTools.varLib.instancer "BigShoulders[opsz,wght].ttf" opsz=72 wght=800 -o bs-800.ttf
  pyftsubset bs-800.ttf --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2190-2193,U+2212,U+2215,U+FEFF,U+FFFD" \
    --flavor=woff2 --layout-features='*' --output-file=BigShoulders-72-800.woff2
  ```

- `*.ttf` — static, Latin-subset TTFs used only by the Open Graph image
  renderer (`lib/og.tsx`), which can't read WOFF2 or variable fonts.

All three families (Big Shoulders, Instrument Serif, Inter Tight) are licensed
under the SIL Open Font License.

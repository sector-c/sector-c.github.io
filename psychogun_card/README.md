# Cobra The Arcade — Psychogun Card Password Center

Unofficial, offline preservation interface styled around the supplied original website art. English/Japanese interface toggle is independent of game revision; the recovered codec is shared by CBR1 (JP) and CBR2 (EX).

## Run
Open `index.html` in a modern browser after extracting the whole directory. Alternatively use the separately distributed self-contained `psychogun_card.html` (no dependencies). No server, internet connection, or emulator required. The original-site link is optional and external.

## Source
- `index.html` — markup, including default English labels
- `style.css` — compact dark arcade-site design and responsive layout
- `app.js` — EN/JP translation, input, output, and UI state
- `codec.js` — JavaScript port of EXP-04-002 the original Python card-reader codec
- `assets/` — supplied original art (boss banner retained for future guide work)
- `build.py` — regenerate standalone HTML in the parent directory
- `test-codec.js` — Node smoke and round-trip tests

## Verification
1,024 generated passwords matched the original archived Python implementation (four nine-byte fixtures × all 256 masks, varied keys and versions). Chromium DOM tests passed: EN/JP switching, ASCII-to-HEX conversion, mask selection, known fixture, invalid checksum rejection, navigation, and 390px viewport overflow check. The environment blocks file:// navigation; the self-contained HTML was loaded with Playwright set_content for these browser checks. Native game validation of the underlying algorithm was previously performed on both revisions; this website itself has not been tested through the game's password UI.

Run `node test-codec.js` for the included local smoke tests. The sample name is synthetic: COBRA followed by four zero bytes, all rewards, key/version zero -> ZBEXCKAOI.

## Limits
Only the incoming web reward password format is implemented. The outgoing ranking password, card serialization, reader emulation, real name encoding, original in-game password entry, and actual identities of individual rewards remain unverified. ASCII input assumes zero padding; use exact nine raw bytes in HEX mode for real card data or Japanese names. No memory writes, network registration, analytics, or backend. The language toggle changes UI language, not card bytes.

# Meriva Medical Centre — launch video assets

Everything the launch video uses. Nothing here is redrawn: the logo is cut from the
supplied file and every UI image is a screenshot of the real app.

## Where the assets come from

* **Website:** I found no public Meriva site. Web search turned up nothing, and outbound
  web access from the build container is blocked, so I couldn't screenshot a live site.
* **Product UI:** this is the Clinic 360 patient app from this repository, run locally (`npm run dev`) on the
  seeded demo data. Its clinic record was set to **Meriva Medical Centre**, Coimbatore,
  with Meriva's brand colours through the app's own per-clinic theming (`clinics.brandPrimary`
  / `brandAccent`). The runtime theming doesn't derive `--brand-ink`, `--brand-wash` or
  `--brand-hover` from the brand colour, so the capture script sets those three tokens to
  Meriva navy and blue. Without that, the screens would mix the default teal with Meriva blue.
* **Patient data:** the repo's fictional demo family (Arun, Divya, Ishaan, Lakshmi Menon). No
  real patient information.

## Logo — `logo/`
| File | What |
|---|---|
| `meriva-logo-original.jpg` | The supplied logo, untouched (440×440) |
| `meriva-logo-alpha.png` | White keyed to alpha, ×3 |
| `mark.png` | Flower + cross mark, ×4, transparent |
| `wordmark.png` | "MERIVA" with the sky-blue swoosh, ×4 |
| `descriptor.png` | "— MEDICAL CENTRE —", ×4 |
| `tagline.png` | "A place where care meets life.", ×4 |
| `petal_0…8.png` | The mark split into its 9 pieces (8 petals + cross, id 3) for assembly |
| `logo_layers.json` | Source-pixel boxes for every layer and petal |

## Colour — `palette.json` (sampled from the logo)
| Token | Hex | Where |
|---|---|---|
| navy | `#002C69` | wordmark, cross |
| royal_blue | `#035EA6` | blue petals |
| sky_blue | `#1E8DD2` | petal highlights, the A swoosh |
| orange | `#FA7A11` | orange petals |
| amber | `#FDA01A` | orange petal highlights |
| app_bg_bone | `#FAF9F7` | the app's background |

## Type — `fonts/`
| Use | Font | Match |
|---|---|---|
| "MERIVA" wordmark | **Cinzel** | Near-exact match for the logo's caps |
| "MEDICAL CENTRE" | **Montserrat** | Same geometric caps, wide tracking |
| Tagline | **Cormorant Garamond** | Closest open serif |
| Product UI | **Inter** | The font the app ships with |

## Screens — `screens/` (390×844 viewport @3x = 1170×2532)
| File | State |
|---|---|
| `home.png`, `home_full.png` | Patient home: next appointment, health-today cards, quick actions |
| `home_labhover.png` | Home with the "New lab report" card hovered |
| `lab.png` | HbA1c report: 5.9 %, "Above range", reference 4–5.6 |
| `family_sheet.png` | "Who are you here for?" family switcher sheet |
| `family_switched.png` | Home after switching to Ishaan, with the "Viewing Ishaan Menon's records" band |
| `book_spec.png` → `book_doc.png` → `book_slot.png` | Booking: speciality → doctor → time |
| `book_slot_hover.png` | 12:00 pm slot hovered |
| `book_confirm.png`, `book_confirm_hover.png` | Review and confirm ("Confirm appointment") |
| `book_done.png` | "Appointment confirmed" |
| `meta.json` | Element bounding boxes (CSS px) used to aim the cursor and cut UI pieces |

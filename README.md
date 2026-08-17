# 🔥 NAJMI INFO APIS — Free Fire Player Info (Black & Gold UI)

A static, **GitHub Pages–ready** front-end for the **NAJMI FF EXPERIMENT** Free Fire
info API. Dark black + gold luxury theme. No build step — pure HTML / CSS / JS.

**Credits:** UI & site built for **Shivraj Bhatt** · [github.com/SHIVRAJ-BHATT](https://github.com/SHIVRAJ-BHATT) ·
API by **NAJMI FF EXPERIMENT** · [YouTube: NAJMI FF EXPERIMENT](https://youtu.be/yqra-EdmCfo)

---

## 📁 Files

| File        | Purpose                                    |
| ----------- | ------------------------------------------ |
| `index.html`| Page structure                             |
| `style.css` | Black & gold theme                         |
| `script.js` | UID lookup, rendering, demo & API settings |
| `.nojekyll` | Tells GitHub Pages to skip Jekyll          |

---

## 🚀 Deploy on GitHub Pages (2 minutes)

1. Create a new repo on GitHub: `https://github.com/SHIVRAJ-BHATT/` → **New repository**.
2. Upload **all files of this folder** (or `git push`) to the repo's `main` branch.
3. Open **Settings → Pages**.
4. Under **Branch**, choose `main` and folder `/ (root)`, then click **Save**.
5. Wait ~1 minute. Your site is live at:
   `https://<your-username>.github.io/<repo-name>/`

### Alternative — GitHub Actions (auto)
GitHub Pages needs no workflow for a plain static site; the Branch method above is enough.

---

## 🔌 Pointing the site at your API

The site calls `/player-info?uid=<UID>&region=<REGION>`.

- By default it shows a placeholder base URL (`your-api.vercel.app`).
- Open the **⚙ Set API base URL** panel on the page, paste your deployed API URL
  (e.g. `https://gst-info.vercel.app` or your own Vercel/Render deploy), and press **Save**.
  The value is remembered in `localStorage`.
- **Demo:** press **▶ Demo** to preview the UI with a sample response, no API needed.

### Deploy the API itself (from the original project)
The API is the Flask app shipped in `NAJMI-INFO-APIS.zip` (`app.py` + `proto/`). Deploy it on
**Vercel** (the zip includes `vercel.json`) or **Render**, then use that URL as the base above.

> ⚠️ **Security note:** the zip contains `accounts.txt` with credential-like token pairs.
> **Never commit that file to a public GitHub repo.** Only publish the static site files.

---

## 🧪 Example request & response

```text
GET /player-info?uid=338277714
```

Response (JSON) contains: `basicInfo`, `profileInfo`, `clanBasicInfo`,
`captainBasicInfo`, `petInfo`, `socialInfo`, `diamondCostRes`, `creditScoreInfo`.

Supported regions: `IND BR US SAC NA SG RU ID TW VN TH ME PK CIS BD EUROPE`

---

## 🎨 Theme

| Token      | Value    |
| ---------- | -------- |
| Background | `#0b0b0d`|
| Card       | `#141417`|
| Gold       | `#d4af37`|
| Light gold | `#f0d878`|
| Text       | `#ece9df`|

Made with ❤ by **Shivraj Bhatt** · NAJMI INFO APIS · Not affiliated with Garena.

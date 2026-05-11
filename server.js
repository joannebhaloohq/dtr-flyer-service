const express = require('express')
const puppeteer = require('puppeteer')
const multer = require('multer')
const cors = require('cors')

const app = express()
const upload = multer({ storage: multer.memoryStorage() })
app.use(cors())
app.use(express.json())

const LOGO_B64 = "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"

function buildHTML(artistName, dateStr, setType, format, photoB64, photoMime) {
  const isStory = format === 'story'
  const W = 1080
  const H = isStory ? 1920 : 1080

  const nameSize = isStory ? 150 : 115
  const dateSize = isStory ? 44 : 34
  const webSize = isStory ? 24 : 19
  const logoW = isStory ? 190 : 148
  const logoTop = isStory ? 56 : 44
  const logoLeft = isStory ? 54 : 44
  const bottomPct = isStory ? 52 : 50

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
html, body { width:${W}px; height:${H}px; overflow:hidden; }
.wrap { position:relative; width:${W}px; height:${H}px; background:#0d0800; font-family:'Oswald',sans-serif; overflow:hidden; }

/* Photo layer */
.photo { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center 20%; }

/* Subtle overall darkening */
.dim { position:absolute; inset:0; background:rgba(0,0,0,0.18); }

/* Main bottom gradient - cinematic fade to dark */
.grad {
  position:absolute; bottom:0; left:0; width:100%;
  height:${bottomPct + 10}%;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0) 0%,
    rgba(5,2,0,0.45) 20%,
    rgba(10,4,1,0.78) 45%,
    rgba(16,5,2,0.93) 68%,
    rgba(19,5,2,0.98) 82%,
    rgba(19,5,2,1) 100%
  );
}

/* Solid bottom strip */
.strip {
  position:absolute; bottom:0; left:0; width:100%;
  height:${isStory ? '7' : '8'}%;
  background:rgb(19,5,2);
}

/* Grain texture overlay */
.grain {
  position:absolute; inset:0;
  opacity:0.55;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E");
  mix-blend-mode: overlay;
  pointer-events:none;
}

/* Logo */
.logo {
  position:absolute;
  top:${logoTop}px; left:${logoLeft}px;
  width:${logoW}px;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.6));
}

/* Text block */
.text {
  position:absolute;
  bottom:${isStory ? '9.5' : '10.5'}%;
  left:0; width:100%;
  text-align:center;
  color:white;
  padding:0 ${isStory ? '60' : '50'}px;
}

.name {
  font-size:${nameSize}px;
  font-weight:700;
  letter-spacing:${isStory ? '12' : '9'}px;
  line-height:1;
  text-transform:uppercase;
  text-shadow: 2px 3px 25px rgba(0,0,0,0.98), 0 0 60px rgba(0,0,0,0.7);
  margin-bottom:${isStory ? '30' : '20'}px;
}

.date {
  font-size:${dateSize}px;
  font-weight:600;
  letter-spacing:${isStory ? '5' : '4'}px;
  line-height:1.65;
  text-transform:uppercase;
  text-shadow: 1px 2px 12px rgba(0,0,0,0.95);
}

.website {
  position:absolute;
  bottom:${isStory ? '2.5' : '2.8'}%;
  left:0; width:100%;
  text-align:center;
  font-size:${webSize}px;
  font-weight:400;
  letter-spacing:3px;
  color:rgba(255,255,255,0.6);
  text-transform:uppercase;
}
</style>
</head>
<body>
<div class="wrap">
  ${photoB64 ? `<img class="photo" src="data:${photoMime};base64,${photoB64}">` : `<div style="position:absolute;inset:0;background:linear-gradient(160deg,#2a1a0e 0%,#0d0800 100%)"></div>`}
  <div class="dim"></div>
  <div class="grad"></div>
  <div class="strip"></div>
  <div class="grain"></div>
  <img class="logo" src="data:image/png;base64,${LOGO_B64}">
  <div class="text">
    <div class="name">${artistName}</div>
    <div class="date">${dateStr}<br>${setType}</div>
  </div>
  <div class="website">WWW.DOWNTOWNTULUMRADIO.COM</div>
</div>
</body>
</html>`
}

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'DTR Flyer Generator' }))

app.post('/generate', upload.single('photo'), async (req, res) => {
  let browser
  try {
    const { artistName, dateStr, setType, format } = req.body
    const photoB64 = req.file ? req.file.buffer.toString('base64') : ''
    const photoMime = req.file ? req.file.mimetype : 'image/jpeg'

    const html = buildHTML(
      (artistName || 'ARTIST NAME').toUpperCase(),
      dateStr || '',
      (setType || 'EXCLUSIVE SET').toUpperCase(),
      format || 'post',
      photoB64,
      photoMime
    )

    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-gpu','--font-render-hinting=none']
    })

    const page = await browser.newPage()
    const isStory = format === 'story'
    await page.setViewport({ width: 1080, height: isStory ? 1920 : 1080, deviceScaleFactor: 1 })
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 })
    await page.evaluateHandle('document.fonts.ready')
    await new Promise(r => setTimeout(r, 800))

    const screenshot = await page.screenshot({ type: 'png' })
    await browser.close()

    const name = (artistName || 'flyer').replace(/\s/g,'_')
    res.set('Content-Type', 'image/png')
    res.set('Content-Disposition', `attachment; filename="DTR_${name}_${format}.png"`)
    res.send(screenshot)

  } catch (err) {
    if (browser) await browser.close().catch(() => {})
    console.error('Error:', err)
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`DTR Flyer Service on port ${PORT}`))

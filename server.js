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

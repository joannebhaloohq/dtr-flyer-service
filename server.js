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

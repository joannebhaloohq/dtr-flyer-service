const express = require('express')
const puppeteer = require('puppeteer')
const multer = require('multer')
const cors = require('cors')

const app = express()
const upload = multer({ storage: multer.memoryStorage() })
app.use(cors())
app.use(express.json())

const LOGO_B64 = "iVBORw0KGgoAAAANSUhEUgAAAlgAAAJYCAYAAAC+ZpjcAAAFi0lEQVR4nO3BAQ0AAADCoPdPbQ43oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIBODfyTAAHQj8E8AAAAAElFTkSuQmCC"

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

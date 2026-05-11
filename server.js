const express = require('express')
const puppeteer = require('puppeteer')
const multer = require('multer')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
const upload = multer({ storage: multer.memoryStorage() })

app.use(cors())
app.use(express.json())

function buildFlyerHTML(artistName, dateStr, setType, format, photoBase64, photoMime) {
  const isStory = format === 'story'
  const W = 1080
  const H = isStory ? 1920 : 1080

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: ${W}px; height: ${H}px; overflow: hidden; background: #0d0800; }
  .flyer {
    position: relative;
    width: ${W}px;
    height: ${H}px;
    overflow: hidden;
    font-family: 'Oswald', sans-serif;
  }
  .photo {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    object-position: center top;
  }
  .overlay-dark {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.12);
  }
  .overlay-gradient {
    position: absolute;
    bottom: 0; left: 0;
    width: 100%;
    height: ${isStory ? '55%' : '48%'};
    background: linear-gradient(
      to bottom,
      rgba(0,0,0,0) 0%,
      rgba(8,3,1,0.6) 25%,
      rgba(13,5,1,0.88) 55%,
      rgba(19,5,2,0.97) 80%,
      rgba(19,5,2,1) 100%
    );
  }
  .bottom-strip {
    position: absolute;
    bottom: 0; left: 0;
    width: 100%;
    height: ${isStory ? '8%' : '9%'};
    background: rgb(19,5,2);
  }
  .grain {
    position: absolute;
    bottom: 0; left: 0;
    width: 100%;
    height: ${isStory ? '55%' : '50%'};
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E");
    opacity: 0.5;
    mix-blend-mode: overlay;
  }
  .logo {
    position: absolute;
    top: ${isStory ? '52px' : '40px'};
    left: ${isStory ? '52px' : '42px'};
    width: ${isStory ? '185px' : '145px'};
    filter: brightness(0) invert(1);
  }
  .text-block {
    position: absolute;
    bottom: ${isStory ? '11%' : '12%'};
    left: 0;
    width: 100%;
    text-align: center;
    color: white;
    padding: 0 40px;
  }
  .artist-name {
    font-size: ${isStory ? '148px' : '112px'};
    font-weight: 700;
    letter-spacing: ${isStory ? '10px' : '8px'};
    line-height: 1;
    text-shadow: 2px 3px 20px rgba(0,0,0,0.95), 0 0 40px rgba(0,0,0,0.8);
    margin-bottom: ${isStory ? '28px' : '18px'};
    text-transform: uppercase;
  }
  .date-line {
    font-size: ${isStory ? '42px' : '33px'};
    font-weight: 600;
    letter-spacing: ${isStory ? '5px' : '4px'};
    line-height: 1.6;
    text-shadow: 1px 2px 10px rgba(0,0,0,0.9);
    text-transform: uppercase;
  }
  .website {
    position: absolute;
    bottom: ${isStory ? '3%' : '3%'};
    left: 0;
    width: 100%;
    text-align: center;
    font-size: ${isStory ? '23px' : '18px'};
    font-weight: 400;
    letter-spacing: 3px;
    color: rgba(255,255,255,0.65);
    text-transform: uppercase;
  }
</style>
</head>
<body>
<div class="flyer">
  ${photoBase64 ? `<img class="photo" src="data:${photoMime};base64,${photoBase64}" />` : `<div style="position:absolute;inset:0;background:linear-gradient(135deg,#2a1a0e,#0d0800)"></div>`}
  <div class="overlay-dark"></div>
  <div class="overlay-gradient"></div>
  <div class="grain"></div>
  <div class="bottom-strip"></div>
  <img class="logo" src="data:image/png;base64,LOGO_PLACEHOLDER" />
  <div class="text-block">
    <div class="artist-name">${artistName}</div>
    <div class="date-line">${dateStr}<br>${setType}</div>
  </div>
  <div class="website">WWW.DOWNTOWNTULUMRADIO.COM</div>
</div>
</body>
</html>`
}

// Load logo once at startup
let logoBase64 = ''
const logoPath = path.join(__dirname, 'logo-white.png')
if (fs.existsSync(logoPath)) {
  logoBase64 = fs.readFileSync(logoPath).toString('base64')
}

app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.post('/generate', upload.single('photo'), async (req, res) => {
  try {
    const { artistName, dateStr, setType, format } = req.body
    const photoBase64 = req.file ? req.file.buffer.toString('base64') : ''
    const photoMime = req.file ? req.file.mimetype : 'image/jpeg'

    let html = buildFlyerHTML(
      artistName || 'ARTIST NAME',
      dateStr || 'SAT MAY 16 2026 AT 19:00 HRS',
      setType || 'EXCLUSIVE SET',
      format || 'post',
      photoBase64,
      photoMime
    )

    // Inject logo
    html = html.replace('LOGO_PLACEHOLDER', logoBase64)

    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ]
    })

    const page = await browser.newPage()
    const isStory = format === 'story'
    await page.setViewport({ width: 1080, height: isStory ? 1920 : 1080, deviceScaleFactor: 1 })
    await page.setContent(html, { waitUntil: 'networkidle0' })

    // Wait for fonts
    await page.evaluateHandle('document.fonts.ready')
    await new Promise(r => setTimeout(r, 500))

    const screenshot = await page.screenshot({ type: 'png', fullPage: false })
    await browser.close()

    res.set('Content-Type', 'image/png')
    res.set('Content-Disposition', `attachment; filename="DTR_${artistName}_${format}.png"`)
    res.send(screenshot)

  } catch (err) {
    console.error('Generate error:', err)
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`DTR Flyer Service running on port ${PORT}`))

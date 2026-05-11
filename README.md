# DTR Flyer Service

Puppeteer-based flyer generator for Downtown Tulum Radio.

## API

POST /generate
- photo: file (multipart)
- artistName: string
- dateStr: string (e.g. "SAT MAY 16 2026 AT 19:00 HRS")
- setType: string (e.g. "EXCLUSIVE SET")
- format: "post" | "story"

Returns: PNG image

## Deploy to Railway

1. Push this repo to GitHub
2. Connect to Railway
3. Deploy

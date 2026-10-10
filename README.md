# KisanConnect 🌾

**A direct farm-to-buyer marketplace for Karnataka**

Farmers post vegetables with fresh geotagged photos at fair prices. Buyers order directly by district, starting from 5 kg. Delivery is arranged through shared or private transport, and the app explains government schemes to farmers in simple language.

**Live demo:** [ADD LINK]  |  **Demo video:** [ADD LINK]

| 5 kg | ±10% | 3 | ₹0 |
|---|---|---|---|
| Minimum buyer order | Farmer price band vs market | Delivery options | Platform fee for farmers |

## Problem

- Small farmers struggle to find buyers and to sell at fair prices, and often depend on middlemen.
- Transport is costly and hard to arrange for small quantities, so produce is wasted or sold cheaply.
- Buyers cannot see the quality of produce before buying and have no direct contact with farmers.
- Farmers often do not know about the government schemes that affect their income.

## Solution

KisanConnect lists vegetables with farmer-uploaded geotagged photos at prices close to the market rate. Buyers order by district from 5 kg. Delivery is by shared truck, small goods vehicle or door delivery. A schemes section explains Karnataka farmer schemes.

**How it works**
1. Farmer uploads a geotagged photo of the vegetables.
2. Price is set within ±10% of the market rate.
3. Buyer picks a district and orders from 5 kg.
4. Delivery by shared truck, small vehicle or door.

## Features

### Buyer
- Home page, then select state (Karnataka) and district: Kolar, Chikkaballapur, Bengaluru Rural, Tumakuru, Mandya, Mysuru, Hassan, Davanagere, Belagavi, Dharwad
- Vegetable list with the farmer's photo, quantity available and price per kg
- Quantity selection with a 5 kg minimum
- Mobile and OTP login for new users
- Delivery choice, checkout and order confirmation

### Farmer
- Login with no platform fee
- Take geotagged photos (1 to 3 per vegetable)
- Set a price within ±10% of the market price
- Publish listings visible to buyers in the selected district
- Update order status: New, Packed, On the way, Delivered

### Geotagged photo checks

| Check | What it does | If it fails |
|---|---|---|
| Location permission | Reads GPS when the photo is taken | Upload blocked |
| District match | Compares photo location with the selected district | Listing not published |
| Time check | Rejects photos older than a set time (e.g. 24 hours) | Photo rejected |
| Duplicate photo check (future) | Detects a photo reused for another listing | Listing flagged |

Buyers see a badge such as "Photo verified: taken in Kolar, today 7:10 AM". Exact coordinates are hidden. Only district or village is shown.

### Pricing rule
The market price comes from public mandi data (for example Agmarknet) or an admin-maintained table. If tomato is ₹20/kg, the farmer can set ₹18 to ₹22/kg. Anything outside is blocked.

### Delivery options (sample charges)

| Option | Best for | Charge |
|---|---|---|
| Shared truck | Small orders, collected from a pickup point | ₹30 |
| Small goods vehicle | Same-day delivery to the buyer's area | ₹180 |
| Door delivery | Straight to the doorstep | ₹250 |

### Government schemes shown to farmers
Raitha Siri, MSP buying (Kharif 2026-27), Totapuri mango price support, and FRUITS ID.
> Scheme details are taken from news reports and can change. Check the Karnataka Department of Agriculture's official pages before relying on exact figures.

### Admin
- Upload farmer and buyer data as CSV or Excel (name, phone, district)
- If an Aadhaar column exists, only the last 4 digits are kept
- Admin area protected by a PIN

## Security and privacy
- OTP login for farmers and buyers
- Aadhaar masked, last 4 digits only
- Photo locations shown only at district or village level
- Farmers consent to location and data use before uploading
- Payments through a trusted gateway in the live version

## Technology

**Prototype:** [EDIT: Python + Streamlit, Pillow, pandas / or React + Vite + TypeScript + Tailwind built with Lovable]

**Planned:** SQLite or PostgreSQL, SMS OTP service, payment gateway such as Razorpay, live mandi price feed, browser geolocation for photo geotags.

**Current status:** the prototype simulates OTP and payments. Geotag capture is the next feature to add.

## Run locally

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git
cd YOUR-REPO
# Streamlit version:
pip install -r requirements.txt
python -m streamlit run app.py
# React / Lovable version:
npm install
npm run dev
```

## Benefits
- **Farmers:** better prices, direct buyers, no platform fee, help with transport
- **Buyers:** fresh produce, photo proof of quality, simple ordering from 5 kg
- **Society:** less food waste, transparent prices, stronger rural incomes

## Future scope
- More states and crops (fruits, cereals, pulses, millets)
- Price forecasting and oversupply warnings
- Kannada and other regional languages, voice input, WhatsApp ordering
- Live vehicle tracking

## Team
[Team name]: [Your name] – [role], [Teammate] – [role]

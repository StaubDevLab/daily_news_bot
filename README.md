# 🗞️ DailyBrief-AI-Robot

[![Daily Brief Robot](https://github.com/StaubDevLab/daily_news_bot/actions/workflows/daily.yml/badge.svg)](https://github.com/StaubDevLab/daily_news_bot/actions/workflows/daily.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An automated daily news curation engine that acts as your personal press officer. It collects raw news from multiple sources, uses **Google Gemini 2.0 Flash** to summarize and deduplicate them, and dispatches a curated brief to your Email and Telegram.



## ✨ Features

- **Multi-Source Fetching**: Integrates with NewsData.io API and custom RSS feeds (Sud-Ouest, Journal du Geek).
- **Smart Weather Integration**: Fetches local weather via Open-Meteo to provide a personalized running forecast.
- **AI-Powered Curation**: Uses Gemini 2.0 Flash to:
  - Select the 3 most relevant articles per category.
  - Summarize each article in one punchy sentence.
  - Deduplicate news appearing in multiple categories.
  - Generate a "Global TL;DR" summary of the day.
- **Dual Delivery**:
  - 📧 **Beautiful Emails**: Clean, mobile-responsive HTML layouts via Resend.
  - 📱 **Telegram Alerts**: Instant photo-messages with captions for every top story.
- **Zero Maintenance**: Runs automatically every morning using **GitHub Actions**.

## 🛠️ Tech Stack

- **Runtime**: Node.js (TypeScript)
- **AI Model**: Google Gemini 2.0 Flash
- **APIs**: NewsData.io, Resend, Open-Meteo
- **Automation**: GitHub Actions

## 🚀 Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone [https://github.com/your-username/dailybrief-ai-robot.git](https://github.com/your-username/dailybrief-ai-robot.git)
   cd dailybrief-ai-robot



2. **Install dependencies**:
```bash
npm install

```


3. **Environment Variables**:
Create a `.env` file in the root directory:
```env
NEWSDATA_API_KEY=your_newsdata_key
GEMINI_API_KEY=your_google_ai_studio_key
RESEND_API_KEY=your_resend_key
TELEGRAM_TOKEN=your_bot_father_token
TELEGRAM_CHAT_ID=your_personal_chat_id
MY_EMAIL=your_delivery_email
LATITUDE=your_position_latitude  
LONGITUDE=your_position_longitude

```


4. **Build and Run**:
```bash
npx tsc
node dist/index.js

```



## 🤖 Automation with GitHub Actions

This project includes a pre-configured workflow in `.github/workflows/daily.yml`.

To activate it:

1. Go to your GitHub Repository **Settings**.
2. Navigate to **Secrets and variables > Actions**.
3. Add all the keys from your `.env` file as **New repository secrets**.
4. The bot will now run automatically at 07:00 UTC every day.

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Generated with ❤️ by DailyBrief AI

```

### Next Step
Your project is now fully documented and ready to shine! Would you like me to help you write the **GitHub Action YAML** file or the **tsconfig.json** to ensure the build works perfectly on the first try?

```
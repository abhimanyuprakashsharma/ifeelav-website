<div align="center">

# 🎬 IFEELAV
### Luxury Cinematic Media Discovery & OTT Streaming Aggregator

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live%20App-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://ifeelav-website.vercel.app)
[![TMDB API](https://img.shields.io/badge/TMDB-API%20v3-01b4e4?style=for-the-badge&logo=themoviedatabase&logoColor=white)](https://www.themoviedb.org)
[![Firebase Auth](https://img.shields.io/badge/Firebase-Authentication-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Modern%20UI-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

<p align="center">
  <b>A sleek, high-performance web platform for discovering, exploring, and tracking movies, TV series, anime, and Bollywood hits with real-time OTT availability in India and instant multi-server streaming playback.</b>
</p>

[**🌐 Live Demo**](https://ifeelav-website.vercel.app) • [**✨ Features**](#-key-features) • [**🛠️ Tech Stack**](#%EF%B8%8F-technology-stack) • [**🚀 Getting Started**](#-getting-started) • [**⚖️ Legal Disclaimer**](#%EF%B8%8F-legal-disclaimer)

---

</div>

## 📖 About The Project

**IFEELAV** is a full-stack media curation web application designed to solve the problem of content fragmentation across modern streaming platforms. Rather than opening five different apps to check where a title is streaming, IFEELAV aggregates global catalogs (powered by **The Movie Database - TMDB**) with region-specific streaming availability (powered by **JustWatch**), user authentication, personal watchlists, official YouTube trailers, and multi-server preview streaming.

The platform is designed with a **luxury dark velvet & gold aesthetic** inspired by premium cinema branding and private club interfaces.

---

## ✨ Key Features

### 1. 🔍 Unified Movie & Series Exploration
- **Cross-Industry Catalogs:** Trending Worldwide, Hollywood Blockbusters, Bollywood Cinema, Anime Universe, and K-Drama Sensations.
- **Auto Type Detection:** Seamless handling of both Movies (runtime, director, box office) and TV Shows (seasons, episodes, creators).
- **Fast Live Search:** Instant debounced multi-search across millions of titles with media badges and poster previews.

### 2. 🍿 "Where to Watch" (Official OTT Directory)
- Real-time detection of official streaming platforms for India (`IN`) and international regions.
- Official badges and 1-click links for:
  - **Netflix**, **Disney+ Hotstar**, **Amazon Prime Video**
  - **JioCinema**, **Zee5**, **Sony LIV**, **Apple TV+**, **YouTube Movies**
- Direct fallback to YouTube full movie search for classic and freely distributed cinema.

### 3. 🎥 Multi-Server In-App Video Player
- Seamless popup cinema player with zero external redirects.
- **4 Fallback Stream Servers** to ensure continuous uptime and playback.
- **TV Episode Switcher:** Play any specific season and episode with a single click.
- **Official Trailer Mode:** High-definition official YouTube trailers embedded directly.

### 4. 🔖 Account & Watchlist System
- Integrated **Firebase Authentication** for user sign-in and sign-up.
- LocalStorage caching with profile sync for saving titles to **My Watchlist**.
- Responsive drawer with instant remove and title jump.

### 5. 💎 Luxury Cinematic Interface
- Designed with **Cinzel** luxury serif and **Plus Jakarta Sans** typography.
- Glassmorphic translucent surfaces with backdrop blur effects.
- Dynamic Ken-Burns hero banner showcase with auto-rotation and interactive slide dots.
- Zero layout shift using smooth animated shimmer skeleton loaders.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | HTML5, Modern JavaScript (ES6 Modules), Tailwind CSS, FontAwesome 6, Google Fonts |
| **Backend / API** | Node.js, Vercel Serverless Functions (`/api/*`) |
| **Authentication** | Google Firebase Authentication (`firebase/auth`) |
| **Data Providers** | TMDB REST API v3 (Movies, TV, Cast, Videos), JustWatch Streaming Providers API |
| **Deployment** | Vercel Edge Network |

---

## 📁 Repository Architecture

```text
ifeelav-website/
├── api/
│   ├── getShows.js       # TMDB Catalog discovery, search, genre filtering & person sanitization
│   ├── getDetails.js     # Unified media details, cast credits, trailers & OTT providers
│   ├── getEpisodes.js    # TV season & episode breakdown with still thumbnails & runtimes
│   └── getStream.js      # Watch provider fallback engine
├── index.html            # Main responsive Single Page Application (SPA)
├── vercel.json           # Vercel routing rules, CORS headers & security policies
├── .gitignore            # Git exclusion rules
└── README.md             # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) (v18 or higher recommended)
- A free API key from [The Movie Database (TMDB)](https://www.themoviedb.org/settings/api)

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/abhimanyuprakashsharma/ifeelav-website.git
   cd ifeelav-website
   ```

2. **Run with local server:**
   You can run the built-in development server:
   ```bash
   node dev-server.mjs
   ```
   Or use any local static server:
   ```bash
   npx serve .
   ```

3. **Open in Browser:**
   Visit `http://localhost:3000` in your browser.

### Deploying to Vercel

1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import `ifeelav-website`.
4. (Optional) Set your environment variables in Vercel Project Settings:
   - `TMDB_BEARER_TOKEN`: Your TMDB API Read Access Token
5. Click **Deploy**. Vercel will automatically configure serverless functions and routing!

---

## ⚖️ Legal Disclaimer

> [!NOTE]
> **Educational & Portfolio Purpose Only:**
> **IFEELAV** is a non-commercial web development and API integration portfolio project created for educational and design showcase purposes. 
> 
> - **Content Ownership:** IFEELAV does not host, store, or upload any video files, media, or copyrighted content on its servers. All metadata, imagery, and synopsis data are provided by [The Movie Database (TMDB)](https://www.themoviedb.org) under API terms of use.
> - **OTT Guidance:** IFEELAV actively encourages users to support filmmakers and content creators by watching films through licensed official OTT subscription platforms (Netflix, Amazon Prime Video, Disney+ Hotstar, JioCinema, etc.).
> - **Embedded Players:** Video players embedded within the application utilize third-party public web indexing services and official YouTube embed APIs. IFEELAV holds no affiliation with or control over third-party servers.

---

## 👨‍💻 Author

**Abhimanyu Sharma**
- GitHub: [@abhimanyuprakashsharma](https://github.com/abhimanyuprakashsharma)
- Instagram: [@axviixv](https://instagram.com/axviixv)

---

<div align="center">
  <sub>Built with ❤️ by Abhimanyu Sharma. Star ⭐ this repository if you find it helpful!</sub>
</div>

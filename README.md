<p align="center">
  <img src="build/icon.png" alt="Bloxsint Enhanced" width="128" height="128">
</p>

<h1 align="center">Bloxsint Enhanced</h1>

<p align="center">
  <strong>Advanced Roblox OSINT Tool</strong><br>
  A modern Electron-based desktop application for Roblox user investigations
</p>

---

## Features

- **Profile Scraper** — Username, display name, bio, account age
- **Game Played Scraper** — View games a user has played
- **Personal Information** — Age, birthday estimation from bio
- **Discord Resolver** — Roblox → Discord (ID, username, tag)
- **Friends Finder** — Discover friend list and names
- **Groups** — View group memberships and roles
- **Previous Usernames** — Track username history
- **Modern GUI** — Clean, intuitive Electron interface

---

## Quick Start

### Option 1: Run the Executable (Easiest)
1. Download the latest release from [Releases](https://github.com/Unaffiliated-Network/bloxsint/releases)
2. Extract the zip file
3. Double-click `Bloxsint Enhanced.exe`

### Option 2: Run from Source

**Prerequisites:**
- [Node.js](https://nodejs.org/) v18+

**Setup:**
```bash
git clone https://github.com/Unaffiliated-Network/bloxsint
cd bloxsint
npm install
```

**Run:**
```bash
npm start
```

Or double-click `Start Bloxsint.bat` in the project folder.

---

## Building

To build the Windows executable:

```bash
npm run build:win
```

The output will be in `dist/Bloxsint Enhanced-win32-x64/`

---

## License

MIT License

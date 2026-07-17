# ScholarVault 🎓

**Your Academic Universe, Organized.**

ScholarVault is a global, open repository where university students can search, upload, and share lecture notes, handouts, past questions, and study guides — across any institution, without silos.

![ScholarVault Hero](https://raw.githubusercontent.com/your-username/scholarvault/main/public/social-preview.png)

---

## ✨ Features

- 🔍 **Instant Full‑Text Search** – Find notes by course code, title, or description in under 10ms.
- 📂 **Unified Global Index** – No departmental or university silos: all resources in one place.
- 🔒 **Secure Access** – Download links are protected behind authentication with time‑limited signed URLs.
- 🗃️ **Private Storage Buckets** – All files are stored securely; only authenticated users can access them.
- 👤 **User Profiles** – Custom avatar, department, level; editable at any time.
- 🚀 **Re‑captcha v3** – Bot protection on sign‑up/login forms.
- 🌗 **Dark/Light Mode** – Full theme support with system preference detection.
- 📱 **Responsive Design** – Works beautifully on mobile, tablet, and desktop.

---

## 🧰 Tech Stack

| Layer    | Technology                                               |
| -------- | -------------------------------------------------------- |
| Frontend | React (Vite), Tailwind CSS, Framer Motion                |
| Backend  | Supabase (Auth, DB, Storage, Edge Functions)             |
| Database | PostgreSQL 15+ with Row‑Level Security & GIN indexes     |
| Search   | Functional GIN index + `plainto_tsquery` RPC             |
| Security | RLS, column‑level grants, anti‑XSS triggers, signed URLs |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Supabase](https://supabase.com/) account & project

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/scholarvault.git
   cd scholarvault
   ```

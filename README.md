# CYBER-SHINOBI // Neon Outbreak

A mobile-first card crawler web game inspired by *Look, Your Loot!*, built with **React**, **Vite**, and **Tailwind CSS**.

---

## 🎮 How to Play

1. **The 3x3 Grid**: You control the **Neon Shinobi** on a 3x3 board.
2. **Movement & Combat**:
   - **Tap** an orthogonally adjacent card to view a real-time combat preview badge.
   - **Tap again** (or **Swipe** Up, Down, Left, Right) to strike and move into that slot.
   - **Desktop Controls**: Use `W`, `A`, `S`, `D` or `Arrow Keys` to move, and `Spacebar` for Ninjutsu.
3. **Look, Your Loot Math**:
   - **Equipped Blade** absorbs enemy power first.
   - **Energy Shield** absorbs leftover damage.
   - Any remaining damage hurts **HP**.
   - Defeating enemies grants score, nanites, and charges your Ki meter.
4. **Ninjutsu — Shuriken Barrage**:
   - Slaying bio-mutants charges your Ki to 100%.
   - Tap the glowing **Shuriken Barrage** button (or hit `Spacebar`) to deal **4 direct damage** to all active enemies on the board.
5. **Floor Progression**:
   - Clear through the Floor Deck of bio-mutants, stimpacks, shields, and laser traps.
   - Once the deck runs out, the **Security Elevator** drops onto the board.
   - Move onto the elevator to ascend to the next sector (+250 bonus score).
   - Sector Bosses await every 5th floor!

---

## 🚀 Running the Project

```bash
# Start development server
npm run dev

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🌐 CI/CD & Deployment

Deployments are automated through **GitHub Actions** via `.github/workflows/deploy.yml`:

- **Production (`main` branch)**: Pushing or merging into `main` automatically builds and deploys to **Minty.red** (`minty.red`). Only public games (e.g. Orbitdrop) are exposed.
- **Development (`dev` branch)**: Pushing or merging into `dev` automatically builds and deploys to the **Dev / Staging** site (`dev.minty.red`). All games and the Studio Dashboard (`/dash`) are unlocked.
- **Pull Requests**: Pull requests generate an isolated preview deployment on Cloudflare Pages.

### Required GitHub Secrets
Under **Settings > Secrets and variables > Actions** in the GitHub repository, configure:
- `CLOUDFLARE_API_TOKEN`: Cloudflare API token with `Cloudflare Pages:Edit` permissions.
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare Account ID (found on the Cloudflare Dashboard overview / Workers & Pages page).

### Cloudflare Pages Custom Domains
In your Cloudflare Pages dashboard under project `minty-red` > **Custom domains**:
- `minty.red` mapped to the production deployment (`main` branch).
- `dev.minty.red` mapped to the `dev` branch.


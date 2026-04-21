# Deploy len GitHub Pages

## Cach nhanh nhat
1. Tao repo moi tren GitHub.
2. Upload toan bo source code len repo do.
3. Vao **Settings > Pages**.
4. O muc **Build and deployment**, chon **Source = GitHub Actions**.
5. Push code len branch `main`.
6. Vao tab **Actions** de theo doi deploy.
7. Sau khi xong, web se co dang:
   - `https://USERNAME.github.io/REPO/`
   - Hoac `https://USERNAME.github.io/` neu repo ten la `USERNAME.github.io`

## Luu y
- File `vite.config.ts` da duoc sua de tu canh chinh `base` khi build tren GitHub Actions.
- Workflow deploy da nam o `.github/workflows/deploy.yml`.

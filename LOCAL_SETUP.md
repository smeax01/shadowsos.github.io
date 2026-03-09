# Setup local (MySQL + app)

## 1) Variables d'environnement

```bash
cp .env.example .env
```

## 2) Démarrer MySQL local (Docker)

```bash
docker compose up -d
```

La base `shadowos4_db` et la table `users` sont créées automatiquement.

## 3) Lancer l'app

```bash
npm install
npm run dev
```

## 4) Vérifier la DB

```bash
docker exec -it shadow2-mysql mysql -ushadowos_user -pdZ4rLdPw47?!mmlb shadowos4_db -e "SHOW TABLES;"
```

## 5) Supprimer un compte par email

```bash
docker exec -it shadow2-mysql mysql -ushadowos_user -pdZ4rLdPw47?!mmlb shadowos4_db -e "DELETE FROM users WHERE email='smeax.professionnel';"
```

## 6) Push GitHub

```bash
git add .
git commit -m "feat(auth): stabilize local login/register + local mysql setup"
git push origin main
```

## Note déploiement

Un projet Astro avec `output: "server"` + MySQL n'est pas compatible GitHub Pages (statique).
Il faut un hébergement Node (Plesk Node app, VPS, Render, Railway, etc.).

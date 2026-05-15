# 🎨 DropLuck — Site de designs premium à tirer au sort

Site mobile-first ultra fluide pour découvrir des designs à imprimer sur vêtements.

---

## 🚀 LANCER LE PROJET EN 5 ÉTAPES

### 1. Installer Node.js
Télécharge sur https://nodejs.org (version LTS recommandée)

### 2. Ouvrir le terminal dans le dossier
```bash
cd C:\dropluck
npm install
```

### 3. Configurer les variables d'environnement
Copie le fichier `.env.example` et renomme-le `.env.local` :
```bash
copy .env.example .env.local
```
Ouvre `.env.local` et remplis tes clés Supabase (voir ci-dessous).

### 4. Configurer Supabase
1. Crée un compte sur https://supabase.com
2. Crée un nouveau projet
3. Va dans Settings → API → copie les clés dans `.env.local`
4. Va dans SQL Editor → colle le contenu de `supabase/schema.sql` → clique Run

### 5. Lancer
```bash
npm run dev
```
Ouvre http://localhost:3000 🎉

---

## 💳 PAIEMENTS INTÉGRÉS

### Wave
- Lien direct : `https://pay.wave.com/m/M_ci_qj5yNpWbOfPI/c/ci/?amount=11`
- Quand l'utilisateur clique "Wave" → il est redirigé vers ce lien
- Le paiement est enregistré comme "pending" dans Supabase

### Orange Money
- Numéro : `+225 07 14 39 45 27`
- L'utilisateur copie le numéro, fait son transfert, puis clique "J'ai payé"
- **L'admin doit confirmer manuellement dans le panel admin**

### Confirmer un paiement Orange Money (Admin)
1. Va sur `/admin`
2. Onglet "Paiements"
3. Clique "✓ Confirmer" sur chaque paiement vérifié
4. Cela ajoute automatiquement 1 tirage au compte utilisateur

---

## 🔐 ACCÈS ADMIN
URL : `/admin`
- Réservé uniquement à l'email défini dans `NEXT_PUBLIC_ADMIN_EMAIL`
- Dashboard statistiques complet
- Confirmation des paiements Orange Money

---

## 📁 STRUCTURE DU PROJET

```
dropluck/
├── src/
│   ├── app/
│   │   ├── page.tsx              ← Page d'accueil
│   │   ├── layout.tsx            ← Layout global
│   │   ├── compte/page.tsx       ← Connexion / Espace membre
│   │   ├── admin/page.tsx        ← Dashboard admin
│   │   ├── parrainage/page.tsx   ← Programme parrainage
│   │   ├── ref/[code]/page.tsx   ← Redirection liens parrainage
│   │   └── themes/[slug]/        ← Pages thèmes (SEO)
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── PaymentModal.tsx      ← Wave + Orange Money
│   │   ├── TirageModal.tsx       ← Animation enveloppe
│   │   ├── TesterModal.tsx       ← Essayage sur t-shirt
│   │   ├── ThemeCard.tsx
│   │   └── ReviewsSection.tsx
│   ├── context/
│   │   ├── AuthContext.tsx       ← Gestion connexion
│   │   └── DrawContext.tsx       ← État des tirages
│   ├── lib/
│   │   └── supabase.ts           ← Client Supabase + types
│   └── styles/
│       └── globals.css
├── supabase/
│   └── schema.sql                ← Base de données complète
├── .env.example                  ← Template variables
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## 🌐 DÉPLOIEMENT (Vercel)
1. Push ton code sur GitHub
2. Va sur https://vercel.com → "Import Project"
3. Ajoute toutes les variables de `.env.local` dans Vercel → Settings → Environment Variables
4. Deploy !

---

## 📞 SUPPORT
En cas de problème, vérifie :
- Que `.env.local` est bien rempli avec tes clés Supabase
- Que le schema SQL a bien été exécuté dans Supabase
- Que Node.js est installé (version 18+)

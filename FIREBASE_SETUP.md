# Firebase setup

## 1. Kreiraj Firestore bazu

U Firebase Console otvori **Firestore Database**, odaberi **Create database** i produkcijski način rada. Preporučena regija je ona najbliža većini kupaca.

## 2. Kreiraj service account ključ

Otvori **Project settings > Service accounts > Generate new private key**. Vrijednosti iz preuzetog JSON-a prenesi u `.env.local`:

```env
FIREBASE_PROJECT_ID=project_id
FIREBASE_CLIENT_EMAIL=client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

JSON datoteku sa service account ključem nemoj spremati u repozitorij. Iste tri varijable dodaj u Vercel za Production, Preview i Development okruženja.

## 3. Upiši početne proizvode

Nakon popunjavanja `.env.local` pokreni:

```bash
npm run seed:products
```

Skripta kreira ili ažurira devet dokumenata u kolekciji `products`. Može se sigurno ponovno pokrenuti jer koristi stabilne ID-jeve proizvoda i `merge` zapis.

## 4. Objavi sigurnosna pravila

Ako Firebase CLI još nije povezan s projektom:

```bash
npx firebase-tools login
npx firebase-tools use --add
npx firebase-tools deploy --only firestore:rules
```

Klijenti smiju čitati samo aktivne proizvode. Sve zapise, narudžbe i payment podatke obavlja isključivo Firebase Admin na serveru.

## Ponašanje aplikacije

- Kad su Admin varijable popunjene, Home, Shop, detalji proizvoda i `/api/products` čitaju Firestore.
- Rezultati se osvježavaju najkasnije svakih pet minuta (`revalidate = 300`).
- Bez Admin varijabli aplikacija koristi postojeći statični katalog, pa lokalni build ostaje funkcionalan.

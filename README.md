# CakeBloom – Custom Cake E-Commerce Platform

A responsive React + Vite storefront for a custom cake business in Sri Lanka.

## Run locally
1. Install **Node.js LTS**.
2. Extract this ZIP and open the `cakebloom` folder in VS Code.
3. Open Terminal → run:
   ```bash
   npm install
   npm run dev
   ```
4. Open the local URL shown by Vite (usually `http://localhost:5173`).

## Included demo features
- Responsive storefront, product catalogue, category filters and search
- Product quick view and shopping basket with quantity controls
- Checkout form with Cash on Delivery
- Custom cake request form (flavour, size, occasion, cake text, date and reference image URL)
- Customer inquiry form
- Demo sign-in and admin dashboard
- Order status management
- Browser localStorage persistence

## Demo admin
- Email: `admin@cakebloom.lk`
- Password: any password with at least 4 characters

Use any other email to try the customer sign-in flow.

## Important: demo mode vs production
This starter is immediately viewable without connecting a database. Orders, requests, inquiries and the demo account are stored in the current browser using `localStorage`. This is **not** secure production authentication or a shared database. The admin demo is only a front-end demonstration.

## Optional Firebase setup
1. Create a Firebase project at the Firebase Console.
2. Add a Web App and enable **Authentication** (Email/Password) and **Cloud Firestore**.
3. Copy `.env.example` to `.env`.
4. Add the Firebase web app values to the matching `VITE_FIREBASE_*` variables.
5. Restart the Vite server.

`src/firebase.js` initializes Firebase when the environment values are present. The UI currently remains in local demo mode; connect Firestore reads/writes and Firebase Auth before deploying for real customers. Add Firestore security rules and admin custom claims/role validation before production.

## Email notifications
EmailJS variables are included in `.env.example` as a future integration point. Create and configure EmailJS templates before enabling email sending. Never put private service credentials in frontend code.

## Main structure
```
src/
  App.jsx       Main storefront, forms, cart and demo admin
  data.js       Sample cake catalogue
  firebase.js   Optional Firebase initialization
  main.jsx      React entry point
  styles.css    Responsive styling
```

## Customization
- Change business name and page title in `index.html` and `src/App.jsx`.
- Edit sample products in `src/data.js`.
- Replace sample image URLs with your own licensed cake photographs.
- Update contact email, delivery policy, prices and testimonials before publishing.

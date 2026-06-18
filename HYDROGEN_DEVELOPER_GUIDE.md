# Hydrogen Developer Guide for Shriyam Studio

This project is a Shopify Hydrogen storefront. Think of it as a React app that runs on a Shopify-aware server runtime. The frontend is React, the routing and data loading are React Router, the commerce APIs are Shopify GraphQL APIs, and the production hosting target is usually Oxygen.

Official references used for this guide:

- Shopify Hydrogen/Oxygen fundamentals: https://shopify.dev/docs/storefronts/headless/hydrogen/fundamentals
- Oxygen deployments: https://shopify.dev/docs/storefronts/headless/hydrogen/deployments
- Hydrogen API reference: https://shopify.dev/docs/api/hydrogen/latest
- Shopify CLI `hydrogen deploy`: https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-deploy
- Customer Account API with Hydrogen: https://shopify.dev/docs/storefronts/headless/building-with-the-customer-account-api/hydrogen
- Storefront API reference: https://shopify.dev/docs/api/storefront/latest

## 1. The Big Picture

Hydrogen is Shopify's React-based framework for custom storefronts. You are not editing a normal Shopify Liquid theme here. You are building a separate headless storefront that talks to Shopify through APIs.

The stack in this repo is:

- React for UI components.
- React Router for routes, loaders, actions, SSR, and nested layouts.
- Hydrogen utilities for Shopify-specific APIs, cart, analytics, images, money, selected product options, and context.
- Storefront API for public commerce data such as products, collections, menus, cart, checkout URLs, search, and shop details.
- Customer Account API for logged-in customer data such as customer profile, addresses, and orders.
- Oxygen or Mini Oxygen for the runtime. Mini Oxygen is local development; Oxygen is Shopify's production hosting.
- Vite for bundling.

The request lifecycle is:

1. A browser requests a page, for example `/products/some-shirt`.
2. Oxygen or Mini Oxygen runs `server.js`.
3. `server.js` creates a Hydrogen context using `app/lib/context.js`.
4. React Router chooses the matching route file under `app/routes`.
5. The route `loader` fetches data from Shopify APIs on the server.
6. React renders HTML with that data.
7. The browser hydrates the React app and handles navigation.

## 2. Important Files in This Repo

### Root Files

- `package.json`
  - Scripts, dependencies, and Hydrogen version.
  - Important scripts:
    - `npm run dev`: local Hydrogen development server.
    - `npm run build`: production build and code generation.
    - `npm run preview`: build preview.
    - `npm run lint`: ESLint checks.
    - `npm run codegen`: Shopify GraphQL and React Router type generation.

- `server.js`
  - The server entry point for Oxygen/Mini Oxygen.
  - Creates the React Router request handler.
  - Adds committed session cookies to responses.
  - Uses Shopify redirects if the app returns a 404.

- `app/lib/context.js`
  - Creates the Hydrogen context for every request.
  - This is where `storefront`, `customerAccount`, `cart`, `session`, `env`, cache, and i18n become available to route loaders/actions.
  - Requires `SESSION_SECRET`.

- `app/root.jsx`
  - The root React Router layout.
  - Loads global header, footer, cart, login state, shop analytics, and consent data.
  - Wraps pages in `Analytics.Provider` and `PageLayout`.

- `app/routes.js`
  - Uses Hydrogen routes plus React Router file-based routes.
  - Routes mostly come from files in `app/routes`.

- `vite.config.js`
  - Build config.
  - Contains the `~` alias to `app`, so imports like `~/components/Header` work.

- `jsconfig.json`
  - Editor/module path config for `~/*`.

### App Folders

- `app/routes`
  - Page routes and server actions.
  - Examples:
    - `app/routes/_index.jsx`: homepage.
    - `app/routes/products.$handle.jsx`: product detail pages.
    - `app/routes/collections.$handle.jsx`: collection pages.
    - `app/routes/cart.jsx`: cart page and cart mutations.
    - `app/routes/account.jsx`: account layout and customer query.
    - `app/routes/account_.login.jsx`, `account_.logout.jsx`, `account_.authorize.jsx`: customer account auth flow.

- `app/components`
  - Reusable UI components.
  - Examples:
    - `PageLayout.jsx`: header, footer, cart aside, search aside, mobile menu.
    - `Header.jsx`: navigation.
    - `ProductForm.jsx`: variants and add-to-cart UI.
    - `CartMain.jsx`, `CartLineItem.jsx`, `CartSummary.jsx`: cart display.

- `app/graphql/customer-account`
  - Customer Account API GraphQL queries and mutations.

- `app/lib`
  - Shared logic such as Shopify context, fragments, session, search helpers, redirects, and variant helpers.

- `app/styles`
  - Global CSS.

## 3. Mental Model: Loaders, Actions, and Components

Hydrogen uses React Router's server-side data model.

### Loaders

A `loader` runs on the server before rendering a route. Use it to fetch data needed to render a page.

Example from `app/routes/products.$handle.jsx`:

```jsx
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}
```

Then inside `loadCriticalData`:

```jsx
const {storefront} = context;

const [{product}] = await Promise.all([
  storefront.query(PRODUCT_QUERY, {
    variables: {handle, selectedOptions: getSelectedProductOptions(request)},
  }),
]);
```

This means:

- `context.storefront` is the Storefront API client.
- `PRODUCT_QUERY` is a GraphQL query string.
- The route fetches the product by handle.
- The React component reads the loader result with `useLoaderData()`.

### Actions

An `action` runs on the server when a form submits a non-GET request. Use it for mutations.

Example from `app/routes/cart.jsx`:

```jsx
export async function action({request, context}) {
  const {cart} = context;
  const formData = await request.formData();
  const {action, inputs} = CartForm.getFormInput(formData);

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines);
      break;
  }
}
```

This means:

- Cart updates are server-side actions.
- `CartForm` serializes the form in a Shopify-compatible way.
- `context.cart` talks to Shopify cart APIs.
- The cart ID is saved in a session/cookie so the same customer keeps the same cart.

### Components

Components render the UI. They should mostly receive already-loaded data from loaders, props, or React Router context.

Example:

- `app/root.jsx` loads `header`, `footer`, `cart`, and `isLoggedIn`.
- `app/components/PageLayout.jsx` receives those values and renders `Header`, `Footer`, `CartAside`, `SearchAside`, and page children.

## 4. How This App Calls Shopify APIs

There are two main Shopify APIs in this app.

### Storefront API

Used for public storefront commerce data:

- Products
- Collections
- Menus
- Shop info
- Cart
- Search
- Checkout URL
- Product variants

How it is called:

```jsx
const {storefront} = context;

const data = await storefront.query(SOME_QUERY, {
  variables: {...},
  cache: storefront.CacheLong(),
});
```

Where you see it:

- `app/root.jsx`
  - `HEADER_QUERY`
  - `FOOTER_QUERY`
  - shop analytics data
- `app/routes/products.$handle.jsx`
  - `PRODUCT_QUERY`
- `app/routes/collections.$handle.jsx`
  - collection query
- `app/routes/search.jsx`
  - search query
- `app/lib/fragments.js`
  - shared GraphQL fragments for cart, menus, header, footer

Important pattern:

- Use `storefront.query(...)` for reads.
- Use fragments to keep query fields reusable.
- Use caching for stable data such as menus.
- Avoid caching customer-specific data.

### Customer Account API

Used for logged-in customer data:

- Customer profile
- Orders
- Addresses
- Authentication status
- Customer mutations

How it is called:

```jsx
const {customerAccount} = context;

const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
  variables: {
    language: customerAccount.i18n.language,
  },
});
```

Where you see it:

- `app/routes/account.jsx`
  - Loads current customer details.
- `app/routes/account.orders._index.jsx`
  - Loads customer orders.
- `app/routes/account.orders.$id.jsx`
  - Loads a specific order.
- `app/routes/account.addresses.jsx`
  - Reads and mutates addresses.
- `app/routes/account.profile.jsx`
  - Updates profile.
- `app/graphql/customer-account/*`
  - Customer Account API GraphQL documents.

Important pattern:

- Customer data should not be publicly cached.
- Account pages usually require the customer to be logged in.
- Customer Account API authentication requires proper callback/origin/logout URLs in Shopify admin.
- Shopify's docs say local Customer Account API auth should use a public HTTPS tunnel such as ngrok, because `localhost` is not supported for that auth flow.

## 5. Environment Variables

Hydrogen uses environment variables for store credentials, domains, and session secrets.

Common variables you should expect:

- `SESSION_SECRET`
  - Required by `app/lib/context.js`.
  - Used to sign/encrypt session cookies.
  - Never commit the actual value.

- `PUBLIC_STORE_DOMAIN`
  - Your Shopify store domain, often something like `your-store.myshopify.com`.
  - Used in root/layout and context.

- `PUBLIC_STOREFRONT_API_TOKEN`
  - Public Storefront API token.
  - Used by Hydrogen's Storefront API client.

- `PUBLIC_STOREFRONT_ID`
  - Storefront ID for analytics.

- `PUBLIC_CHECKOUT_DOMAIN`
  - Checkout domain used for consent/analytics and checkout behavior.

- `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID`
  - Public client ID for Customer Account API auth.
  - Required for logged-in customer account flow.

Do not:

- Commit `.env`.
- Put Admin API tokens in frontend code.
- Put private tokens in React components.
- Print tokens in logs.

Do:

- Keep local variables in `.env`.
- Configure production/staging variables in the Hydrogen storefront/Oxygen environment settings in Shopify admin.
- Redeploy an Oxygen environment after changing environment variables.

## 6. Local Development

Install dependencies:

```bash
npm install
```

Start local development:

```bash
npm run dev
```

Run a production build locally:

```bash
npm run build
```

Run code generation:

```bash
npm run codegen
```

Run lint:

```bash
npm run lint
```

Current note for this repo: `npm run build` passes. `npm run lint` currently has unrelated existing lint issues, including unused variables and a missing `tsconfig.json` reference for `env.d.ts`.

## 7. How Routing Works

This app uses file-based routes.

Examples:

- `app/routes/_index.jsx` maps to `/`.
- `app/routes/products.$handle.jsx` maps to `/products/:handle`.
- `app/routes/collections.$handle.jsx` maps to `/collections/:handle`.
- `app/routes/cart.jsx` maps to `/cart`.
- `app/routes/account.jsx` is the parent account route.
- `app/routes/account.orders._index.jsx` maps to `/account/orders`.
- `app/routes/account.orders.$id.jsx` maps to `/account/orders/:id`.

Special naming:

- `$handle` means a dynamic URL parameter.
- `_index` means the default child route.
- Dots usually create nested route paths.
- Files like `[robots.txt].jsx` and `[sitemap.xml].jsx` map literal special paths.

When adding a new page:

1. Create a new file in `app/routes`.
2. Export a `loader` if the page needs server data.
3. Export a default component for UI.
4. Add GraphQL query strings in the same file or in `app/graphql`/`app/lib/fragments.js` if reusable.

## 8. Header, Footer, Cart, and Global Layout

The root route controls global data.

In `app/root.jsx`:

- `loadCriticalData` loads the header menu with `HEADER_QUERY`.
- `loadDeferredData` starts footer, cart, and login-state loading.
- `PageLayout` receives the global data.
- `Analytics.Provider` wraps the whole app.

In `app/components/PageLayout.jsx`:

- `CartAside` renders cart drawer content.
- `SearchAside` renders predictive search.
- `MobileMenuAside` renders mobile navigation.
- `Header` and `Footer` are shared across pages.

Rule of thumb:

- Put site-wide data in `app/root.jsx`.
- Put page-specific data in the route file.
- Put reusable UI in `app/components`.

## 9. Cart Flow

Cart state is handled by Hydrogen's cart utilities.

Important files:

- `app/routes/cart.jsx`
- `app/components/ProductForm.jsx`
- `app/components/AddToCartButton.jsx`
- `app/components/CartMain.jsx`
- `app/components/CartLineItem.jsx`
- `app/components/CartSummary.jsx`
- `app/lib/fragments.js`

Typical add-to-cart flow:

1. Product page loads product/variant data.
2. `ProductForm` renders variant options and add-to-cart UI.
3. `AddToCartButton` submits a `CartForm`.
4. `app/routes/cart.jsx` action receives the form submission.
5. The action calls `context.cart.addLines(...)`.
6. Hydrogen returns cart data and a cart ID.
7. The cart ID is saved in a session cookie.
8. The cart drawer/page re-renders with the updated cart.

Do:

- Use `CartForm` and `context.cart` for cart changes.
- Keep cart mutations in route actions.
- Return proper headers from cart actions so the cart ID/session is preserved.

Do not:

- Directly call Shopify cart mutations from random browser components unless you have a very specific reason.
- Store cart IDs manually in localStorage when Hydrogen session handling already does it.

## 10. Customer Account Flow

Customer account features use Shopify's Customer Account API.

Important files:

- `app/routes/account.jsx`
- `app/routes/account_.login.jsx`
- `app/routes/account_.logout.jsx`
- `app/routes/account_.authorize.jsx`
- `app/routes/account.profile.jsx`
- `app/routes/account.addresses.jsx`
- `app/routes/account.orders._index.jsx`
- `app/routes/account.orders.$id.jsx`
- `app/graphql/customer-account/*`

Important Shopify admin configuration:

- Install/configure the Hydrogen sales channel or Headless channel.
- Open the storefront settings.
- Configure Customer Account API.
- Add allowed callback URI, for example:
  - Production: `https://your-domain.com/account/authorize`
  - Local tunnel: `https://your-ngrok-domain/account/authorize`
- Add JavaScript origins.
- Add logout URI.
- Set `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID`.

Local auth note:

- Customer Account API auth does not work with plain `localhost`.
- Use a public HTTPS tunnel such as ngrok for login testing.
- If using ngrok or another tunnel, also update Vite allowed hosts and Content Security Policy if needed.

## 11. Deployment: How to Push Changes to Shopify

There are two common deployment paths.

### Recommended Path: GitHub Connected to Oxygen

This is the normal team workflow.

1. Commit your changes locally.
2. Push to GitHub.
3. Shopify Oxygen detects the branch update.
4. Oxygen builds and deploys the Hydrogen app.
5. Shopify admin shows deployment status, logs, preview URLs, and rollback options.

Typical Git commands:

```bash
git status
git add .
git commit -m "Describe your change"
git push origin main
```

Your exact branch might be `main`, `production`, `staging`, or another branch depending on how the Hydrogen storefront is configured in Shopify admin.

Before pushing:

```bash
npm run build
npm run lint
```

If lint has known existing issues, do not ignore new errors from your own work. Fix what you changed.

### Manual Deploy Path: Shopify CLI

Shopify also supports CLI deployment.

The official CLI command is:

```bash
shopify hydrogen deploy
```

The CLI deploy flow requires an Oxygen deployment token unless the storefront is linked and can use the linked token automatically. The token can be provided using `--token` or the `SHOPIFY_HYDROGEN_DEPLOYMENT_TOKEN` environment variable.

Use this when:

- You are not using GitHub continuous deployment.
- You need a one-off manual deployment.
- The project is already linked to the Shopify Hydrogen storefront.

Do not paste deployment tokens into source code.

## 12. Oxygen Deployment Concepts

Oxygen is Shopify's hosting platform for Hydrogen.

Important concepts:

- Environment
  - A target such as production, preview, or a custom environment.

- Deployment
  - A snapshot of code and environment variables at a point in time.
  - Shopify docs describe Oxygen deployments as immutable.

- Preview/shareable link
  - A temporary URL used for QA or stakeholder review.

- Rollback
  - Points an environment URL back to an older deployment.
  - Rollback does not delete or rebuild deployments.

- Redeploy
  - Re-runs the current deployment with current environment variables.
  - Useful after changing env vars in Shopify admin.

Important warning:

- If you change environment variables, old immutable deployments do not automatically get new values. Redeploy the affected environment.

## 13. Development Do's

- Run `npm run build` before pushing important changes.
- Keep route data fetching in loaders.
- Keep mutations in route actions.
- Use Hydrogen helpers before inventing custom Shopify API clients.
- Use `context.storefront` for Storefront API.
- Use `context.customerAccount` for Customer Account API.
- Use `context.cart` for cart operations.
- Keep GraphQL fragments reusable when multiple routes/components need the same fields.
- Add only the fields you actually need in GraphQL queries.
- Handle missing Shopify data with 404s or clear fallback UI.
- Use `Promise.all` for independent critical queries.
- Defer non-critical data when it should not block the first render.
- Keep customer/account responses private and uncached.
- Keep environment secrets out of Git.
- Test product pages, collection pages, cart, checkout link, search, and customer login before production releases.
- Use Shopify admin deployment logs when Oxygen builds fail.

## 14. Development Don'ts

- Do not treat this like a Liquid theme. There is no `theme.liquid` here.
- Do not use Admin API tokens in frontend code.
- Do not commit `.env`, deployment tokens, private keys, or customer data.
- Do not fetch private customer data from client-only components.
- Do not cache customer-specific data with long-lived public caching.
- Do not mutate cart/customer state directly in UI components when a route action is the correct place.
- Do not remove session/header handling from `server.js` unless you know the auth/cart impact.
- Do not change GraphQL query fields without checking the generated types/build.
- Do not assume `localhost` login works for Customer Account API.
- Do not push directly to production without at least building locally.
- Do not rely only on visual checks; test real cart and checkout behavior.

## 15. Common Tasks

### Add a New Static Page

Create a route:

```txt
app/routes/about.jsx
```

Then:

```jsx
export default function About() {
  return <main>About Shriyam Studio</main>;
}
```

### Add a Product Data Field

1. Open `app/routes/products.$handle.jsx`.
2. Add the field to `PRODUCT_FRAGMENT`.
3. Use it in the component.
4. Run:

```bash
npm run codegen
npm run build
```

### Add a Header Menu Item

Usually do this in Shopify admin, not code:

1. Shopify admin.
2. Content or Online Store navigation area, depending on store setup.
3. Edit the menu with handle `main-menu`.
4. The app fetches it through `HEADER_QUERY` in `app/root.jsx`.

If the menu handle changes, update this in `app/root.jsx`:

```jsx
variables: {
  headerMenuHandle: 'main-menu',
}
```

### Add Footer Links

Usually do this in Shopify admin by editing the menu with handle `footer`.

If the footer menu handle changes, update this in `app/root.jsx`:

```jsx
variables: {
  footerMenuHandle: 'footer',
}
```

### Add a Custom API or CMS

Add the client in `app/lib/context.js`:

```jsx
const additionalContext = {
  // cms: await createCMSClient(env),
};
```

Then use it in loaders:

```jsx
export async function loader({context}) {
  const data = await context.cms.getSomething();
  return {data};
}
```

Keep secrets in environment variables, not components.

## 16. Debugging Checklist

### Module Import Error

Check:

- Does the file exist?
- Is the import path correct?
- Does `~` resolve to `app` in `vite.config.js`?
- Is the filename case correct?

### Storefront API Error

Check:

- Is the query valid for the Storefront API version?
- Are variables correct?
- Does the product/collection/menu exist in Shopify?
- Is the item published to the correct sales channel?
- Are required environment variables set?

### Customer Login Error

Check:

- Is `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID` set?
- Are callback/origin/logout URLs configured in Shopify admin?
- Are you testing through HTTPS/ngrok instead of localhost?
- Is the customer account route returning no-cache headers?

### Cart Not Persisting

Check:

- Is `SESSION_SECRET` set?
- Is `server.js` committing the session cookie?
- Is the cart action returning headers from `cart.setCartId(...)`?
- Are browser cookies blocked?

### Oxygen Build Fails

Check:

- Build logs in Shopify admin.
- Missing environment variables.
- Node version compatibility.
- GraphQL/codegen errors.
- Case-sensitive import paths.
- Build locally with `npm run build`.

## 17. Pre-Push Checklist

Before pushing to a connected Shopify/Oxygen environment:

```bash
git status
npm run build
npm run lint
```

Then manually test:

- Home page loads.
- Product page loads.
- Variant selection works.
- Add to cart works.
- Cart drawer/page updates.
- Checkout URL opens.
- Search works.
- Collections load.
- Account login/logout works if your change touched account behavior.
- Header/footer menus look correct.

Then:

```bash
git add .
git commit -m "Your message"
git push origin <branch-name>
```

After pushing:

- Check the Oxygen deployment status in Shopify admin.
- Open the deployment preview or production URL.
- Watch logs if something fails.
- Roll back from Shopify admin if production is broken.

## 18. Safe Way to Learn This Codebase

If you are new to React and Hydrogen, learn in this order:

1. React components and props.
2. React Router route files, loaders, actions, and `useLoaderData`.
3. Hydrogen context: `storefront`, `cart`, `customerAccount`, `env`, and `session`.
4. Storefront API GraphQL queries.
5. Cart actions and `CartForm`.
6. Customer Account API auth and account routes.
7. Oxygen deployment and environment variables.

Best first files to read:

1. `server.js`
2. `app/lib/context.js`
3. `app/root.jsx`
4. `app/components/PageLayout.jsx`
5. `app/routes/products.$handle.jsx`
6. `app/routes/cart.jsx`
7. `app/routes/account.jsx`

Once these click, the rest of the app becomes much less mysterious.

## 19. Developing for Mobile and Desktop Web

This Hydrogen app is a responsive web storefront. You usually do not build a separate mobile app and a separate desktop app. You build one React/Hydrogen frontend that adapts to different screen sizes.

The key idea:

- Same route files.
- Same loaders and API calls.
- Same product/cart/customer data.
- Different layout behavior through CSS and sometimes conditional components.

### Current Responsive Pattern in This Repo

Important files:

- `app/styles/app.css`
  - Main responsive/global CSS.
  - Already contains media queries such as `@media (max-width: 45em)` and `@media (min-width: 45em)`.

- `app/styles/tailwind.css`
  - Imports Tailwind v4.
  - You can use Tailwind utility classes in JSX if you want, but this starter also uses normal CSS classes heavily.

- `app/components/Header.jsx`
  - Renders desktop menu and mobile menu toggle.
  - Uses `HeaderMenu` with `viewport="desktop"` and `viewport="mobile"`.

- `app/components/PageLayout.jsx`
  - Creates the mobile menu aside, search aside, and cart aside.

- `app/components/Aside.jsx`
  - Reusable drawer/overlay component used for mobile menu, cart, and search.

Current header behavior:

- Desktop navigation uses `.header-menu-desktop`.
- Mobile navigation uses `.header-menu-mobile`.
- Mobile hamburger button uses `.header-menu-mobile-toggle`.
- CSS decides which one is visible based on viewport width.

From `app/styles/app.css`:

```css
.header-menu-mobile-toggle {
  @media (min-width: 48em) {
    display: none;
  }
}

.header-menu-desktop {
  display: none;
  grid-gap: 1rem;
  @media (min-width: 45em) {
    display: flex;
    grid-gap: 1rem;
    margin-left: 3rem;
  }
}
```

That means:

- On small screens, the hamburger appears and desktop menu is hidden.
- On larger screens, the desktop menu appears and hamburger is hidden.

### How to Build a New Responsive Page

Use this process:

1. Build the page mobile-first.
2. Add desktop enhancements with `@media (min-width: ...)`.
3. Keep data loading the same for mobile and desktop.
4. Avoid duplicating whole pages for mobile and desktop.
5. Test at phone, tablet, laptop, and wide desktop widths.

Example route:

```jsx
export async function loader({context}) {
  const {storefront} = context;
  const data = await storefront.query(MY_QUERY);
  return {data};
}

export default function MyPage() {
  const {data} = useLoaderData();

  return (
    <section className="my-page">
      <div className="my-page__media">...</div>
      <div className="my-page__content">...</div>
    </section>
  );
}
```

Example CSS:

```css
.my-page {
  display: grid;
  gap: 1rem;
  padding: 1rem;
}

.my-page__media img {
  width: 100%;
  height: auto;
}

@media (min-width: 48em) {
  .my-page {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 2rem;
    padding: 2rem;
  }
}
```

This is mobile-first because the base style is for mobile, and the media query upgrades the layout for larger screens.

### When to Use CSS vs React Conditions

Prefer CSS for layout differences:

- Show/hide menu layout.
- Change grid columns.
- Change spacing.
- Stack content on mobile.
- Make images full-width on mobile.

Use React conditions only when behavior truly changes:

- Mobile drawer vs desktop dropdown with different interaction logic.
- A component should not exist at all for accessibility or performance reasons.
- Different event handling is required.

Avoid this pattern unless necessary:

```jsx
{isMobile ? <MobileProduct /> : <DesktopProduct />}
```

Why avoid it:

- It duplicates UI logic.
- It can create hydration problems if `isMobile` depends on `window`.
- It makes bugs harder to fix.

Better:

```jsx
<ProductDetails className="product-details" />
```

Then make `.product-details` responsive in CSS.

### Mobile UX Rules for Commerce

For mobile product and cart work:

- Keep add-to-cart visible and easy to tap.
- Use at least 44px height for important tap targets.
- Avoid tiny links in header/cart.
- Make variant options easy to tap.
- Keep product images responsive and not cropped unpredictably.
- Do not place important checkout/cart buttons below huge content blocks.
- Test with long product titles and sale prices.
- Test cart with 0, 1, and many items.
- Test loading states because mobile networks are slower.

For desktop:

- Use wider layouts only when they improve scanning.
- Avoid stretching text lines too wide.
- Keep product image and product form visible together when possible.
- Use grid layouts for collection/product lists.
- Make hover states useful but never required, because touch devices do not have hover.

### Breakpoints

This repo currently uses breakpoints around:

- `45em`, roughly 720px when the browser default font size is 16px.
- `48em`, roughly 768px.

Try to keep breakpoints consistent unless there is a real design reason.

Useful viewport sizes to test:

- 375px wide: common small phone.
- 390px wide: common iPhone width.
- 430px wide: larger phone.
- 768px wide: tablet.
- 1024px wide: small laptop/tablet landscape.
- 1440px wide: desktop.

### How to Test Mobile and Desktop Locally

Start the app:

```bash
npm run dev
```

Then open the local URL printed by the terminal.

In Chrome:

1. Open DevTools.
2. Click the device toolbar icon.
3. Test iPhone/Pixel/tablet sizes.
4. Rotate between portrait and landscape.
5. Test real interactions: menu, search, cart, variant selection, add to cart.

Also test by manually resizing the browser. Some bugs only appear at widths between standard device presets.

### Recommended Testing Checklist

For every responsive change, check:

- Header does not wrap awkwardly.
- Mobile menu opens and closes.
- Search drawer opens and closes.
- Cart drawer opens and closes.
- Product images scale correctly.
- Product variant controls are tappable.
- Add-to-cart works.
- Collection grid does not overflow horizontally.
- Text does not overlap images/buttons.
- Footer links are readable.
- Checkout link works.
- No horizontal scroll appears on mobile.

Quick mobile overflow test:

```css
/* Temporary debugging only */
* {
  outline: 1px solid rgba(255, 0, 0, 0.2);
}
```

Remove that debug CSS before committing.

### How to Think About Native Mobile Apps

This repo is not a React Native app. It builds a mobile-friendly website.

If later you need a true native app:

- You would usually build a separate React Native app.
- It would still call Shopify APIs, but it would not reuse these Hydrogen route files directly.
- The Hydrogen storefront can still be the mobile web storefront.

For now, treat mobile as responsive web.

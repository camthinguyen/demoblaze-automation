import { test, expect } from '../../src/fixtures/testFixtures';
import { CartPage } from '../../src/pages/ui/CartPage';
import { LoginPage } from '../../src/pages/ui/LoginPage';

// -------------------------------------------------------------------------
// Data Providers for Reusability across Cart & Checkout Suites
// -------------------------------------------------------------------------
const cartProductsData = {
  item1: { name: 'Samsung galaxy s6', price: 360 },
  item2: { name: 'Nokia lumia 1520', price: 820 },
};

const validOrderDetails = {
  name: 'Test Customer',
  country: 'United States',
  city: 'San Francisco',
  card: '4000123456789010',
  month: '12',
  year: '2026',
};

const xssInjectionDetails = {
  name: "<script>alert('xss_name')</script>",
  country: 'Vietnam',
  city: "<b>Ho Chi Minh</b>",
  card: '4000123456789010',
  month: '10',
  year: '2026',
};

test.describe('Demoblaze Cart & Checkout Comprehensive Suite', () => {
  let cartPage: CartPage;
  let loginPage: LoginPage;
  const validUser = process.env.TEST_USERNAME!;
  const validPass = process.env.TEST_PASSWORD!;

  test.beforeEach(async ({ page }) => {
    cartPage = new CartPage(page);
    loginPage = new LoginPage(page);
    await loginPage.navigateHomePage();
  });

  // -------------------------------------------------------------------------
  // TC_CRT_01: Verify adding a product to the cart from Product Details page
  // -------------------------------------------------------------------------
  test('TC_CRT_01: Verify adding a product to the cart from Product Details page', { tag: ['@regression'] }, async () => {
    // 1. Select product from Home page
    await cartPage.selectProduct(cartProductsData.item1.name);
    await expect(cartPage.productNameHeader).toHaveText(cartProductsData.item1.name);

    // 2. Click 'Add to cart' & handle dialog
    await cartPage.addProductToCart();

    // 3. Click 'Cart' on navbar
    await cartPage.openCart();

    // Expected Result: Product appears in the cart table
    await expect(cartPage.getCartRowByProductName(cartProductsData.item1.name)).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // TC_CRT_02: Verify adding multiple products updates cart list and total price
  // -------------------------------------------------------------------------
  test('TC_CRT_02: Verify adding multiple products updates cart list and total price', { tag: ['@regression'] },async () => {
    // 1. Add first product to cart
    await cartPage.selectProduct(cartProductsData.item1.name);
    await cartPage.addProductToCart();

    // 2. Return home and add second product to cart
    await cartPage.navigateHome();
    await cartPage.selectProduct(cartProductsData.item2.name);
    await cartPage.addProductToCart();

    // 3. Open Cart page
    await cartPage.openCart();

    // Expected Result: Both products are listed in cart and total price is computed
    await expect(cartPage.getCartRowByProductName(cartProductsData.item1.name)).toBeVisible();
    await expect(cartPage.getCartRowByProductName(cartProductsData.item2.name)).toBeVisible();

    await expect(cartPage.totalPrice).toBeVisible();
    const priceText = await cartPage.totalPrice.textContent();
    expect(Number(priceText)).toBeGreaterThan(0);
  });

  // -------------------------------------------------------------------------
  // TC_CRT_03: Verify deleting an item from Cart dynamically updates total price
  // -------------------------------------------------------------------------
  test('TC_CRT_03: Verify deleting an item from Cart dynamically updates total price', { tag: ['@regression'] }, async () => {
    // Setup: Add 2 items to Cart
    await cartPage.selectProduct(cartProductsData.item1.name);
    await cartPage.addProductToCart();

    await cartPage.navigateHome();
    await cartPage.selectProduct(cartProductsData.item2.name);
    await cartPage.addProductToCart();

    // 1. Open Cart page
    await cartPage.openCart();
    await expect(cartPage.getCartRowByProductName(cartProductsData.item1.name)).toBeVisible();
    await expect(cartPage.getCartRowByProductName(cartProductsData.item2.name)).toBeVisible();

    const initialPriceText = await cartPage.totalPrice.textContent();
    const initialPrice = Number(initialPriceText);

    // 2. Click 'Delete' link next to item #1
    await cartPage.deleteProductByName(cartProductsData.item1.name);

    // Expected Result: Item #1 removed and total price dynamically updates
    await expect(cartPage.getCartRowByProductName(cartProductsData.item1.name)).not.toBeVisible();

    await expect(async () => {
      const updatedPriceText = await cartPage.totalPrice.textContent();
      expect(Number(updatedPriceText)).toBeLessThan(initialPrice);
    }).toPass();
  });

  // -------------------------------------------------------------------------
  // TC_CRT_04: Verify successful order purchase with all mandatory modal fields
  // -------------------------------------------------------------------------
  test('TC_CRT_04: Verify successful order purchase with all mandatory modal fields', {
      tag: ['@demo', '@regression'], 
    }, async () => {
    // Setup: Cart contains at least 1 item
    await cartPage.selectProduct(cartProductsData.item1.name);
    await cartPage.addProductToCart();
    await cartPage.openCart();

    // 1. Click 'Place Order' button
    await cartPage.placeOrderButton.click();
    await expect(cartPage.placeOrderModal).toBeVisible();

    // 2. Fill Name, Country, City, Credit Card, Month, Year
    await cartPage.fillPlaceOrderForm(validOrderDetails);

    // 3. Click 'Purchase'
    await cartPage.purchaseButton.click();

    // Expected Result: Purchase confirmation modal appears
    await expect(cartPage.confirmationModal).toBeVisible();
    await expect(cartPage.confirmationTitle).toHaveText('Thank you for your purchase!');

    await cartPage.confirmOkButton.click();
    await expect(cartPage.confirmationModal).not.toBeVisible();
  });

  // -------------------------------------------------------------------------
  // TC_CRT_05: Verify Purchase validation alert when mandatory Name/Card is missing
  // -------------------------------------------------------------------------
  test('TC_CRT_05: Verify Purchase validation alert when mandatory Name/Card is missing', async ({ page }) => {
  // Setup: Cart contains at least 1 item
  await cartPage.selectProduct(cartProductsData.item1.name);
  await cartPage.addProductToCart();
  await cartPage.openCart();

  // Open Place Order modal
  await cartPage.placeOrderButton.click();
  await expect(cartPage.placeOrderModal).toBeVisible();

  // Leave Name and Credit Card blank
  await cartPage.countryInput.fill('United States');
  await cartPage.cityInput.fill('San Francisco');

  // Register dialog listener before clicking Purchase
  const dialogPromise = page.waitForEvent('dialog');

  // Confirm Purchase button is actionable
  await expect(cartPage.purchaseButton).toBeVisible();
  await expect(cartPage.purchaseButton).toBeEnabled();

  // Trigger the alert
  cartPage.purchaseButton.click();

  const dialog = await dialogPromise;
  const alertMessage = dialog.message();

  await dialog.accept();

  // Verify validation message
  expect(alertMessage).toBe('Please fill out Name and Creditcard.');

  // Verify modal remains visible
  await expect(cartPage.placeOrderModal).toBeVisible();
});

  // -------------------------------------------------------------------------
  // TC_CRT_06: Verify placing order with empty cart
  // -------------------------------------------------------------------------
  test('TC_CRT_06: Verify placing order with empty cart', { tag: ['@regression'] }, async ({ page }) => {
    // 1. Navigate to Cart page with empty cart
    await cartPage.openCart();

    // 2. Observe 'Place Order' button state and total price
    await expect(cartPage.cartTableRows).toHaveCount(0);
    const priceText = await cartPage.totalPrice.textContent();
    expect(priceText === '' || priceText === '0').toBeTruthy();

    await cartPage.placeOrderButton.click();

    if (await cartPage.placeOrderModal.isVisible()) {
      const dialogPromise = page.waitForEvent('dialog');
      await cartPage.fillPlaceOrderForm(validOrderDetails);
      await cartPage.purchaseButton.click();

      const dialog = await dialogPromise;
      await dialog.accept();
    }
  });

  // -------------------------------------------------------------------------
  // TC_CRT_07: Verify cart items persist across page navigation and refresh
  // -------------------------------------------------------------------------
  test('TC_CRT_07: Verify cart items persist across page navigation and refresh', { tag: ['@regression'] }, async ({ page }) => {
    // Setup: Add item to Cart
    await cartPage.selectProduct(cartProductsData.item1.name);
    await cartPage.addProductToCart();

    // 1. Navigate between Home, About Us, Contact
    await cartPage.navigateHome();
    await page.getByRole('link', { name: 'About us' }).click();
    await page.locator('#videoModal .btn-secondary', { hasText: 'Close' }).click();

    await page.getByRole('link', { name: 'Contact' }).click();
    await page.locator('#exampleModal .btn-secondary', { hasText: 'Close' }).click();

    // 2. Refresh browser
    await page.reload();

    // 3. Return to Cart page
    await cartPage.openCart();

    // Expected Result: Product remains in Cart table
    await expect(cartPage.getCartRowByProductName(cartProductsData.item1.name)).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // TC_CRT_08: Verify guest cart items persist when logging in during session
  // -------------------------------------------------------------------------
  test('TC_CRT_08: Verify guest cart items persist when logging in during session', async ({ page }) => {
  // Step 1: Add first product as guest
  await cartPage.selectProduct(cartProductsData.item1.name);

  const firstProductDialog = page.waitForEvent('dialog');
  await cartPage.addProductToCart();


  // Step 2: Return home and add second product as guest
  await cartPage.navigateHome();
  await cartPage.selectProduct(cartProductsData.item2.name);

  const secondProductDialog = page.waitForEvent('dialog');
  await cartPage.addProductToCart();

  // Step 3: Confirm both products were added before login
  await cartPage.openCart();
  await expect(
    cartPage.getCartRowByProductName(cartProductsData.item1.name)
  ).toBeVisible();
  await expect(
    cartPage.getCartRowByProductName(cartProductsData.item2.name)
  ).toBeVisible();

  // Step 4: Log in
  await loginPage.login(validUser, validPass);
  await expect(loginPage.userGreeting).toHaveText('Welcome ${validUser}');

  // Step 5: Verify cart contents after login
  await cartPage.openCart();
  await expect(
    cartPage.getCartRowByProductName(cartProductsData.item1.name)
  ).toBeVisible();
  await expect(
    cartPage.getCartRowByProductName(cartProductsData.item2.name)
  ).toBeVisible();
});

  // -------------------------------------------------------------------------
  // TC_CRT_09: Verify Purchase modal sanitizes special characters in input fields
  // -------------------------------------------------------------------------
  test('TC_CRT_09: Verify Purchase modal sanitizes special characters in input fields', { tag: ['@regression'] }, async () => {
    // Setup: Cart contains 1 item
    await cartPage.selectProduct(cartProductsData.item1.name);
    await cartPage.addProductToCart();
    await cartPage.openCart();

    // 1. Click 'Place Order'
    await cartPage.placeOrderButton.click();
    await expect(cartPage.placeOrderModal).toBeVisible();

    // 2. Fill Name/City with HTML/JS script injection payloads
    await cartPage.fillPlaceOrderForm(xssInjectionDetails);

    // 3. Complete purchase
    await cartPage.purchaseButton.click();

    // Expected Result: Confirmation modal opens safely
    await expect(cartPage.confirmationModal).toBeVisible();
    await expect(cartPage.confirmationTitle).toHaveText('Thank you for your purchase!');

    await cartPage.confirmOkButton.click();
  });

  // -------------------------------------------------------------------------
  // TC_CRT_10: Verify closing Place Order modal retains items in cart
  // -------------------------------------------------------------------------
  test('TC_CRT_10: Verify closing Place Order modal retains items in cart', async ({ page }) => {
    // Setup: Cart contains 1 item
    await cartPage.selectProduct(cartProductsData.item1.name);
    await cartPage.addProductToCart();
    await cartPage.openCart();

    // 1. Click 'Place Order'
    await cartPage.placeOrderButton.click();
    await expect(cartPage.placeOrderModal).toBeVisible();

    // 2. Enter partial details
    await cartPage.nameInput.fill('Partial Customer');

    // 3. Click 'Close' button on modal
    const modalCloseButton = page.locator('#orderModal .btn-secondary', { hasText: 'Close' });
    await modalCloseButton.click();
    await expect(cartPage.placeOrderModal).not.toBeVisible();

    // 4. Re-check Cart
    await expect(cartPage.getCartRowByProductName(cartProductsData.item1.name)).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // TC_CRT_11: Add products then logout
  // -------------------------------------------------------------------------
  test('TC_CRT_11: Add products then logout', { tag: ['@regression'] }, async () => {
    // 1. Login and add product to cart
    await loginPage.login(validUser, validPass);
    await expect(loginPage.userGreeting).toHaveText(`Welcome ${validUser}`);

    await cartPage.selectProduct(cartProductsData.item1.name);
    await cartPage.addProductToCart();

    // 2. Click Logout
    await loginPage.logout();

    // Expected Result: User session is terminated and user greeting is removed
    await expect(loginPage.navLoginLink).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // TC_CRT_12: Navigate between Home and Cart while logged in
  // -------------------------------------------------------------------------
  test('TC_CRT_12: Navigate between Home and Cart while logged in', { tag: ['@regression'] }, async () => {
    // 1. Authenticate user
    await loginPage.login(validUser, validPass);

    // 2. Navigate between Home and Cart multiple times
    await cartPage.openCart();
    await expect(cartPage.totalPrice).toBeVisible();

    await cartPage.navigateHome();
    await expect(cartPage.navHomeLink).toBeVisible();

    await cartPage.openCart();
    // Expected Result: Cart page opens successfully without losing session context
    await expect(loginPage.userGreeting).toHaveText(`Welcome ${validUser}`);
  });

  // -------------------------------------------------------------------------
  // TC_CRT_13: Logout then login again
  // -------------------------------------------------------------------------
  test('TC_CRT_13: Logout then login again', async () => {
    // 1. Login, add item, then logout
    await loginPage.login(validUser, validPass);
    await cartPage.selectProduct(cartProductsData.item1.name);
    await cartPage.addProductToCart();
    await loginPage.logout();

    // 2. Login again with valid credentials
    await loginPage.login(validUser, validPass);

    // Expected Result: Successful re-authentication and greeting displays
    await expect(loginPage.userGreeting).toHaveText(`Welcome ${validUser}`);
  });

  // -------------------------------------------------------------------------
  // TC_CRT_14: Failed login with existing cart
  // -------------------------------------------------------------------------
  test('TC_CRT_14: Failed login with existing cart', { tag: ['@regression'] }, async ({ page }) => {
    // 1. Add item to cart as guest
    await cartPage.selectProduct(cartProductsData.item1.name);
    await cartPage.addProductToCart();

    // 2. Open login modal and attempt login with invalid password
    await loginPage.login(validUser, 'WrongPassword123');
    
    const dialog = await page.waitForEvent('dialog');;
    expect(dialog.message()).toContain('Wrong password');
    await dialog.accept();
    loginPage.closeButton.click();

    // 3. Verify cart items remain intact
    await cartPage.openCart();
    await expect(cartPage.getCartRowByProductName(cartProductsData.item1.name)).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // TC_CRT_15: Modify cart in two tabs
  // -------------------------------------------------------------------------
  test('TC_CRT_15: Modify cart in two tabs', async ({ context, page }) => {
    // 1. Add item in Tab 1
    await cartPage.selectProduct(cartProductsData.item1.name);
    await cartPage.addProductToCart();

    // 2. Open a second tab in the same browser context
    const pageTwo = await context.newPage();
    const cartPageTab2 = new CartPage(pageTwo);
    await pageTwo.goto('/');

    // 3. Add second item in Tab 2
    await cartPageTab2.selectProduct(cartProductsData.item2.name);
    await cartPageTab2.addProductToCart();

    // 4. Open Cart in Tab 1 and verify both items exist (session storage sync)
    await cartPage.openCart();
    await expect(cartPage.getCartRowByProductName(cartProductsData.item1.name)).toBeVisible();
    await expect(cartPage.getCartRowByProductName(cartProductsData.item2.name)).toBeVisible();

    await pageTwo.close();
  });

  // -------------------------------------------------------------------------
  // TC_CRT_16: Refresh after login
  // -------------------------------------------------------------------------
  test('TC_CRT_16: Refresh after login', { tag: ['@regression'] }, async ({ page }) => {
    // 1. Authenticate user
    await loginPage.login(validUser, validPass);
    await expect(loginPage.userGreeting).toHaveText(`Welcome ${validUser}`);

    // 2. Refresh browser page
    await page.reload();

    // Expected Result: Session state persists after refresh
    await expect(loginPage.userGreeting).toHaveText(`Welcome ${validUser}`);
  });

  // -------------------------------------------------------------------------
  // TC_CRT_17: Use browser Back after logout
  // -------------------------------------------------------------------------
  test('TC_CRT_17: Use browser Back after logout', { tag: ['@regression'] }, async ({ page }) => {
    // 1. Login then logout
    await loginPage.login(validUser, validPass);
    await expect(loginPage.userGreeting).toHaveText(`Welcome ${validUser}`);
    
    await loginPage.logout();

    // 2. Use browser Back navigation
    await page.goBack();

    // Expected Result: User is not granted authenticated access (session cleared)
    await expect(loginPage.navLoginLink).toBeVisible();
  });

});
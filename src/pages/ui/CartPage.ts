import { Page, Locator } from '@playwright/test';

export class CartPage {
  constructor(private readonly page: Page) {}

  // Built-in Role & Text Locators (Recommended)
  get addToCartButton(): Locator {
    return this.page.getByRole('link', { name: 'Add to cart' });
  }

  get navCartLink(): Locator {
    return this.page.locator('#cartur');
  }

  get navHomeLink(): Locator {
    return this.page.locator('a.nav-link', { hasText: 'Home' });
  }

  get productNameHeader(): Locator {
    return this.page.locator('.name');
  }

  get totalPrice(): Locator {
    return this.page.locator('#totalp');
  }

  get cartTableRows(): Locator {
    return this.page.locator('tr.success');
  }

  get placeOrderButton(): Locator {
    return this.page.getByRole('button', { name: 'Place Order' });
  }

  get placeOrderModal(): Locator {
    return this.page.locator('#orderModal');
  }

  // Place Order Modal Inputs
  get nameInput(): Locator {
    return this.page.locator('#name');
  }

  get countryInput(): Locator {
    return this.page.locator('#country');
  }

  get cityInput(): Locator {
    return this.page.locator('#city');
  }

  get cardInput(): Locator {
    return this.page.locator('#card');
  }

  get monthInput(): Locator {
    return this.page.locator('#month');
  }

  get yearInput(): Locator {
    return this.page.locator('#year');
  }

  get purchaseButton(): Locator {
    return this.page.locator('#orderModal button[onclick="purchaseOrder()"]');
  }

  get confirmationModal(): Locator {
    return this.page.locator('.sweet-alert');
  }

  get confirmationTitle(): Locator {
    return this.confirmationModal.locator('h2');
  }

  get confirmOkButton(): Locator {
    return this.confirmationModal.getByRole('button', { name: 'OK' });
  }

  // Scoped Methods
  getCartRowByProductName(productName: string): Locator {
    return this.cartTableRows.filter({ hasText: productName });
  }

  getDeleteLinkByProductName(productName: string): Locator {
    return this.getCartRowByProductName(productName).getByRole('link', { name: 'Delete' });
  }

  async selectProduct(productName: string): Promise<void> {
    await this.page.getByRole('link', { name: productName }).click();
  }

  async addProductToCart(): Promise<void> {
    const dialogPromise = this.page.waitForEvent('dialog');
    await this.addToCartButton.click();
    const dialog = await dialogPromise;
    await dialog.accept();
  }

  async openCart(): Promise<void> {
    await this.navCartLink.click();
  }

  async navigateHome(): Promise<void> {
    await this.navHomeLink.click();
  }

  async deleteProductByName(productName: string): Promise<void> {
    await this.getDeleteLinkByProductName(productName).click();
  }

  async fillPlaceOrderForm(orderDetails: {
    name: string;
    country: string;
    city: string;
    card: string;
    month: string;
    year: string;
  }): Promise<void> {
    // Wait for modal animation to complete using locator wait
    await this.placeOrderModal.waitFor({ state: 'visible' });

    await this.nameInput.fill(orderDetails.name);
    await this.countryInput.fill(orderDetails.country);
    await this.cityInput.fill(orderDetails.city);
    await this.cardInput.fill(orderDetails.card);
    await this.monthInput.fill(orderDetails.month);
    await this.yearInput.fill(orderDetails.year);
  }
}
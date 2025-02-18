/* playwright script to auto-cancel all amazon subscribe-and-saves */
/* npm install */
/* node amazon.js */

const { chromium } = require('playwright');  // Import Playwright's Chromium module
const fs = require('fs');

(async () => {

  // Launch the browser
  const browser = await chromium.launch({ headless: false });  // Set headless: true for no UI
  const page = await browser.newPage();  // Create a new page
  await page.setDefaultTimeout(10000);

  try {
    const cookies = JSON.parse(fs.readFileSync('cookies.json', 'utf-8'));
    await page.context().addCookies(cookies);
  } catch (error) {
    console.warn('warn: ', error.message);
  }

  // Navigate to a website
  await page.goto('https://www.amazon.com/');

  // Login manually here if not already logged in
  await page.waitForSelector('text=Hello, Adam');

  // Save cookies after successful login
  const cookies = await page.context().cookies();
  fs.writeFileSync('cookies.json', JSON.stringify(cookies, null, 2));
  
  while (true) {
    await page.goto('https://www.amazon.com/auto-deliveries/subscriptionList?listFilter=active');

    // Wait for the <input> element to be visible and interactable
    await page.waitForSelector('span.a-button-text:has-text("Edit")', { state: 'visible' });

    // Locate the "Edit" button based on the text
    const editButton = page.locator('span.a-button-text:has-text("Edit")');
    
    // Check if the "Edit" button exists
    const count = await editButton.count();
    
    if (count === 0) {
      console.log('No more "Edit" buttons found.');
      break;  // Exit the loop if no more "Edit" buttons are found
    }

    // Click the input element, even if it's overlapped by other elements
    await page.click('input.a-button-input[aria-labelledby="a-autoid-0-announce"]');

    // Wait for the "Cancel subscription" span to be visible
    await page.waitForSelector('span:has-text("Cancel subscription")', { state: 'visible' });

    // Click the span with the text "Cancel subscription"
    await page.click('span:has-text("Cancel subscription")');

    // Wait for the input element to be visible and interactable
    await page.waitForSelector('input.a-button-input[aria-labelledby="confirmCancelLink-announce"]', { state: 'visible' });

    // Click the input element
    await page.click('input.a-button-input[aria-labelledby="confirmCancelLink-announce"]');
  }

  // Close the browser
  await browser.close();
})();


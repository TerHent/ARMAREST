import { test, expect } from '@playwright/test';

// Test scenario 1 as defined in the Scope Statement
// Note: Does not test the actual ice connection to improve runtimes. Uses the test server instead.

test('authorization token', async ({ page }) => {
    //T020/ Load Authorization Page
    await page.goto('http://localhost:8080/');
    //T030/ Enter the false authorization token in input field
    await page.getByPlaceholder('Authorization Token').click();
    await page.getByPlaceholder('Authorization Token').fill('false.test');
    //T040/ Validate authorization token
    await page.getByRole('button', { name: 'Log In Now' }).click();
    // rendering might take time
    await page.waitForTimeout(1000);
    //T050// Display invalid authorization token message
    expect(await page.getByText('Error 401 UNAUTHORIZED').isVisible()).toBe(true);
    await page.close();
});

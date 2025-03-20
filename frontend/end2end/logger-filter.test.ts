import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  await page.getByPlaceholder('Authorization Token').click();
  await page.getByPlaceholder('Authorization Token').fill('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjI1NDE5MjMwMTguMzczMDU0LCJwZXJtaXNzaW9ucyI6eyJsb2ciOlsiKiJdLCJraW5lbWF0aWMiOlsiKiJdLCJyZW1vdGUiOlsiKiJdLCJlbWVyZ2VuY3lzdG9wIjpbIioiXX0sInJvbGVfbmFtZSI6IkRldmVsb3BlciJ9.Js5VhwUeNtSYJFASvJA6JIT53qc_xDCrtCVOyaOVU_A');
  await page.getByPlaceholder('Authorization Token').press('Enter');
  await page.getByRole('link', { name: 'Add Widgets' }).click();
  await page.getByRole('menuitem', { name: 'Logger' }).click();
  await page.getByPlaceholder('Tag').click();
  await page.getByPlaceholder('Tag').fill('filtered message tag');
  await page.getByPlaceholder('Tag').press('Tab');
  await page.getByPlaceholder('Component').fill('Filter Component');
  await page.getByPlaceholder('Component').press('Tab');
  await page.getByPlaceholder('Function').fill('');
  await page.getByPlaceholder('Function').press('Tab');
  await page.getByPlaceholder('File').fill('folder/filter.cpp');
  await page.getByRole('button', { name: 'Apply' }).click();
  await page.waitForTimeout(1000);
  expect(await page.getByText(/Random Test Message/i).all()).toStrictEqual([]);

  await page.getByRole('link', { name: 'Log out' }).click();
  await page.close();
});
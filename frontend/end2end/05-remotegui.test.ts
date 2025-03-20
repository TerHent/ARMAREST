import { test, expect } from '@playwright/test';
test('workspace', async ({ page }) => {
    //T020/ Load Authorization Page
    await page.goto('http://localhost:8080/');
    //T030/ Enter authorization token in input field
    await page.getByPlaceholder('Authorization Token').click();
    await page.getByPlaceholder('Authorization Token').fill('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjI1NDE5MjMwMTguMzczMDU0LCJwZXJtaXNzaW9ucyI6eyJsb2ciOlsiKiJdLCJraW5lbWF0aWMiOlsiKiJdLCJyZW1vdGUiOlsiKiJdLCJlbWVyZ2VuY3lzdG9wIjpbIioiXX0sInJvbGVfbmFtZSI6IkRldmVsb3BlciJ9.Js5VhwUeNtSYJFASvJA6JIT53qc_xDCrtCVOyaOVU_A');
    //T040/ Validate authorization token
    await page.getByRole('button', { name: 'Log In Now' }).click();
    //T060/ Display user role
    //T070/ Display authorization status
    await page.getByText('Permissions').click();
    expect(await page.getByText('Your role: ViewerPermissions: log: readkinematic: readremote: read').all()).toBeTruthy();
    //T080/ Open Empty GUI Workspace
    expect(await page.locator('.react-grid-layout').innerHTML()).toBe("")
    //T110/ Open RemoteGUI
    await page.getByRole('link', { name: 'Add Widgets' }).click();
    await page.getByRole('menuitem', { name: 'RemoteGui MainTab' }).click();
    //T300/ Display layout of selected GUI
    expect(await page.getByRole('heading', {name: 'RemoteGUI MainTab'}).isVisible()).toBe(true);
    //T310/ State Changes are sent through REST
    const remotePromise = page.waitForResponse(/remote/i);
    await page.getByRole('button', {name: "Send updates now"}).click();
    await remotePromise;
    //T120/ User logs out
    await page.getByText("Log out").click()
    page.close();
});
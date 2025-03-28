import { test, expect } from '@playwright/test';

test('workspace', async ({ page }) => {
  //T020/ Load Authorization Page
  await page.goto('http://localhost:8080/');
  //T030/ Enter authorization token in input field
  await page.getByPlaceholder('Authorization Token').click();
  await page.getByPlaceholder('Authorization Token').fill("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjI1NDE5MjMwMTguMzczMDU0LCJwZXJtaXNzaW9ucyI6eyJsb2ciOlsiKiJdLCJraW5lbWF0aWMiOlsiKiJdLCJyZW1vdGUiOlsiKiJdLCJlbWVyZ2VuY3lzdG9wIjpbIioiXX0sInJvbGVfbmFtZSI6IkRldmVsb3BlciJ9.Js5VhwUeNtSYJFASvJA6JIT53qc_xDCrtCVOyaOVU_A");
  //T040/ Validate authorization token
  const tokenPromise = page.waitForResponse(/check_token/i);
  await page.getByRole('button', { name: 'Log In Now' }).click();
  await tokenPromise;
  //T060/ Display user role
  //T070/ Display authorization status
  //T071/ Display connection status
  await page.getByText('Permissions').click();
  expect(await page.getByText('Your role: ViewerPermissions: log: readkinematic: readremote: read').all()).toBeTruthy()
  //T080/ Open Empty GUI Workspace
  expect(await page.locator('.react-grid-layout').innerHTML()).toBe("")
  //T081/ Display emergency stop button
  expect(await page.getByText("Trigger EmergencyStop SS2").isVisible()).toBe(true);
  //T090/ Open KinematicUnitGUI
  await page.getByRole('link', { name: 'Add Widgets' }).click();
  await page.getByRole('menuitem', { name: 'KinematicUnit FakeKinematicUnit' }).click();
  
  //T100/ Open Logger
  await page.getByRole('link', { name: 'Add Widgets' }).click();
  await page.getByRole('menuitem', { name: 'Logger' }).click();
  
  await page.waitForTimeout(1000);
  expect(await page.getByRole('cell', {name: 'Fake Joint 2'}).isVisible()).toBe(true);
  //T200/ Display correct verbosity level
  expect(await page.getByText('Current verbosity level:Important').isVisible()).toBe(true)
  //T110/ Open RemoteGUI
  await page.getByRole('link', { name: 'Add Widgets' }).click();
  await page.getByRole('menuitem', { name: 'RemoteGui MainTab' }).click();
  expect(await page.getByRole('heading', {name: 'RemoteGUI MainTab'}).isVisible()).toBe(true);

  // close logger and remotegui
  await page.getByRole('button', { name: 'Close' }).nth(2).click();
  await page.getByRole('button', { name: 'Close' }).nth(1).click();

  //T256/ Select joint
  await page
      .getByRole("button", { name: "Current Joint: No joint selected yet" })
      .click();
  await page
      .getByRole("menuitem", { name: "Fake Joint 2", exact: true })
      .click();
  //T257/ Select control mode    
  await page
      .getByRole("button", { name: "Current Control Mode: Undefined" })
      .click();
  await page.getByRole("menuitem", { name: "Angle" }).click();
  await page.waitForTimeout(1000);

  expect(
      await page
          .getByRole("button", { name: "Current Joint: Fake Joint 2" })
          .isVisible()
  ).toBe(true);
  expect(
      await page
          .getByRole("button", { name: "Current Control Mode: Angle" })
          .isVisible()
  ).toBe(true);
  //T260/ Modify value of associated with current control mode and joint
  await page.getByRole('textbox').click();
  await page.getByRole('textbox').fill('-5');
  //T270/ Relay changes to Ice
  const responsePromise = page.waitForResponse((response) => response.url().match(/angle/i) ? true : false);
  await page.getByRole('button', { name: 'Update' }).click();
  await responsePromise;
  
  //T082/ Use emergency shutdown button
  await page.getByRole('button', { name: 'Trigger EmergencyStop SS2' }).click();
  await page.getByRole('button', { name: 'Release EmergencyStop SS2' }).click();
  //T120/ User logs out
  await page.getByRole('link', { name: 'Log out' }).click();
  await page.close();
});

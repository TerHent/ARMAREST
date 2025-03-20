import {test, expect} from "@playwright/test"

// Test scenario 7 as defined in the Pflichtenheft
// Note: Does not test the actual ice connection to improve runtimes. Uses the test server instead.
test("get started", async ({page}) => {
    //T020/ Load Authorization Page
    await page.goto('http://localhost:8080/');
    //T030/ Enter authorization token in input field
    await page.getByPlaceholder('Authorization Token').click();
    // this token expires sometime in 2050. Hopefully we aren't using it anymore by then.
    await page.getByPlaceholder('Authorization Token').fill('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjI1NDE5MjMwMTguMzczMDU0LCJwZXJtaXNzaW9ucyI6eyJsb2ciOlsicmVhZCJdLCJraW5lbWF0aWMiOlsicmVhZCJdLCJyZW1vdGUiOlsicmVhZCJdfSwicm9sZV9uYW1lIjoiVmlld2VyIn0.J09F8S1w_q9g7dsq0moVr58p5p1-mZnUm_StuJprT5w');
    //T040/ Validate authorization token
    const tokenPromise = page.waitForResponse(/check_token/i)
    await page.getByRole('button', { name: 'Log In Now' }).click();
    await tokenPromise;
    //T060/ Display user role
    //T070/ Display authorization status
    await page.getByText('Permissions', { exact: true }).click();
    expect(await page.getByText('Your role: ViewerPermissions: log: readkinematic: readremote: read').all()).toBeTruthy()
    //T080/ Open Empty GUI Workspace
    expect(await page.locator('.react-grid-layout').innerHTML()).toBe("")
    //T090/ Open KinematicUnitGUI
    await page.getByRole('link', { name: 'Add Widgets' }).click();
    await page.getByRole('menuitem', { name: 'KinematicUnit FakeKinematicUnit' }).click();
    //T410/ User without KinematicUnitGUI write permission tries to change the state of KinematicUnitGUI
    await page.getByRole('button', { name: 'Current Joint: No joint selected yet' }).click();
    await page.getByRole('menuitem', { name: 'Fake Joint 1', exact: true }).click();
    await page.getByRole('button', { name: 'Current Control Mode: Undefined' }).click();
    await page.getByRole('menuitem', { name: 'Velocity' }).click();
    await page.getByRole('textbox').click();
    const velocityPromise = page.waitForResponse(/velocity/i)
    await page.getByRole('button', { name: 'Update' }).click();
    const response = await velocityPromise;
    expect(response.status()).toBe(403)
    //T100/ Open Logger
    await page.getByRole('link', { name: 'Add Widgets' }).click();
    await page.getByRole('menuitem', { name: 'Logger' }).click();
    //T110/ Open RemoteGUI
    await page.getByRole('link', { name: 'Add Widgets' }).click();
    const mainTabPromise = page.waitForResponse(/MainTab/i)
    await page.getByRole('menuitem', { name: 'RemoteGui MainTab' }).click();
    await mainTabPromise;
    //T430/ User without RemoteGUI write permission tries to change the state ofRemoteGUI
    const testButtonPromise = page.waitForResponse(response => (response.url().match(/TestButton/i) && response.request().method() == "PUT") || false);
    await page.getByRole('button', { name: /TestButton/ }).click();
    expect(await (await testButtonPromise).status()).toBe(403);
    // These would test a soft requirement which we did not implement.
    //T130/ Open PlatformGUI
    //T450/ User without PlatformGUI write permission tries to change the state of PlatformGUI

    //T120/ User logs out
    await page.getByText("Log out").click()
    await page.close();
})
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
    await page.getByPlaceholder('Authorization Token').press('Enter');
    await tokenPromise;
    //T060/ Display user role
    //T070/ Display authorization status
    await page.getByText('Permissions', { exact: true }).click();
    expect(await page.getByText('Your role: ViewerPermissions: log: readkinematic: readremote: read').all()).toBeTruthy()
    //T080/ Open Empty GUI Workspace
    expect(await page.locator('.react-grid-layout').innerHTML()).toBe("")
    
        
    //T100/ Open Logger
    await page.getByRole('link', { name: 'Add Widgets' }).click();
    await page.getByRole('menuitem', { name: 'Logger' }).click();

    //T200/ Display correct verbosity level
    await page.waitForTimeout(1000);
    expect(await page.getByText('Current verbosity level:Important').isVisible()).toBe(true)

    //T240/ Scroll through log messages
    await page.getByRole('table').focus()
    await page.mouse.wheel(0, -10000)
    
    //T210/ Change verbosity level in Frontend
    await page.getByRole('slider').fill('4');
    await page.getByRole('slider').click();
    await page.getByText('Current verbosity level: Info')

    //T220/ Filter log entries
    expect(await (await page.content()).includes("DEBUG")).toBe(false)

    //T120/ User logs out
    await page.getByText("Log out").click()
    await page.close();
})

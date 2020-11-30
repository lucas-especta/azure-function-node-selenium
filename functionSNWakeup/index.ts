import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { Builder, By, WebDriver } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';

require('dotenv').config();

const tryLogOnInstance = async (driver: WebDriver, instance: string, username: string, password: string) => {
    const instanceAddress = `https://${instance}.service-now.com/navpage.do`;
    await driver.get(instanceAddress);

    const frame1 = await driver.findElement(By.id('gsft_main'));
    await driver.switchTo().frame(frame1);

    const usernameEl = await driver.findElement(By.id('user_name'));
    await usernameEl.sendKeys(username);

    const passwordEl = await driver.findElement(By.id('user_password'));
    await passwordEl.sendKeys(password);

    const loginBtnEl = await driver.findElement(By.id('sysverb_login'));
    await loginBtnEl.click();

    await new Promise(r => setTimeout(r, 2000));
    await driver.findElement(By.css('.btn-primary'))

    await driver.navigate().to(`https://${instance}.service-now.com/nav_to.do?uri=%2Fsc_task.do%3Fsys_id%3D-1%26sys_is_list%3Dtrue%26sys_target%3Dsc_task%26sysparm_checked_items%3D%26sysparm_fixed_query%3D%26sysparm_group_sort%3D%26sysparm_list_css%3D%26sysparm_query%3Dactive%3Dtrue%26sysparm_referring_url%3Dsc_task_list.do%3Fsysparm_query%3Dactive%253Dtrue%255EEQ%26sysparm_target%3D%26sysparm_view%3D`);

    await new Promise(r => setTimeout(r, 2000));
    const frame2 = await driver.findElement(By.id('gsft_main'));
    await driver.switchTo().frame(frame2);

    const insertBtnEl = await driver.findElement(By.id('sysverb_insert'));
    await insertBtnEl.click();

    await new Promise(r => setTimeout(r, 2000));
    await driver.switchTo().parentFrame();

    const userEl = await driver.findElement(
        By.css('.user-name')
    );
    await userEl.click();

    const logoutEl = await driver.findElement(
        By.linkText('Logout')
    );
    await logoutEl.click();
}

// const tryWakeUpInstance = async (driver: WebDriver, devUsername: string, devPassword: string) => {
//     // Refreshing of instance starts here.
//     try {
//         // Go to servicenow
//         console.log('Redirecting to https://developer.servicenow.com/');
//         await driver.get("https://developer.servicenow.com/");

//         // click login link
//         console.log('Logging in..');
//         //new Actions(driver).mouseMove({x:0, y:0}, {x:1414, y: 41})
//         // await driver.switchTo().frame(
//         //     driver.findElement(By.xpath('/html[1]/body[1]/dps-app[1]'))
//         // );

//         await driver.findElement(By.className("dps-link")).click();

//         // enter username
//         await driver
//             .findElement(By.id("username"))
//             .sendKeys(devUsername);

//         // click next
//         await driver.findElement(By.id("usernameSubmitButton")).click();

//         // enter password
//         let pwd = driver.wait(until.elementLocated(By.id("password")), 5000);
//         await driver
//             .wait(until.elementIsVisible(pwd), 5000)
//             .sendKeys(devPassword);

//         // click sign in
//         let signInBtn = driver.wait(
//             until.elementLocated(By.id("submitButton")),
//             5000
//         );
//         await driver.wait(until.elementIsVisible(signInBtn), 5000).click();

//         // wait for 30 secs to ensure sign in is done
//         await driver.wait(
//             until.titleIs("Dashboard | ServiceNow Developers"),
//             30000
//         );

//         // go to instances
//         console.log('Checking your instance...');
//         await driver.get("https://developer.servicenow.com/app.do#!/instance");

//         // wake up instance
//         let wakeInstanceBtn = driver.wait(
//             until.elementLocated(By.id("instanceWakeUpBtn")),
//             5000
//         );

//         console.log('Waking your instance up!');
//         await driver.wait(until.elementIsVisible(wakeInstanceBtn), 5000).click();
//     } catch (e) {
//         throw e;
//     } finally {
//         // Wait 5 minutes before terminating Selenium
//         // setTimeout(async () => {
//         //     await driver.quit();
//         // }, 300000);
//     }
// }

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    let chromeDriver = null;
    try {
        const screenResolution = {
            width: 1280,
            height: 720
        };

        const chromeOptions = new Options()
            .headless()
            .addArguments('start-maximized')
            .addArguments('disable-infobars')
            .addArguments('disable-extensions')
            .addArguments('disable-gpu')
            .addArguments('disable-dev-shm-usage')
            .addArguments('no-sandbox')
            .addArguments('disable-web-security')
            .windowSize(screenResolution);

        chromeDriver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(chromeOptions)
            .build();

        const username = process.env.USERNAME;
        const password = process.env.PASSWORD;
        const instance = process.env.INSTANCE;

        await tryLogOnInstance(chromeDriver, instance, username, password);
    } catch (error) {
        context.log.error(error.message, error);
    } finally {
        if (chromeDriver != null) {
            await chromeDriver.quit();
        }
    }
};

export default httpTrigger;
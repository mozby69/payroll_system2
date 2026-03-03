import puppeteer from "puppeteer";
let browser = null;
export async function getBrowser() {
    if (!browser) {
        browser = await puppeteer.launch({
            headless: true,
        });
    }
    return browser;
}

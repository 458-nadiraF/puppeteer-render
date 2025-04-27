const puppeteer = require('puppeteer');
const selectors = require('./selectors');
require("dotenv").config();
// require("dotenv").config();
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
async function clickByClass(page, className) {
    try {
      await page.waitForSelector(`.${className}`);
      await page.click(`.${className}`);
      // console.log(`Clicked element with class: ${className}`);
      return true;
    } catch (error) {
      console.error(`Error clicking element with class ${className}:`, error.stack);
      return false;
    }
}
// Define getdivisor function
function getdivisor(priceini) {
  console.log('get divisor');
  let price = parseInt(priceini, 10);
  let divisor;
  if (price < 200) {
    divisor = 1;
  } else if (200 <= price && price < 500) {
    divisor = 2;
  } else if (500 <= price && price < 2000) {
    divisor = 5;
  } else if (2000 <= price && price < 5000) {
    divisor = 10;
  } else {
    divisor = 25;
  }
  console.log('selesai get divisor');
  return divisor;
}

// Define setgainloss function
function setgainloss(pricei, loss, gain) {
  console.log('set gain loss');
  const divisor = getdivisor(pricei);
  const price = parseInt(pricei, 10);

  // Adjusting loss and gain based on the divisor
  const losspp = (loss / 100);
  const lossp = (1 - losspp);
  const lossini = Math.floor(price * lossp); // Round down using Math.floor()
  
  const gainpp = (gain / 100);
  const gainp = (1 + gainpp);
  const gainini = Math.ceil(price * gainp); // Round up using Math.ceil()
  
  let adjusted_loss = lossini;
  while (adjusted_loss % divisor !== 0) {
    adjusted_loss -= 1;
  }

  let adjusted_gain = gainini;
  while (adjusted_gain % divisor !== 0) {
    adjusted_gain -= 1;
  }

  const divisorgain = getdivisor(adjusted_gain);
  const divisorloss = getdivisor(adjusted_loss);
  console.log('check lg');
  if (divisorloss === divisor) {
    if (divisorgain === divisor) {
      // No adjustment needed
    }
  } else {
    while (adjusted_loss % divisorloss !== 0) {
      adjusted_loss -= 1;
    }
    if (divisorgain !== divisor) {
      while (adjusted_gain % divisorgain !== 0) {
        adjusted_gain -= 1;
      }
    }
  }

  return { adjusted_loss, adjusted_gain };
}
// Click element and wait for navigation to complete
async function clickAndWaitForUrlEvenJustChange(page, urlPattern) {
  // Set up navigation promise before clicking
  // This will wait for navigation, but we can set a timeout if it's taking too long
  const navigationPromise = page.waitForNavigation({ waitUntil: 'load', timeout: 30000 })
  .catch(() => console.log("Navigation didn't happen in time"));

  // Alternatively, you could wait for the URL change using the 'waitForFunction' to check for a URL match in SPAs
  const urlChanged = page.waitForFunction(`window.location.href.includes('${urlPattern}')`, {
    timeout: 30000
  }).catch(() => console.log("URL didn't change in time"));

  // Wait for either one to finish
  console.log('before');
  await Promise.race([navigationPromise, urlChanged]);
  console.log('after');
  // Check if we're at the expected URL
  const currentUrl = page.url();
  return currentUrl.includes(urlPattern);
}
async function clickAndWaitForUrl(page, urlPattern) {
  // Set up navigation promise before clicking
  console.log('wait navigation');
  const navigationPromise = page.waitForNavigation({ waitUntil: 'load' });
  
  // Wait for navigation to complete
  await navigationPromise;
  console.log('finish navigation');
  // Check if we're at the expected URL
  const currentUrl = page.url();
  return currentUrl.includes(urlPattern);
}
  
const buy = async (req,res) => {
    // Set headless mode flag (set to 'false' to show the browser)
    const headlessMode = false; // Change to 'true' for headless mode
    const stockName = req.query.stockName;
    // Launch Chromium (non-headless mode or headless based on the flag)
    const browser = await puppeteer.launch({
      headless:true,
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--no-zygote",
        "--no-cache",
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });

    const page = await browser.newPage();

    // Navigate to a website
    console.log('will open link');
    try {
        await page.goto('https://login.ajaib.co.id/login',{waitUntil: 'load'}); // Replace with your desired URL
        console.log('link opened');
    } catch (error){
        console.error('An error occurred:', error.message);
    }
    // Wait for some element (adjust the selector based on the page)
    try{
        await page.waitForSelector(selectors.loginGmailText);
        const LoginGmailInput = await page.$(selectors.loginGmailText);
        const loginPasswordInput = await page.$(selectors.loginPasswordText);
        const Loginbutton= await page.$(selectors.loginMasukButton);
        const gmail = process.env.AJ_GMAIL;
        await LoginGmailInput.type(gmail);
        await loginPasswordInput.type(process.env.AJ_PASSWORD);
        await Loginbutton.click();
        console.log('succesfully loged');
    } catch (error){
        console.error('An error occurred:', error.message);
        console.error('Error Stack:', error.stack);
    }
    try {
        await clickAndWaitForUrl(page,'/pin');
        try{
            await page.waitForSelector(selectors.pinAjaib1, { timeout : 5000, visible : true });
        }catch(error){
            console.error('An error occurred:', error.message);
            await page.waitForSelector(selectors.pinAjaib1, { timeout : 5000 ,  visible : true});
        }
        const pinAjaibVar1 = await page.$(selectors.pinAjaib1);
        const pinAjaibVar2 = await page.$(selectors.pinAjaib2);
        const pinAjaibVar3 = await page.$(selectors.pinAjaib3);
        const pinAjaibVar4 = await page.$(selectors.pinAjaib4);
        await pinAjaibVar1.type(process.env.AJ_PIN_1);
        await pinAjaibVar2.type(process.env.AJ_PIN_2);
        await pinAjaibVar3.type(process.env.AJ_PIN_3);
        await pinAjaibVar4.type(process.env.AJ_PIN_4);
        console.log('succesfully enter pin');
    } catch (error){
        console.error('An error occurred:', error.message);
        console.error('Error Stack:', error.stack);
    }
    try {
        await clickAndWaitForUrl(page,'/home');
        await delay(1000);
        while (true) {
            try {
              // Wait for the element to be visible
              const mengertiButton = await page.$(selectors.mengertiButton);
              if (mengertiButton){
                await mengertiButton.click();
                await delay(2000);
              }
              else {
                console.log('Element is no longer visible, stopping clicks.');
                break
              }
        
            } catch (error) {
              // If the element is not found or visible anymore, break the loop
              console.log('Error: Element is no longer visible, stopping clicks.');
              break;
            }
          }
        console.log('succesfully click Mengerti Pop Up');
    } catch (error){
        console.error('An error occurred:', error.message);
        console.error('Error Stack:', error.stack);
    }
    try {
        await page.waitForSelector(selectors.cariAssetSearchBox, { timeout : 3000 });
        const StockNameInput = await page.$(selectors.cariAssetSearchBox);
        await StockNameInput.type(stockName);
        await delay(2000);
        await clickByClass(page,'css-2b5fr2');
        console.log('succesfully search and open stock name');
    } catch (error){
        console.error('An error occurred:', error.message);
        console.error('Error Stack:', error.stack);
    }
    // const pageHTML = await page.content(); // Get the full HTML of the page
    // console.log('Full HTML of the page:', pageHTML);
    try{
    const screenshotBuffer = await page.screenshot();

    // Close the browser
    // await browser.close();

    // Send the screenshot in the response with the appropriate MIME type
    res.set('Content-Type', 'image/png');
    res.send(screenshotBuffer); // Send the screenshot as the response
    } catch (error){
        console.error('An error occurred:', error.message);
        console.error('Error Stack:', error.stack);
    }
    try {
        await clickAndWaitForUrlEvenJustChange(page,'/saham/');
        await delay(1000);
        const beliButtonTab = await page.$(selectors.beliButtonTab);
        await beliButtonTab.click();
        const DayTradeButton= await page.$(selectors.dayTradingButton);
        await DayTradeButton.click();
        const dayTrade100Button= await page.$(selectors.dayTrade100PercentBuyingPower);
        await dayTrade100Button.click();
        const BeliButton = await page.$(selectors.BeliButton);
        await BeliButton.click();
        await page.waitForSelector(selectors.beliPopUp);
        const beliPopUpButton = await page.$(selectors.beliPopUp);
        await beliPopUpButton.click();
        console.log('succesfully beli');
    } catch (error){
        console.error('An error occurred:', error.message);
        console.error('Error Stack:', error.stack);
    }
    try {
        await delay(10000);
        const jualButtonTab=await page.$(selectors.jualButtonTab);
        await jualButtonTab.click();
        const DayTradeButton= await page.$(selectors.dayTradingButton);
        await DayTradeButton.click();
        const dayTrade100Button= await page.$(selectors.dayTrade100PercentBuyingPower);
        await dayTrade100Button.click();
         // Get the price value from the page (e.g., input field or element containing price)
        const priceText = await page.$eval(selectors.inputPriceBox, element => element.textContent || element.value);
        
        // Parse the price into an integer (e.g., 3780 as number)
        let priceInt = parseInt(priceText.replace('.', ''), 10);    
        // Example gain and loss values (percentage)
        const gain = 1; // 10% gain
        const loss = 1;  // 5% loss
        console.log(`start call setgainloss ${priceInt}`);
        console.log(`Price: ${priceInt}`);
        // Calculate adjusted loss and gain
        const { adjusted_loss, adjusted_gain } = setgainloss(priceInt, loss, gain);
    
        
        console.log(`Adjusted Loss: ${adjusted_loss}`);
        console.log(`Adjusted Gain: ${adjusted_gain}`);
    
        await page.$eval(selectors.inputPriceBox, element => element.value='');
        const sellPriceInputBox = await page.$(selectors.inputPriceBox);
        const adjustedGainString= adjusted_gain.toString();
        await sellPriceInputBox.type(adjustedGainString);
        const sellButton= await page.$(selectors.jualButton);
        await sellButton.click(); //jemur
        await page.waitForSelector(selectors.jualPopUp);
        const jualPopUpButton = await page.$(selectors.jualPopUp);
        await jualPopUpButton.click();
        console.log('succesfully selling');
    } catch (error){
        console.error('An error occurred:', error.message);
        console.error('Error Stack:', error.stack);
    }
    // Close the browser after completion
    await delay(5000)
    await browser.close();
    res.send('Finish');
};
module.exports = { buy };

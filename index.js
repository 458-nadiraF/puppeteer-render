const express = require("express");
const puppeteer= require("puppeteer");

const { buy, bersiap, solvingpin , cekRiwayat , stopLoop } = require("./buy");

const app = express();

const PORT = process.env.PORT || 8080;

let browser = null;
let page = null;
let browserTimeout = null;
const headlessMode = false;

// Function to launch a new browser and keep it alive for 5 minutes
const launchBrowser = async () => {
    browser = await puppeteer.launch({
        headless:true,
        args: [
          "--disable-setuid-sandbox",
          "--no-sandbox",
          "--no-zygote",
          "--no-cache",
          "--single-process",
          "--disable-dev-shm-usage",
            
        ],
          // process.env.NODE_ENV === "production"
          //   ? 
          //   : puppeteer.executablePath(),
          executablePath:
          process.env.NODE_ENV === "production"
            ? process.env.PUPPETEER_EXECUTABLE_PATH
            : puppeteer.executablePath(),
  });
  page = await browser.newPage();
  page.setViewport({
      width: 1366,
      height:768,
      deviceScaleFactor:1,
  });

  // Set a timeout to close the browser after 5 minutes (300000ms)
  // browserTimeout = setTimeout(async () => {
  //   console.log('Browser timeout reached. Closing the browser.');
  //   await browser.close();
  //   browser = null;
  //   page = null;
  // }, 300000); // 5 minutes
};
app.get('/stop',async(req,res) =>{
  try{
    await stopLoop(res);
  }catch(error){
    console.error(error.message);
  } try{
    console.log('try closing server');
    server.close();
    console.log('server closed');
  }catch(error){
    console.error(error.message);
  }
})
app.get('/screenshot', async (req, res) => {
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
});
// Route for /bersiap
app.get('/bersiap', async (req, res) => {
  try {
    if (!browser || !page) {
      // If no browser is launched, start it
      await launchBrowser();
    }
    await bersiap(page,req,res);
    // Respond back to the client with a success message
    // res.send('Bersiap action completed!');
    
  } catch (error) {
    console.error('Error in /bersiap route:', error);
    res.status(500).send('Error performing Bersiap action');
  }
});
app.get('/solvepin', async (req, res) => {
  try {
    if (!browser || !page) {
      // If no browser is launched, start it
      await launchBrowser();
    }
    await solvingpin(page,req,res);
    // Respond back to the client with a success message
    // res.send('Bersiap action completed!');
    
  } catch (error) {
    console.error('Error in /bersiap route:', error);
    res.status(500).send('Error performing Bersiap action');
  }
});
// //route to check bid-ask price
// app.get('/checkbidask', async (req, res) => {
//   try {
//     // Get all price containers
//     const priceData = await page.$$eval('div.css-jw5rjj', (sections) => {
//       return sections.map(section => {
//         const header = section.querySelector('div.css-bk50lk');
//         const isBid = header.querySelector('span:nth-child(2)').textContent === 'Bid';
//         const isAsk = header.querySelector('span:first-child').textContent === 'Ask';

//         const prices = Array.from(section.querySelectorAll('div:not(.css-bk50lk)'))
//           .map(div => div.querySelector('.item-price')?.textContent.trim())
//           .filter(Boolean);

//         return {
//           type: isBid ? 'bid' : isAsk ? 'ask' : 'unknown',
//           prices
//         };
//       });
//     });

//     // Extract bid and ask prices
//     const bidPrices = priceData.find(d => d.type === 'bid')?.prices || [];
//     const askPrices = priceData.find(d => d.type === 'ask')?.prices || [];

//     res.send({
//       bid: bidPrices[0] || 'Not found',
//       ask: askPrices[0] || 'Not found'
//     });
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).send('Error retrieving prices');
//   }
// });

// Route for /buy
app.get('/buy', async (req, res) => {
  try {
    if (!browser || !page) {
      // If no browser is launched, start it
      await launchBrowser();
      await bersiap(page,req,res);
    }
    await buy(page, browser, req,res);
    //res.send('Bersiap action completed!');
    
  } catch (error) {
    console.error('Error in /bersiap route:', error);
    res.status(500).send('Error performing Bersiap action');
  }
});
app.get('/cekRiwayat', async (req, res) => {
  try {
    if (!browser || !page) {
      // If no browser is launched, start it
      await launchBrowser();
      await bersiap(page,req,res);
    }
    await cekRiwayat(page, browser, req,res);
    //res.send('Bersiap action completed!');
    
  } catch (error) {
    console.error('Error in /bersiap route:', error);
    res.status(500).send('Error performing Bersiap action');
  }
});
app.get("/", (req, res) => {
    console.log('Active');
    res.status(200).send("Active");
});

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

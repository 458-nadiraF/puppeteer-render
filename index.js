const express = require("express");
const puppeteer= require("puppeteer");
const { buy, bersiap, solvingpin } = require("./buy");
const app = express();

const PORT = process.env.PORT || 4000;

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
        ],
        executablePath:
          process.env.NODE_ENV === "production"
            ? process.env.PUPPETEER_EXECUTABLE_PATH
            : puppeteer.executablePath(),
  });
  page = await browser.newPage();

  // Set a timeout to close the browser after 5 minutes (300000ms)
  // browserTimeout = setTimeout(async () => {
  //   console.log('Browser timeout reached. Closing the browser.');
  //   await browser.close();
  //   browser = null;
  //   page = null;
  // }, 300000); // 5 minutes
};

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
    console.error('Error in /solvepin route:', error);
    res.status(500).send('Error performing solve pin action');
  }
});
app.get('/ended', async (req, res) => {
  try {
    if (!browser || !page) {
      // If no browser is launched, start it
      // await launchBrowser();
    }
    await ended(page,req,res);
    // Respond back to the client with a success message
    // res.send('Bersiap action completed!');
    
  } catch (error) {
    console.error('Error in /ended route:', error);
    res.status(500).send('Error performing Ended action');
  }
});
//route to check bid-ask price
app.get('/checkbidask', async (req, res) => {
  try {
    // Get all price containers
    const priceData = await page.$$eval('div.css-jw5rjj', (sections) => {
      return sections.map(section => {
        const header = section.querySelector('div.css-bk50lk');
        const isBid = header.querySelector('span:nth-child(2)').textContent === 'Bid';
        const isAsk = header.querySelector('span:first-child').textContent === 'Ask';

        const prices = Array.from(section.querySelectorAll('div:not(.css-bk50lk)'))
          .map(div => div.querySelector('.item-price')?.textContent.trim())
          .filter(Boolean);

        return {
          type: isBid ? 'bid' : isAsk ? 'ask' : 'unknown',
          prices
        };
      });
    });

    // Extract bid and ask prices
    const bidPrices = priceData.find(d => d.type === 'bid')?.prices || [];
    const askPrices = priceData.find(d => d.type === 'ask')?.prices || [];

    res.send({
      bid: bidPrices[0] || 'Not found',
      ask: askPrices[0] || 'Not found'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error retrieving prices');
  }
});

// Route for /buy
app.get('/buy', async (req, res) => {
  try {
    if (!browser || !page) {
      // If no browser is launched, start it
      await launchBrowser();
      await bersiap(page,req,res);
    }
    await buy(page, req,res);
    res.send('Bersiap action completed!');
    
  } catch (error) {
    console.error('Error in /checkbidask route:', error);
    res.status(500).send('Error performing checkbidask action');
  }
});

app.get("/", (req, res) => {
  res.send("Active");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

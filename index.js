const express = require("express");
const puppeteer= require("puppeteer");
const { buy, bersiap } = require("./buy");
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
    res.send('Bersiap action completed!');
    
  } catch (error) {
    console.error('Error in /bersiap route:', error);
    res.status(500).send('Error performing Bersiap action');
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
    console.error('Error in /bersiap route:', error);
    res.status(500).send('Error performing Bersiap action');
  }
});

app.get("/", (req, res) => {
  res.send("Active");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

// Wikipedia Scraper -- Simply searches Google for a given topic and downloads the top Wikipedia article to a specified directory

const puppeteer = require('puppeteer') // headless browser
const fs = require('fs') // used to write to file system
const path = require('path')

const searchTerm = process.argv[2]
// if download directory doesn't exist, create it
const downloadDir = path.join(__dirname, 'downloads')
const outputDir = process.argv[3] // create downloads directory in path to hold downloaded articles

if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir)
  fs.mkdirSync(downloadDir + '/' + outputDir) // create download directory if it doesn't exist
} else {
  // if output directory exists, store the search term in the existing directory
  console.log(`${outputDir} directory already exists...`)
  console.log(`Placing ${searchTerm} in ${outputDir} directory...`)
  fs.writeFileSync(downloadDir + '/' + outputDir + '/' + searchTerm + '.pdf', searchTerm)
}

// show instructions on launch
if (!searchTerm || !outputDir) {
  console.log('Usage: node index.js <search term> <output directory>')
  process.exit(1)
} else {
  console.log('📜🤖 Article Downloaded 🤖📜')
  console.log(`Saved in ${outputDir} 👾👾👾`)
}

// search Google for Wiki articles
async function searchWiki (searchTerm) {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.goto('https://www.google.com/search?q=' + searchTerm + '+wiki')

  // grab the first Wikipedia article link
  const wikiLink = await page.evaluate(() => {
    const links = document.querySelectorAll('a') // grab all links
    for (let i = 0; i < links.length; i++) { // loop through links
      if (links[i].href.includes('wikipedia.org')) { // return if link is a Wiki article
        return links[i].href
      }
    }
  })

  // download the article to the output directory as pdf
  await page.goto(wikiLink)

  if (wikiLink) {
    await page.pdf({
      path: path.join(downloadDir + '/' + outputDir, searchTerm + '.pdf'),
      format: 'A4'
    })
  } else {
    console.log('No Wikipedia article found for ' + searchTerm)
  }

  // close browser
  await browser.close()
}

searchWiki(searchTerm)

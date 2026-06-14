/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Configures the launch options for puppeteer.launch()
  launch: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: {
      width: 1280,
      height: 800
    }
  },
};

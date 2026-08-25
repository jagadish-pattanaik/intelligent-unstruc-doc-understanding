const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(3000);
  
  const debugInfo = await page.evaluate(() => {
    const el = document.querySelector('.laser-flow-container');
    if (!el) return { error: 'No .laser-flow-container found' };
    const rect = el.getBoundingClientRect();
    const canvas = el.querySelector('canvas');
    let canvasInfo = 'No canvas';
    if (canvas) {
        canvasInfo = {
            width: canvas.width,
            height: canvas.height,
            styleDisplay: canvas.style.display,
            styleWidth: canvas.style.width,
            styleHeight: canvas.style.height
        };
    }
    const webglCtx = canvas ? canvas.getContext('webgl') || canvas.getContext('webgl2') : null;
    return {
      containerRect: rect,
      canvasInfo: canvasInfo,
      hasWebGLContext: !!webglCtx,
      innerHTML: el.innerHTML
    };
  });
  
  console.log('DEBUG_INFO:', JSON.stringify(debugInfo, null, 2));
  await browser.close();
})();

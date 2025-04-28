const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const url = 'https://tagpro.koalabeast.com/game?replay=ZwRtnTngK_FxTv2VUtFLqBwPGxQhJ30M&t=300288'; // Replace with the URL containing the canvas
  // const url = 'https://tagpro.koalabeast.com/game?replay=ZvnGwcU4MU8shaAHU2bKxxHb5xQX6WgA&t=80256';
  console.log('Launching Puppeteer...');

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome', // Path to Chrome in WSL
    headless: true, // Set to false to see the canvas
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized'],
	defaultViewport: null,
  });

  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    console.log('Page loaded successfully.');




  } catch (error) {
    console.error('Failed to load the page:', error);
    await browser.close();
    return;
  }

  await page.evaluate(() => {
    tagpro.loadAssets({
      "tiles":        'https://static.koalabeast.com/textures/nom/tiles.png',
      "speedpad":     'https://static.koalabeast.com/textures/nom/speedpad.png',
      "speedpadRed":  'https://static.koalabeast.com/textures/nom/speedpadred.png',
      "speedpadBlue": 'https://static.koalabeast.com/textures/nom/speedpadblue.png',
      "portal":       'https://static.koalabeast.com/textures/nom/portal.png',
      "portalRed":    'https://static.koalabeast.com/textures/nom/portalred.png',
      "portalBlue":   'https://static.koalabeast.com/textures/nom/portalblue.png',
      "splats":       'https://static.koalabeast.com/textures/nom/splats.png',
    });
  });



// try {
//   // Wait for 'tagpro' to be available and then execute the loadAssets function
//   await page.waitForFunction(() => window.tagpro !== undefined);

//   // Execute the loadAssets function within the page's context
//   await page.evaluate(() => {
// if (tagpro.loadAssets) {
//     tagpro.loadAssets({
//       "tiles":        'https://static.koalabeast.com/textures/nom/tiles.png',
//       "speedpad":     'https://static.koalabeast.com/textures/nom/speedpad.png',
//       "speedpadRed":  'https://static.koalabeast.com/textures/nom/speedpadred.png',
//       "speedpadBlue": 'https://static.koalabeast.com/textures/nom/speedpadblue.png',
//       "portal":       'https://static.koalabeast.com/textures/nom/portal.png',
//       "portalRed":    'https://static.koalabeast.com/textures/nom/portalred.png',
//       "portalBlue":   'https://static.koalabeast.com/textures/nom/portalblue.png',
//       "splats":       'https://static.koalabeast.com/textures/nom/splats.png',
//     });
// }
//   });
// 	console.log('loaded tagpro assets')

//   } catch (error) {
//     console.error('tagpro object not found:', error);
//     await browser.close();
//     return;
//   }



  try {
    await page.waitForSelector('canvas', { timeout: 7000 });
    console.log('Canvas element is available.');

  } catch (error) {
    console.error('Canvas element not found:', error);
    await browser.close();
    return;
  }



  try {

    const videoData = await page.evaluate(() => {
      console.log('Starting canvas recording evaluation');













		const canvas = document.querySelector('canvas');







		const ctx = canvas.getContext('2d');
		ctx.imageSmoothingEnabled = false; // Disable smoothing for crisper images

      if (!canvas) {
        throw new Error('Canvas element not found!');
      }

      console.log('Canvas found, starting stream...');
	const stream = canvas.captureStream(60); // Capture at 60 FPS
	const options = {
		mimeType: 'video/webm;codecs=h264', // Use VP9 codec for high quality
		videoBitsPerSecond: 20000000, // Set bitrate to 10 Mbps (10,000,000 bits per second)
		audioBitsPerSecond: 320000 // 320 Kbps for audio
	};

	const mediaRecorder = new MediaRecorder(stream, options);
      const chunks = [];

      return new Promise((resolve) => {
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
            console.log('Chunk recorded:', event.data.size, 'bytes');
          }
        };

        mediaRecorder.onstop = () => {
          console.log('Recording stopped. Processing chunks...');
          const blob = new Blob(chunks, { type: 'video/webm' });
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result.split(',')[1]; // Strip the base64 header
            resolve(base64data);
          };
          reader.readAsDataURL(blob);
        };

        mediaRecorder.onerror = (error) => {
          console.error('MediaRecorder error:', error);
        };

        mediaRecorder.start();

        setTimeout(() => {
          console.log('Stopping media recorder...');
          mediaRecorder.stop();
        }, 10000);
      });
    });

    // Save the file in Node.js
    const buffer = Buffer.from(videoData, 'base64');
    fs.writeFileSync('canvas-recording.webm', buffer, 'base64');
    console.log('Recording saved as canvas-recording.webm');

  } catch (error) {
    console.error('Error during page.evaluate():', error);
  }

  console.log('Closing browser...');
  await browser.close();
  console.log('Browser closed.');
})();

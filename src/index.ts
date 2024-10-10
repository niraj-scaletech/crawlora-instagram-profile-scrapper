import { apikey, sequence_id, showBrowser } from "./config";
import { browser } from "@crawlora/browser";

export default async function ({
  usernames, // data coming from textarea which means it is multiline
}: {
  usernames: string;
}) {
  const formedData = usernames.trim().split("\n").map(v => v.trim());

  await browser(async ({ page, wait, output, debug }) => {
    // Setup proxy before navigating to any URL
    await setupProxy(page);

    for await (const username of formedData) {
      const profileURL = `https://www.instagram.com/${username}/`;

      try {
        const response = await page.goto(profileURL, { waitUntil: 'networkidle2' });

        if (!response || response.status() !== 200) {
          console.error(`Failed to load profile for ${username}: ${response?.status()}`);
          continue; // Skip to the next username
        }

        // Wait for the profile header to load
        await page.waitForSelector('header');

        // Scrape profile information
        const profileData = await page.evaluate(() => {
          const username = document.querySelector('header h2')?.textContent || 'N/A';
          const bio = document.querySelector('div.-vDIg span')?.textContent || 'N/A';
          const postCount = document.querySelectorAll('span.g47SY')[0]?.textContent || 'N/A'; // Number of posts
          const followerCount = document.querySelectorAll('span.g47SY')[1]?.textContent || 'N/A'; // Number of followers
          const followingCount = document.querySelectorAll('span.g47SY')[2]?.textContent || 'N/A'; // Number of following

          return {
            username,
            bio,
            postCount,
            followerCount,
            followingCount,
          };
        });

        console.log(profileData); // Output the profile data

      } catch (error) {
        console.error(`Error accessing profile ${username}:`, error);
      }

      await wait(2); 
    }

  }, {
    showBrowser,
    apikey
  });
}

// Create a separate function to handle proxy setup
async function setupProxy(page: any) {
  const proxyHost = ''; // Replace with your proxy host
  const proxyPort = 0; // Replace with your proxy port
  const proxyUser = ''; // Add your proxy username if required
  const proxyPass = ''; // Add your proxy password if required

}

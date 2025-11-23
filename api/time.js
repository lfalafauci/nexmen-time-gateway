// api/time.js
import fetch from "node-fetch";
import { JSDOM } from "jsdom";

export default async function handler(req, res) {
  try {
    const url = "https://www.oraesatta.co/";

    const response = await fetch(url);
    const html = await response.text();

    const dom = new JSDOM(html);
    const document = dom.window.document;

    // PROVVISORIO: testo generico del titolo
    // Poi aggiorniamo con il selettore giusto quando analizziamo l’HTML finale
    const timeElement = document.querySelector("title");

    if (!timeElement) {
      return res.status(500).json({
        error: "CLOCK_ELEMENT_NOT_FOUND"
      });
    }

    const rawTitle = timeElement.textContent.trim();

    res.status(200).json({
      source: "oraesatta.co",
      extracted: rawTitle
    });

  } catch (err) {
    res.status(500).json({
      error: "SCRAPING_ERROR",
      details: err.message
    });
  }
}

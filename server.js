// server.js (Final Enhanced Version)

import express from "express";
import Cite from "citation-js";
import axios from "axios";
import { load } from "cheerio";
import "dotenv/config";
import cors from "cors";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

const app = express();
import authRoutes from "./routes/auth.js";
import citationRoutes from "./routes/citations.js";
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json()); // Parses JSON body
app.use('/api', authRoutes);
app.use('/api', citationRoutes);


/* --- helpers ------------------------------------------------------------ */

async function scrapeMeta(url) {
  const { data: html } = await axios.get(url, { timeout: 8000 });
  const $ = load(html);

  const title =
    $('meta[property="og:title"]').attr("content") ||
    $('meta[name="twitter:title"]').attr("content") ||
    $("title").text() ||
    $('[itemprop="headline"]').text();

  const author =
    $('meta[name="author"]').attr("content") ||
    $('[rel="author"]').first().text() ||
    $('[class*="author"], [class*="byline"]').first().text() ||
    $('[itemprop="author"]').first().text();

  const issuedRaw =
    $('meta[property="article:published_time"]').attr("content") ||
    $('meta[name="pubdate"]').attr("content") ||
    $("time[datetime]").attr("datetime") ||
    $('[itemprop*="datePublished"]').attr("content");

  const issued = issuedRaw?.slice(0, 10);

  return {
    title: cleanText(title) || "Unknown Title",
    author: cleanText(author) || "Unknown Author",
    issued: issued || "Unknown Date",
    URL: url
  };
}

async function getMetadataWithAI(html) {
  const prompt = `Extract citation information from the following article HTML. Return as JSON with these fields only: {\n  \"title\": \"...\",\n  \"author\": \"...\",\n  \"issued\": \"YYYY-MM-DD\"\n}`;

  const completion = await openai.chat.completions.create({
    model: "llama3-70b-8192",
    messages: [{ role: "user", content: prompt + "\n\nHTML:\n" + html.slice(0, 12000) }],
    temperature: 0.3
  });

  const raw = completion.choices[0].message.content;

  try {
    return JSON.parse(raw);
  } catch {
    return { title: "Unknown", author: "Unknown", issued: "n.d." };
  }
}

function cleanText(input) {
  return input?.replace(/\s+/g, " ").trim();
}

function injectAccessDate(record) {
  const today = new Date();
  record.accessed = {
    "date-parts": [[today.getFullYear(), today.getMonth() + 1, today.getDate()]]
  };
  return record;
}

/* --- route -------------------------------------------------------------- */

app.get("/api/cite", async (req, res) => {
  const { url, style = "apa", method = "auto" } = req.query;
  if (!url) return res.status(400).json({ error: "Missing ?url=" });

  console.log("🔗 Incoming URL:", url);

  try {
    let record;

    if (method === "citation-js") {
      const cite = new Cite(url);
      await cite.promise;
      record = cite.data[0];
    } else if (method === "scrape") {
      record = await scrapeMeta(url);
    } else if (method === "ai") {
      const { data: html } = await axios.get(url, { timeout: 8000 });
      const aiData = await getMetadataWithAI(html);
      record = { ...aiData, URL: url };
    } else {
      try {
        const cite = new Cite(url);
        await cite.promise;
        record = cite.data[0];
      } catch {
        record = await scrapeMeta(url);
        if (!record?.title || !record?.author || !record?.issued || record.title === "Unknown Title") {
          const { data: html } = await axios.get(url, { timeout: 8000 });
          const aiData = await getMetadataWithAI(html);
          record = { ...aiData, URL: url };
        }
      }
    }

    // 📌 Inject access date for Harvard and Chicago styles
    const accessStyles = ["harvard-cite-them-right", "chicago-author-date"];
    if (accessStyles.includes(style)) {
      record = injectAccessDate(record);
    }

    let inText, reference;

    try {
      const citeInstance = new Cite(record);

      inText = citeInstance.format("citation", {
        format: "text",
        template: style,
        lang: "en-US"
      });

      reference = citeInstance.format("bibliography", {
        format: "html",
        template: style,
        lang: "en-US"
      });
    } catch (err) {
      console.error("❌ Citation formatting failed:", err.message);

      const year = record.issued?.slice(0, 4) || "n.d.";
      const author = record.author || "Unknown";

      inText = `(${author}, ${year})`;
      reference = `<p>${author}. ${year}. <i>${record.title || "Unknown Title"}</i>.</p>`;
    }

    res.json({ inText, reference, record });
  } catch (err) {
    console.error("🔥 Unexpected error:", err.stack);
    res.status(500).json({ error: err.message });
  }
});

/* --- server start ------------------------------------------------------- */

app.listen(PORT, () =>
  console.log(`API running on http://localhost:${PORT}`)
);

import db from './db.js';

app.get('/api/dbtest', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ FULL DB ERROR:', err); // log entire error object
    res.status(500).json({
      error: err?.message || err?.code || JSON.stringify(err) || 'Unknown DB error'
    });
  }
});

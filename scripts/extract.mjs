import fs from "fs/promises";
import path from "path";
import fetch from "node-fetch";
import { fileURLToPath } from "url";

const [, , lang] = process.argv;
const BASE_URI = `https://${lang}.mstdn.wiki/api.php`;

async function* listAllPages() {
  let apcontinue = null;

  while (true) {
    const query = new URLSearchParams({
      format: "json",
      action: "query",
      list: "allpages",
      apcontinue: apcontinue != null ? apcontinue : '',
    }).toString();

    const res = await fetch(BASE_URI + "?" + query);
    const data = await res.json();
    apcontinue = data.continue?.apcontinue;

    if (apcontinue == null) {
      break;
    }

    console.log(`\tfetched ${data.query.allpages.length} pages`);
    yield data.query.allpages.map((page) => page.title);
  }
}

const extractWiki = async (page) => {
  console.log(`\t\tdump ${page}.wiki`);
  const query = new URLSearchParams({
    format: "json",
    action: "parse",
    page,
    formatversion: 2,
    prop: "wikitext",
  }).toString();

  const res = await fetch(BASE_URI + "?" + query);
  const data = await res.json();
  const text = data.parse.wikitext;

  await fs.writeFile(
    path.join(
      fileURLToPath(import.meta.url),
      `../../data/${lang}/wiki/${page.replace("/", "_")}.wiki`
    ),
    text,
    "utf8"
  );
};

const extractHtml = async (page) => {
  console.log(`\t\tdump ${page}.html`);
  const query = new URLSearchParams({
    format: "json",
    action: "parse",
    page,
    formatversion: 2,
  }).toString();

  const res = await fetch(BASE_URI + "?" + query);
  const data = await res.json();
  const text = data.parse.text;

  await fs.writeFile(
    path.join(
      fileURLToPath(import.meta.url),
      `../../data/${lang}/html/${page.replace("/", "_")}.html`
    ),
    text,
    "utf8"
  );
};

(async () => {
  for await (const pages of listAllPages()) {
    await Promise.all(
      pages.map(async (page) => {
        await extractHtml(page);
        await extractWiki(page);
      })
    );
  }
})();

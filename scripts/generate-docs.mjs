import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const [, , lang, mobile] = process.argv;
const WIKI_NAME = {
    ja: "マストドン日本語ウィキアーカイブ",
    en: "Archive of the Mastodon Wiki",
    fr: "Archive du wiki de Mastodon",
};
const wikiName = WIKI_NAME[lang];

async function* listAllPages() {
    yield await fs.readdir(path.join(
        fileURLToPath(import.meta.url),
        `../../data/${lang}/${ mobile ? 'mobile-': '' }html/`
    ));
}

const generateDocs = async (page) => {
    console.log(`\t\tcreate ${page}`);
    const file = await fs.readFile(path.join(
        fileURLToPath(import.meta.url),
        `../../data/${lang}/html/${page}`
    ), 'utf8');
    const title = page.replace(/.html$/, '');

    const text = `<html class="client-js ve-not-abailable" lang=${lang}>
<head>
    <meta charset="UTF-8">
    <title>${title} - ${wikiName}</title>
    <meta name="viewport" content="initial-scale=1.0, user-scalable=yes, minimum-scale=0.25, maximum-scale=5.0, width=device-width">
    <link type="text/css" rel="stylesheet" href="style.css">
    <style>
        body {
            margin:20px;
        }
        .mw-editsection {
            display: none;
        }
        .mw-body {
            border: none;
            margin: 0;
        }
        #wikiTitleMastodonWikiOriginal {
            color: #a2a9b1;
        }
    </style>
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="${wikiName}">
    <meta property="og:title" content="${title}">
</head>
<body class="mediawiki ltr sitedir-ltr mw-hide-empty-elt ns-0 ns-subject page-11t rootpage-11t skin-vector action-view">
  <div id="content" class="mw-body" role="main">
    <span id="wikiTitleMastodonWikiOriginal"><a href="index.html">${wikiName}</a></span>
    <h1 id="firstHeading" class="firstHeading">${title}</h1>
    ${file}
    </div>
</body>
</html>`;

    await fs.writeFile(
        path.join(
        fileURLToPath(import.meta.url),
        `../../docs/${lang}/${page}`
        ),
        text,
        "utf8"
    );
    console.log(`\t\tcreated ${page}`);
}

const generateMobileDocs = async (page) => {
    console.log(`\t\tcreate ${page}`);
    const file = await fs.readFile(path.join(
        fileURLToPath(import.meta.url),
        `../../data/${lang}/mobile-html/${page}`
    ), 'utf8');
    const title = page.replace(/.html$/, '');
    
    const text = `<html class="client-js mf-font-size-null" lang=${lang}>
<head>
    <meta charset="UTF-8">
    <title>${title} - ${wikiName}</title>
    <meta name="viewport" content="initial-scale=1.0, user-scalable=yes, minimum-scale=0.25, maximum-scale=5.0, width=device-width">
    <link type="text/css" rel="stylesheet" href="style.mobile.css">
    <style>
        .mw-editsection {
            display: none !important;
        }
        .header .branding-box {
            padding-left: 10px;
        }
        .heading-holder {
            padding-bottom: 20px;
        }
    </style>
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="${wikiName}">
    <meta property="og:title" content="${title}">
</head>
<body class="mediawiki ltr sitedir-ltr mw-hide-empty-elt ns-0 ns-subject page-Masto_Host rootpage-Masto_Host stable skin-minerva action-view animations touch-events">
    <div class="mw-mf-viewport">
        <div class="mw-mf-page-center">
            <div class="header-container header-chrome">
                <form class="header">
                    <div class="branding-box">
                        <h1><span><a href="index.html">${wikiName}</a></span></h1>
                    </div>
                </form>
            </div>
            <div id="content" class="mw-body">
                <div class="pre-content heading-holder">
                    <h1 id="section_0">${title}</h1>
                </div>
                <div id="bodyContent" class="content">
                    <div id="mw-content-text" class="mw-content-ltr">
                        ${file}
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;

    await fs.writeFile(
        path.join(
        fileURLToPath(import.meta.url),
        `../../docs/mobile/${lang}/${page}`
        ),
        text,
        "utf8"
    );
    console.log(`\t\tcreated ${page}`);
}

(async () => {
  for await (const pages of listAllPages()) {
    await Promise.all(
      pages.map(async (page) => {
        mobile ? await generateMobileDocs(page) : await generateDocs(page);
      })
    );
  }
})();
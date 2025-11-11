import { sanitizeUrl } from "./sanitize-url";
import * as cheerio from "cheerio";

export const scrapeWebsite = async (url: string) => {
  const companyUrl = sanitizeUrl(url);

  //Check if companyUrl is valid
  if (!companyUrl.includes("https://")) {
    throw new Error("Invalid company URL " + companyUrl);
  }

  //GEt company data
  const companyData = await fetch(companyUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  const companyDataText = await companyData.text();
  const $ = cheerio.load(companyDataText);

  return {
    filledData: $.text(),
    siteTitle:
      $("meta[property='og:site_name']").attr("content") ||
      $("meta[property='og:title']").attr("content") ||
      $("title").text(),
    siteDescription:
      $("meta[property='og:description']").attr("content") ||
      $("meta[name='description']").attr("content") ||
      $("meta[name='twitter:description']").attr("content") ||
      "",
    siteImage:
      $("meta[property='og:image']").attr("content") ||
      $("meta[name='twitter:image']").attr("href") ||
      $("link[rel='apple-touch-icon']").attr("href") ||
      $("link[rel='icon']").attr("href") ||
      "",
  };
};

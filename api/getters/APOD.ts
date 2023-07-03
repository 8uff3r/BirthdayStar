import { load } from "cheerio";
import got from "got";

export const getApod = async () => {
  const res = await got.get("https://apod.nasa.gov/apod/astropix.html");
  const $ = load(res.body, null, false);
  const Apod = {
    name: $("b").first().html()?.trim(),
    desc: $("p").eq(2).not("b").text()?.replace("Explanation: ", "").replaceAll("\n", " ").trim(),
    img: $("img").first().attr("src"),
    vid: $("iframe").first().attr("src"),
  };
  return Apod;
};

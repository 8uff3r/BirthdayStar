import axios from "axios";
import { load } from "cheerio";

export const getApod = async () => {
	const res = await axios.get("https://apod.nasa.gov/apod/astropix.html");
	const $ = load(res.data, null, false);
	const Apod = {
		name: $("b").first().html()?.trim(),
		desc: $("p")
			.eq(2)
			.not("b")
			.text()
			?.replace("Explanation: ", "")
			.replaceAll("\n", " ")
			.trim(),
		img: $("img").first().attr("src"),
		vid: $("iframe").first().attr("src"),
	};
	return Apod;
};

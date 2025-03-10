import axios from "axios";
import { load } from "cheerio";
// @ts-ignore
import zeroFill from "zero-fill";

export const getBS = async ([by, bm, bd]: number[]) => {
	const res = await axios.post(
		"http://freeant.net/birthdaystar/home.php?lang=1",
		{
			obsd: "21/05/2023",
			bd: `${zeroFill(2, bd)}/${zeroFill(2, bm)}/${zeroFill(4, by)}`,
			yr: "1969",
			btnbd: "Find+by+Birthdate",
		},
		{
			headers: {
				"Content-Type": "multipart/form-data",
			},
		},
	);

	// const buffer = readFileSync("/home/rylan/file.html");
	// const $ = load(buffer, null, false);
	const $ = load(res.data, null, false);
	const stars = [
		{
			name: "",
			constellation: "",
			dist: "",
			offset: "",
			mag: "",
			href: [""],
			hip: "",
			hd: "",
			hrc: "",
			gl: "",
		},
	];
	$(".trrestitle")
		.children(":nth-child(1)")
		.not(":first")
		.each((i, elem) => {
			stars[i] = {
				name: "",
				constellation: "",
				dist: "",
				offset: "",
				mag: "",
				href: [""],
				hip: "",
				hd: "",
				hrc: "",
				gl: "",
			};
			stars[i]["name"] = $(elem).text().trim();
		});
	$(".trrestitle")
		.children(":nth-child(2)")
		.not(":first")
		.each((i, elem) => {
			stars[i].dist = $(elem).text().trim();
		});
	$(".trrestitle")
		.children(":nth-child(3)")
		.not(":first")
		.each((i, elem) => {
			stars[i].offset = $(elem).text().trim();
		});
	$(".trrestitle")
		.children(":nth-child(4)")
		.not(":first")
		.each((i, elem) => {
			stars[i].mag = $(elem).text().trim();
		});
	$(".trrestitle")
		.children(":nth-child(5)")
		.not(":first")
		.each((i, elem) => {
			stars[i].constellation = $(elem).text().trim();
			$(elem)
				.children()
				.each((j, elem) => {
					stars[i].href[j] = $(elem).attr("href")?.trim() ?? "";
				});
		});
	$(".trrestitle")
		.children(":nth-child(7)")
		.not(":first")
		.each((i, elem) => {
			stars[i].hip = $(elem).text().trim();
		});
	$(".trrestitle")
		.children(":nth-child(8)")
		.not(":first")
		.each((i, elem) => {
			stars[i].hd = $(elem).text().trim();
		});
	$(".trrestitle")
		.children(":nth-child(9)")
		.not(":first")
		.each((i, elem) => {
			stars[i].hrc = $(elem).text().trim();
		});
	$(".trrestitle")
		.children(":nth-child(10)")
		.not(":first")
		.each((i, elem) => {
			stars[i].gl = $(elem).text().trim();
		});
	// @ts-ignore
	return stars;
};

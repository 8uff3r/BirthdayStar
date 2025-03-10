import db from "../data/data.js";

export const SITE = "https://imagine.gsfc.nasa.gov/hst_bday/";
export const getHBI = (bm: number, bd: number) => {
	const ho = (db as { [key: string]: any })[`${bm}-${bd}`];
	return ho;
};

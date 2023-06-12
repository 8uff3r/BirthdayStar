import db from "./db.js";
export const SITE = "https://imagine.gsfc.nasa.gov/hst_bday/";
export const getHBI = (bm: number, bd: number) => {
  const ho = (db as { [key: string]: any })[`${bm}-${bd}`];
  return { imageURL: `${SITE}images/${ho.image}`, ...ho };
};

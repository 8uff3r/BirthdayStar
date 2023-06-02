import axios from "axios";
import { load } from "cheerio";
// @ts-ignore
import zeroFill from "zero-fill";

export const getBS = async ([by, bm, bd]: number[]) => {
  const res = await axios.post("http://freeant.net/birthdaystar/home.php?lang=1", {
    obsd: `21/05/2023`,
    bd: `${zeroFill(2, bd)}/${zeroFill(2, bm)}/${zeroFill(4, by)}`,
    yr: "1969",
    btnbd: "Find+by+Birthdate",
  }, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  const $ = load(res.data, null, false);
  return $(".tdresnameodd").text();
};

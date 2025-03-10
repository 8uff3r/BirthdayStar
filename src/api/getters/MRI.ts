import axios from "axios";
import { randomInt } from "crypto";

export const getMRI = async () => {
  const res = await axios.get(
    "https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=1000&api_key=DEMO_KEY",
  );
  return res.data["photos"][randomInt(800)]["img_src"];
};

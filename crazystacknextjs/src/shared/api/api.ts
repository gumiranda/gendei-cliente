 /* eslint-disable prefer-const */
import axios, { AxiosError } from "axios";
import { destroyCookie, parseCookies, setCookie } from "nookies";

let isRefreshing = false;
let failedRequestsQueue: any = [];
const MAX_RETRIES = 4;

export const getAxios = (token: string) => {
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export function setupAPIClient(ctx = undefined) {
  let cookies = ctx ? ctx : parseCookies();

  if (!cookies["belezixclient.token"]) {
    return null;
  }

  const aapi = getAxios(cookies["belezixclient.token"]);

  return aapi;
}

export const api = setupAPIClient();

export function signOut() {
  const allCookies = parseCookies();
  Object.keys(allCookies).forEach((cookieName) => {
    destroyCookie(undefined, cookieName);
  });
}

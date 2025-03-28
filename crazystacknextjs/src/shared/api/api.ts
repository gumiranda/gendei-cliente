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

  const api = getAxios(cookies["belezixclient.token"]);

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalConfig = error.config;
      originalConfig.retryCount = originalConfig.retryCount || 0;

      if (error.response?.status === 401 && error.response?.data?.error === "Unauthorized") {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const { "belezixclient.refreshToken": refreshToken } = cookies;
            const response = await api.get("/account/refresh", {
              headers: { refreshtoken: refreshToken },
            });

            const { accessToken: token, refreshToken: newRefreshToken } = response.data;
            setCookie(undefined, "belezixclient.token", token, {
              maxAge: 60 * 60 * 24 * 30, // 30 days
              path: "/",
            });
            setCookie(undefined, "belezixclient.refreshToken", newRefreshToken, {
              maxAge: 30 * 24 * 60 * 60,
              path: "/",
            });

            api.defaults.headers["Authorization"] = `Bearer ${token}`;
            api.defaults.headers["refreshtoken"] = `${newRefreshToken}`;

            failedRequestsQueue.forEach((request) => request.onSuccess(token));
            failedRequestsQueue = [];
          } catch (err) {
            failedRequestsQueue.forEach((request) => request.onFailure(err));
            failedRequestsQueue = [];
            if (typeof window === "undefined") {
              signOut();
            }
          } finally {
            isRefreshing = false;
          }
        }

        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            onSuccess: (token) => {
              originalConfig.headers["Authorization"] = `Bearer ${token}`;
              resolve(api(originalConfig));
            },
            onFailure: (err) => {
              reject(err);
            },
          });
        });
      }

      if (originalConfig.retryCount < MAX_RETRIES) {
        originalConfig.retryCount += 1;
        return api(originalConfig);
      }

      return Promise.reject(error);
    }
  );

  return api;
}

export const api = setupAPIClient();

export function signOut() {
  const allCookies = parseCookies();
  Object.keys(allCookies).forEach((cookieName) => {
    destroyCookie(undefined, cookieName);
  });
}

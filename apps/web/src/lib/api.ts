import axios from "axios";
import { ControllerConfig } from "sqnc-common";
import { QueryClient } from "react-query";

export const qc = new QueryClient();

export const client = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
});

const get = <C extends ControllerConfig>(url: string) => client.get<C["payload"]>(url).then((r) => r.data);

const post = <C extends ControllerConfig>(url: string, data?: C["body"]) =>
  client.post<C["payload"]>(url, data).then((r) => r.data);

export const api = {
};

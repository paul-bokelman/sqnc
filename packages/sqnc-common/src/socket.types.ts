import type { Request } from "express";
import type { ExtWebSocket } from "./utils.types";

export type Event<D, R = void> = (methods: { ws: ExtWebSocket; req: Request }, data: D) => Promise<R>;
export type ClientEvent<D, R = void> = (data: D) => Promise<R> | R;

export interface ClientToServerEvents {}

export interface ServerToClientEvents {}

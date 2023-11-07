import { DEFAULT_OPTIONS, HttpClient } from "../client/http";

export class SerdeHelper {
  private client: HttpClient;

  constructor(http: HttpClient) {
    this.client = http;
  }

  // TODO: https://github.com/nimiq/core-rs-albatross/blob/albatross/rpc-interface/src/serde_helpers.rs
}

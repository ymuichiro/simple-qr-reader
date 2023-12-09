import { payloadToAddress } from "../util/payload_to_address";
import { pubKeyToAddress } from "../util/pubkey_to_address";

export class QrService {
  static async getAddress(json: any): Promise<string> {
    const parsed = JSON.parse(json);
    if (typeof parsed === "string") {
      return parsed;
    }

    if (typeof parsed !== "object") {
      console.error("invalid data", parsed);
      return Promise.reject("QRコードの形式が正しくありません。");
    }

    if (parsed.type === 1) {
      return await this.forType1(parsed);
    } else if (parsed.type === 3) {
      return this.forType3(parsed);
    } else if (parsed.type === 7) {
      return this.forType7(parsed);
    }

    console.error("invalid type", parsed);
    return Promise.reject("予期しない QRコードタイプが渡されました");
  }

  private static async forType1(json: any): Promise<string> {
    const publicKey: string = json.data.publicKey;
    return await pubKeyToAddress(publicKey);
  }

  private static forType3(json: any): string {
    const payload: string = json.data.payload;
    return payloadToAddress(payload);
  }
  private static forType7(json: any): string {
    const address: string = json.data.address;
    return address;
  }
}

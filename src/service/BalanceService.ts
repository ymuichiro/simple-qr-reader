import { config } from "../util/config";

export class BalanceService {
  constructor(private address: string) {}

  public async isBalance(num: number): Promise<boolean> {
    const node = new URL(`accounts/${this.address}`, config.node);
    const res = await fetch(node, { method: "GET", headers: { "Content-Type": "application/json" } });

    if (res.status === 404) {
      return Promise.reject(`アカウント ${this.address} はネットワークに存在しません`);
    }

    const json = await res.json();

    const currency = (json.account.mosaics as { id: string; amount: string }[]).filter(
      (e) => e.id === config.currencyId
    );

    if (currency.length === 0) {
      return false;
    }

    if (Number(currency[0].amount).toString() == "NaN") {
      return false;
    }

    const absoluteValue: number = Number(currency[0].amount) / Math.pow(10, 6);
    if (num >= absoluteValue) {
      return false;
    }

    return true;
  }
}

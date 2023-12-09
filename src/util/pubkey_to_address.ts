import { config } from "./config";

function unresolvedAddressToEncodedAddress(unresolvedAddress: string) {
  // hex to bytes
  const bytesArray: number[] = [];
  for (var i = 0; i < unresolvedAddress.length; i += 2) {
    bytesArray.push(parseInt(unresolvedAddress.substr(i, 2), 16));
  }
  const uint8Array = new Uint8Array(bytesArray);

  // base32 encode
  const base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

  let bits: number = 0;
  let value: number = 0;
  let base32: string = "";

  for (var i = 0; i < uint8Array.length; i++) {
    value = (value << 8) | uint8Array[i];
    bits += 8;

    while (bits >= 5) {
      base32 += base32Chars[(value >>> (bits - 5)) & 0x1f];
      bits -= 5;
    }
  }

  if (bits > 0) {
    base32 += base32Chars[(value << (5 - bits)) & 0x1f];
  }

  return base32;
}

export async function pubKeyToAddress(publicKey: string): Promise<string> {
  const node = new URL(`accounts/${publicKey}`, config.node);
  const res = await fetch(node, { method: "GET", headers: { "Content-Type": "application/json" } }).then((e) =>
    e.json()
  );

  return unresolvedAddressToEncodedAddress(res.account.address);
}

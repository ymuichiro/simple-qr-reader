import { TransactionFactory } from "symbol-sdk/src/symbol/models";

function uint8arrayUnresolvedAddressToEncodedAddress(uint8Array: Uint8Array): string {
  const base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

  let bits = 0;
  let value = 0;
  let base32 = "";

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

export function payloadToAddress(payload: string): string {
  const _payload = payload.match(/.{1,2}/g);
  if (_payload) {
    const uint8Array = new Uint8Array(_payload.map((byte) => parseInt(byte, 16)));
    const encodedAddress = uint8arrayUnresolvedAddressToEncodedAddress(
      TransactionFactory.deserialize(uint8Array).recipientAddress.bytes
    );
    return encodedAddress;
  } else {
    throw new Error("入力が正しくありません。");
  }
}

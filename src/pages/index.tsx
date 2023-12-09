import { BrowserQRCodeReader } from "@zxing/browser";
import * as React from "react";
import { FC, useEffect, useRef } from "react";
import { BalanceService } from "../service/BalanceService";
import { QrService } from "../service/QrService";
import { config } from "../util/config";

async function addressCheck(json: string): Promise<{ result: boolean; address: string; message: string }> {
  const address = await QrService.getAddress(json).catch((e) =>
    Promise.reject({ result: false, address: "unknown", message: `QRコードが正しくありません ${e}` })
  );
  const result = await new BalanceService(address)
    .isBalance(100)
    .catch((e) => Promise.reject({ result: false, address, message: `残高を取得できません ${e}` }));
  return { result, address, message: "" };
}

const QrCodeReader: FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mountedRef = useRef<boolean>(false);

  useEffect(() => {
    mountedRef.current = true;
    const codeReader = new BrowserQRCodeReader(undefined, undefined);
    codeReader.decodeFromVideoDevice(undefined, videoRef.current!, function (result, _, controls) {
      if (mountedRef.current === false) {
        return;
      }
      if (typeof result !== "undefined") {
        addressCheck(result.getText())
          .then((e) => {
            if (e.result) {
              alert(`OK: ${e.message} ${new URL(`accounts/${e.address}`, config.explorer).href}`);
            } else {
              alert(`NG: ${e.message} ${new URL(`accounts/${e.address}`, config.explorer).href}`);
            }
          })
          .catch((err) => {
            alert(`NG: ${err.message} ${new URL(`accounts/${err.address}`, config.explorer).href}`);
          });
      }
    });
    return function cleanup() {
      mountedRef.current = false;
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <video
        style={{
          width: "90%",
          maxWidth: "1000px",
          borderRadius: "10px",
          marginTop: "1em",
          marginBottom: "1em",
        }}
        ref={videoRef}
      />
    </div>
  );
};

export default QrCodeReader;

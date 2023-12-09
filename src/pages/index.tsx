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

  if (result) {
    return { result, address, message: "" };
  } else {
    return { result, address, message: "残高が不足しています" };
  }
}

const QrCodeReader: FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mountedRef = useRef<boolean>(false);
  const [isLock, setIsLock] = React.useState<boolean>(false);
  const [address, setAddress] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  useEffect(() => {
    mountedRef.current = true;
    const codeReader = new BrowserQRCodeReader(undefined, undefined);
    codeReader.decodeFromVideoDevice(undefined, videoRef.current!, function (result, _, controls) {
      if (mountedRef.current === false) {
        return;
      }
      if (typeof result !== "undefined") {
        controls.stop();
        setIsLock(true);
        setIsLoading(true);
        addressCheck(result.getText())
          .then(async (e) => {
            if (e.result) {
              const res = await fetch(
                "https://script.google.com/macros/s/AKfycbzcloiFzSZTbUD0DCpVR_mRlkoZbH6dalz53NMIqGAX7WC77oXW6_7PyQIzw1WEwAZh_A/exec",
                { method: "POST", body: JSON.stringify({ address: e.address }) }
              );
              const json = await res.json();
              setAddress(`${new URL(`accounts/${e.address}`, config.explorer).href}`);
              if (json.message === "200") {
                setIsLoading(false);
                alert(`OK`);
              } else {
                setIsLoading(false);
                alert(`NG: このアドレスはお申し込みされていません ${e.message}`);
              }
            } else {
              setIsLoading(false);
              alert(`NG: ${e.message} ${new URL(`accounts/${e.address}`, config.explorer).href}`);
            }
          })
          .catch((err) => {
            setAddress(`${new URL(`accounts/${err.address}`, config.explorer).href}`);
            setIsLoading(false);
            alert(`NG: ${err.message}`);
          });
      }
    });
    return function cleanup() {
      mountedRef.current = false;
    };
  }, []);

  return (
    <div className="flex justify-start items-center flex-col max-w-full pt-4">
      {isLock ? (
        <div className="flex flex-col justify-center items-center gap-1">
          <a href={address} className="underline text-blue-700">
            {isLoading ? "照会中..." : "Explorer で確認"}
          </a>
          <button
            className="bg-purple-700 text-white hover:bg-purple-700/90 h-10 px-4 py-2 rounded-md"
            onClick={() => window.location.reload()}
          >
            新たに読み込む
          </button>
        </div>
      ) : (
        <>
          <video className="w-11/12 max-w-5xl my-4 rounded-lg" ref={videoRef} />
          <button
            className="bg-purple-700 text-white hover:bg-purple-700/90 h-10 px-4 py-2 rounded-md"
            onClick={() => window.location.reload()}
          >
            更新
          </button>
        </>
      )}
    </div>
  );
};

export default QrCodeReader;

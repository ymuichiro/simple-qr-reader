import { BrowserQRCodeReader } from "@zxing/browser";
import * as React from "react";
import { FC, useEffect, useRef } from "react";

type CameraDeviceInfo = {
  id: string;
  name: string;
};

const QrCodeReader: FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mountedRef = useRef<boolean>(false);

  useEffect(() => {
    mountedRef.current = true;
    const codeReader = new BrowserQRCodeReader(undefined, undefined);
    codeReader.decodeFromVideoDevice(
      undefined,
      videoRef.current!,
      function (result, _, controls) {
        if (mountedRef.current === false) {
          return;
        }
        if (typeof result !== "undefined") {
          console.log(result);
        }
      }
    );
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
      <button style={{ width: "90%", maxWidth: "1000px" }} onClick={() => {}}>
        STOP
      </button>
    </div>
  );
};

export default QrCodeReader;

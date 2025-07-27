import { PropsWithChildren } from "react";
import { useLaunch } from "@tarojs/taro";
import "./app.scss";

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    // 使用callContainer前一定要init一下，全局执行一次即可
    wx.cloud.init();
    console.log("App launched.");
    wx.cloud.callContainer({
      config: {
        env: "prod-4gcsgqa75da26b30",
      },
      path: "/",
      header: {
        "X-WX-SERVICE": "koa-s36g",
      },
      method: "GET",
      success: (res) => {
        console.log("success", res);
      },
      fail: (err) => {
        console.log("fail", err);
      },
    } as any);
  });

  // children 是将要会渲染的页面
  return children;
}

export default App;

export default defineAppConfig({
  pages: [
    "pages/index/index",
    "pages/summer/index",
    "pages/user-agreement/index",
    "pages/privacy-policy/index",
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "WeChat",
    navigationBarTextStyle: "black",
  },
  permission: {
    "scope.userLocation": {
      desc: "您的位置信息将用于在地图上显示您的当前位置",
    },
  },
  requiredPrivateInfos: ["getLocation", "chooseLocation"],
});

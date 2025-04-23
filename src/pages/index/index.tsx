import { View, Text, Image } from "@tarojs/components";
import { useLoad } from "@tarojs/taro";
import "./index.scss";
import Taro from "@tarojs/taro";

export default function Index() {
  useLoad(() => {
    console.log("Page loaded.");
  });

  return (
    <View className="page_view">
      <View className="title">选择施工作业类型</View>
      <View
        className="summer_view"
        onClick={() => Taro.navigateTo({ url: "/pages/summer/index" })}
      >
        <Text className="summer_text">夏季涉VOCs类</Text>
        <Image
          className="arrow_icon"
          src={require("../../assets/images/arrow-right.svg")}
        />
      </View>
    </View>
  );
}

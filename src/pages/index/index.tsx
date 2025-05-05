import { View, Text, Image } from "@tarojs/components";
import { useLoad, useShareAppMessage } from "@tarojs/taro";
import "./index.scss";
import Taro from "@tarojs/taro";
import { useEffect } from "react";

export default function Index() {
  useShareAppMessage(() => {
    return {
      title: "无锡市施工项目申报平台",
      path: "/pages/index/index",
    };
  });

  useEffect(() => {

  }, []);

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
          src={require("../../assets/svg/arrow-right.svg")}
        />
      </View>
    </View>
  );
}

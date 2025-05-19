import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.scss";

export default function UserAgreement() {
  return (
    <View className="agreement-page">
      <View className="agreement-content">
        <View className="section">
          <Text className="section-title">1. 协议的范围</Text>
          <Text className="section-content">
            1.1
            本协议是您与无锡市生态环境局之间关于使用本小程序服务所订立的协议。
          </Text>
          <Text className="section-content">
            1.2 本协议描述了本小程序与您之间关于本小程序服务的权利和义务。
          </Text>
        </View>

        <View className="section">
          <Text className="section-title">2. 服务内容</Text>
          <Text className="section-content">
            2.1
            本小程序的具体服务内容由无锡市生态环境局根据实际情况提供，包括但不限于：
          </Text>
          <View className="ul">
            <View className="li section-content">涉VOCs类施工作业信息填报</View>
            <View className="li section-content">相关环保政策查询</View>
          </View>
        </View>

        <View className="section">
          <Text className="section-title">3. 用户义务</Text>
          <Text className="section-content">
            3.1 用户在使用本小程序服务时必须遵守中华人民共和国相关法律法规。
          </Text>
          <Text className="section-content">
            3.2 用户必须保证所提供的信息真实、准确、完整。
          </Text>
        </View>

        <View className="section">
          <Text className="section-title">4. 知识产权</Text>
          <Text className="section-content">
            4.1 本小程序的所有权、运营权和一切知识产权归无锡市生态环境局所有。
          </Text>
        </View>

        <View className="section">
          <Text className="section-title">5. 协议修改</Text>
          <Text className="section-content">
            5.1 本协议的任何修改都会在本小程序上公布。
          </Text>
          <Text className="section-content">
            5.2 如果您不同意修改后的协议，您可以选择停止使用本小程序服务。
          </Text>
        </View>
      </View>
    </View>
  );
}

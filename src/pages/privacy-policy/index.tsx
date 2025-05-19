import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.scss";

export default function PrivacyPolicy() {
  return (
    <View className="privacy-page">
      <View className="privacy-content">
        <View className="section">
          <Text className="section-title">1. 信息收集</Text>
          <Text className="section-content">
            1.1 我们收集的信息包括但不限于：
          </Text>
          <View className="ul">
            <View className="li section-content">项目基本信息</View>
            <View className="li section-content">作业信息</View>
            <View className="li section-content">原辅材料信息</View>
          </View>
        </View>

        <View className="section">
          <Text className="section-title">2. 信息使用</Text>
          <Text className="section-content">2.1 我们使用收集的信息用于：</Text>
          <View className="ul">
            <View className="li section-content">提供和改进服务</View>
            <View className="li section-content">环境保护监管</View>
            <View className="li section-content">政策制定参考</View>
          </View>
        </View>

        <View className="section">
          <Text className="section-title">3. 信息保护</Text>
          <Text className="section-content">
            3.1 我们采取严格的数据安全措施保护您的信息。
          </Text>
          <Text className="section-content">
            3.2 未经您的同意，我们不会向第三方披露您的个人信息。
          </Text>
        </View>

        <View className="section">
          <Text className="section-title">4. 信息存储</Text>
          <Text className="section-content">
            4.1 您的信息将存储在符合国家法律法规要求的服务器中。
          </Text>
          <Text className="section-content">
            4.2 我们会定期清理不再需要的信息。
          </Text>
        </View>

        <View className="section">
          <Text className="section-title">5. 您的权利</Text>
          <Text className="section-content">
            5.1 您有权访问、更正您的个人信息。
          </Text>
          <Text className="section-content">
            5.2 您有权要求删除您的个人信息。
          </Text>
        </View>
      </View>
    </View>
  );
}

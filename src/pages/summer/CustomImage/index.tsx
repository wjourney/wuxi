import { Image, Text, View } from "@tarojs/components";
import React, { useEffect, useState } from "react";
import fallbackIcon from "@/assets/svg/doc.svg"; // 本地占位图
import "./index.scss";

const CustomImage = ({ file, deleteFn }) => {
  const [imgSrc, setImgSrc] = useState(file.fileID); // 展示的图片

  // 分离文件名和后缀
  const fileName = file.name.split(".")?.[0];
  const fileExt = file.name.split(".")?.[1];

  const handleDelete = (e) => {
    // 阻止事件冒泡
    e.stopPropagation();
    deleteFn && deleteFn(file.fileID);
  };

  return (
    <View className="custom-image">
      <Image
        className="custom-image-img"
        src={imgSrc}
        mode="aspectFill"
        preview={file.fileID}
        onError={() => {
          setImgSrc(fallbackIcon); // 图片加载失败时替换
        }}
      />
      <View className="filename-container">
        <Text className="custom-image-name">{fileName}</Text>
        <Text className="custom-image-ext">.{fileExt}</Text>
      </View>
      <Image
        mode="aspectFill"
        src={require("@/assets/svg/delete.svg")}
        className="delete-icon"
        data-url={file.fileID}
        onClick={handleDelete}
      />
    </View>
  );
};

export default CustomImage;

import {
  View,
  Image,
  Button,
  Input,
  Radio,
  RadioGroup,
  Text,
} from "@tarojs/components";
import { useLoad, chooseImage } from "@tarojs/taro";
import { useState } from "react";
import { Picker } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.scss";
import Switch from "./Switch";

const districtList = [
  "梁溪区",
  "滨湖区",
  "新吴区",
  "锡山区",
  "惠山区",
  "经开区",
  "太湖新城",
  "江阴市",
  "宜兴市",
];

const projectTypeList = [
  "墙体喷涂",
  "各类管道与构件防腐喷涂",
  "围栏喷(刷)油漆及切割焊接",
  "道路栏杆刷漆",
  "外立面改造",
  "铺设沥青",
  "楼顶防水",
  "道路地面划线",
  "大中型装修",
];

interface LocationData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface Material {
  materialName: string;
  materialCount: string;
  materialUnit: string;
  isVocRateLower: string;
}

export default function Summer() {
  // const [latitude, setLatitude] = useState(0);
  // const [longitude, setLongitude] = useState(0);
  // const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
  //   null
  // );
  const [loading, setLoading] = useState(false);
  // 表单数据状态
  const [formData, setFormData] = useState({
    projectName: "",
    companyName: "",
    companyCode: "",
    projectManagerName: "",
    projectManagerPhone: "",
    isAuthorized: "1", // 默认选择"是"
    district: "",
    projectAddress: "",
    location: "",
    selectedLocation: {} as LocationData,
    projectType: "",
    startTime: "",
    endTime: "",
    projectContent: "",
    materialList: [] as Material[],
    img: "", // 上传图片
    isSafeSite: "1", // 默认选择"是"
  });

  useLoad(() => {
    console.log("Page loaded.");
  });

  // 处理输入变化
  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // 使用Taro内置的地点选择器
  const handleChooseLocation = () => {
    setLoading(true);
    Taro.chooseLocation({
      success: function (res) {
        if (res.name && res.address) {
          const location: LocationData = {
            name: res.name,
            address: res.address,
            latitude: res.latitude,
            longitude: res.longitude,
          };

          setFormData({
            ...formData,
            selectedLocation: location,
          });
          // 输出位置信息到控制台
          console.log("选择的位置:", location);
        }
      },
      fail: function () {
        // Taro.showToast({
        //   title: "选择位置失败",
        //   icon: "none",
        // });
      },
      complete: function () {
        setLoading(false);
      },
    });
  };

  const handleAddMaterial = () => {
    setFormData({
      ...formData,
      materialList: [
        ...formData.materialList,
        {
          materialName: "",
          materialCount: "",
          materialUnit: "年",
          vocRate: "是",
        },
      ],
    });
  };

  const handleUpload = () => {
    chooseImage({
      count: 1,
      sizeType: ["original", "compressed"],
      sourceType: ["album", "camera"],
      success: (res) => {
        console.log(">>>>>choosefile", res);
        wx.cloud.uploadFile({
          cloudPath: "test11.png", // 对象存储路径，根路径直接填文件名，文件夹例子 test/文件名，不要 / 开头
          filePath: res.tempFilePaths[0], // 微信本地文件，通过选择图片，聊天文件等接口获取
          config: {
            env: "prod-4gcsgqa75da26b30", // 微信云托管环境ID
          },
          success: function (res) {
            console.log(res);
            setFormData({
              ...formData,
              img: res.fileID,
            });
          },
          fail: console.error,
        });
      },
    });
  };

  // 提交表单
  const handleSubmit = async () => {
    const result = await wx.cloud.callContainer({
      config: {
        env: "prod-4gcsgqa75da26b30",
      },
      path: "/api/count",
      header: {
        "X-WX-SERVICE": "koa-s36g",
      },
      method: "GET",
    });
    console.log(">>>>>>", result);

    // 如下传参
    wx.cloud
      .getTempFileURL({
        fileList: ["cloud://test.png"], // 对象存储文件ID列表，最多50个，从上传文件接口或者控制台获取
      })
      .then((res) => {
        console.log(res.fileList);
      })
      .catch((err) => {
        console.error(err);
      });

    console.log("提交的表单数据：", formData);
    // 这里添加提交表单的逻辑
  };

  return (
    <View className="summer_page_view">
      <View className="form_container">
        {/* 第一部分 - 基本信息 */}
        <View className="form_section">
          <View className="section_title">项目基础信息（必填）</View>
          <View className="form_item">
            <View className="label">项目名称：</View>
            <Input
              className="input"
              placeholder="请输入项目名称"
              value={formData.projectName}
              onInput={(e) => handleChange("projectName", e.detail.value)}
            />
          </View>
          <View className="form_item">
            <View className="label">建设单位名称：</View>
            <Input
              className="input"
              placeholder="请输入建设单位名称"
              value={formData.companyName}
              onInput={(e) => handleChange("companyName", e.detail.value)}
            />
          </View>
          <View className="form_item">
            <View className="label">组织机构代码：</View>
            <Input
              className="input"
              placeholder="请输入组织机构代码"
              value={formData.companyCode}
              onInput={(e) => handleChange("companyCode", e.detail.value)}
            />
          </View>
          <View className="form_item">
            <View className="label">施工负责人：</View>
            <Input
              className="input"
              placeholder="请输入施工负责人姓名"
              value={formData.projectManagerName}
              onInput={(e) =>
                handleChange("projectManagerName", e.detail.value)
              }
            />
          </View>
          <View className="form_item">
            <View className="label">联系电话：</View>
            <Input
              className="input"
              placeholder="请输入正确的手机号码"
              value={formData.projectManagerPhone}
              onInput={(e) =>
                handleChange("projectManagerPhone", e.detail.value)
              }
            />
          </View>
          <View className="form_item">
            <View className="label">是否受法人授权：</View>
            <Switch
              options={[
                {
                  label: "是",
                  value: "1",
                },
                {
                  label: "否",
                  value: "2",
                },
              ]}
              onSelect={(value) => {
                console.log(">>>>>value", value);
                handleChange("isAuthorized", value);
              }}
            />
          </View>
        </View>

        {/* 第二部分 - 作业信息 */}
        <View className="form_section">
          <View className="section_title">作业信息（必填）</View>
          <View className="form_item">
            <View className="label">行政区划：</View>
            <Picker
              mode="selector"
              range={districtList}
              onChange={(e) => {
                handleChange("district", districtList[e.detail.value]);
              }}
              style={{
                fontSize: "18px",
                color: formData.district ? "#000" : "#949292",
              }}
            >
              <View className="picker">
                {formData.district
                  ? `当前选择：${formData.district}`
                  : "请选择行政区划"}
              </View>
            </Picker>
          </View>
          <View className="form_item">
            <View className="label">作业地址：</View>
            <Input
              className="input"
              placeholder="请输入作业地址"
              value={formData.projectAddress}
              onInput={(e) => handleChange("projectAddress", e.detail.value)}
            />
          </View>
          <View className="form_item">
            <View className="label">坐标位置：</View>
            <View
              className="location_container"
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "space-between",
              }}
              onClick={handleChooseLocation}
            >
              <View
                className="location_text"
                style={{
                  color:
                    Object.keys(formData.selectedLocation).length !== 0
                      ? "#000"
                      : "#949292",
                  fontSize: "14px",
                }}
              >
                {Object.keys(formData.selectedLocation).length !== 0
                  ? `已选择位置: ${formData.selectedLocation?.name}`
                  : "请选择具体位置"}
              </View>
              <Image
                className="location_icon"
                mode="aspectFill"
                src={require("../../assets/svg/location.svg")}
                style={{ width: "24px", height: "24px", marginLeft: "8px" }}
              />
            </View>
          </View>
          <View className="form_item">
            <View className="label">作业类型：</View>
            <Picker
              mode="selector"
              range={projectTypeList}
              onChange={(e) => {
                handleChange("projectType", projectTypeList[e.detail.value]);
              }}
              style={{
                fontSize: "18px",
                color: formData.projectType ? "#000" : "#949292",
              }}
            >
              <View className="picker">
                {formData.projectType
                  ? `当前选择：${formData.projectType}`
                  : "请选择作业类型"}
              </View>
            </Picker>
          </View>
          <View className="form_item">
            <View className="label">拟作业时间：</View>
            {/* <Picker
              mode="selector"
              range={districtList}
              onChange={(e) => {
                handleChange("district", districtList[e.detail.value]);
              }}
              style={{
                fontSize: "18px",
                color: formData.district ? "#000" : "#949292",
              }}
            >
              <View className="picker">
                {formData.district
                  ? `当前选择：${formData.district}`
                  : "请选择作业类型"}
              </View>
            </Picker> */}
          </View>
          <View className="form_item">
            <View className="label">具体作业内容：</View>
            <Input
              className="input"
              placeholder="请输入作业内容"
              value={formData.projectContent}
              onInput={(e) => handleChange("projectContent", e.detail.value)}
            />
          </View>
        </View>

        {/* 第三部分 - 主要原辅材料 */}
        <View className="form_section">
          <View
            className="section_title"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <Text>主要原辅材料（必填）</Text>
            <View className="add_material" onClick={handleAddMaterial}>
              新增原辅材料
            </View>
          </View>
          <View className="material_list">
            {formData.materialList?.map((item, indexCount) => (
              <View className="material_item">
                <View className="form_item">
                  <View className="label">材料名称：</View>
                  <Input
                    className="input"
                    placeholder="请输入主要原辅材料"
                    value={item.materialName}
                    onInput={(e) =>
                      setFormData((pre) => ({
                        ...pre,
                        materialList: pre.materialList.map((item, index) => {
                          if (index === indexCount) {
                            return { ...item, materialName: e.detail.value };
                          }
                          return item;
                        }),
                      }))
                    }
                  />
                  <Switch
                    options={[
                      {
                        label: "年",
                        value: "year",
                      },
                      {
                        label: "月",
                        value: "month",
                      },
                    ]}
                    onSelect={(value) => {
                      handleChange("materialUnit", value);
                    }}
                  />
                </View>
                <View className="form_item">
                  <View className="label">数量和单位：</View>
                  <Input
                    className="input"
                    placeholder="请输入"
                    value={item.materialCount}
                    type="number"
                    onInput={(e) =>
                      handleChange("materialCount", e.detail.value)
                    }
                  />
                  <Switch
                    options={[
                      {
                        label: "是",
                        value: "1",
                      },
                      {
                        label: "否",
                        value: "2",
                      },
                    ]}
                    onSelect={(value) => {
                      console.log(">>>>>value", value);
                      handleChange("isVocRateLower", value);
                    }}
                  />
                </View>
                <View
                  className="delete_material"
                  onClick={() => {
                    setFormData((pre) => ({
                      ...pre,
                      materialList: pre.materialList.filter(
                        (item, index) => index !== indexCount
                      ),
                    }));
                  }}
                >
                  删除
                </View>
              </View>
            ))}
          </View>
        </View>
        <View className="form_section">
          <View className="section_title">是否为全电工地</View>
          <View className="form_item" style={{ height: 60, gap: 20 }}>
            <Switch
              options={[
                {
                  label: "是",
                  value: "1",
                },
                {
                  label: "否",
                  value: "2",
                },
              ]}
              onSelect={(value) => {
                handleChange("isSafeSite", value);
              }}
            />
            <View
              className="upload_btn"
              // style={{ height: 30, width: 40 }}
              onClick={() => handleUpload()}
            >
              点击上传全电工地证明(图片或者PDF 文件)
            </View>
          </View>
          <Image
            src={formData.img}
            style={{ width: "50px", height: "50px" }}
          ></Image>
        </View>
        {/* <View className="form_section">
          <View className="section_title"></View>
          <Switch
            options={[
              {
                label: "是",
                value: "1",
              },
              {
                label: "否",
                value: "2",
              },
            ]}
            onSelect={(value) => {
              handleChange("isSafeSite", value);
            }}
          />
          <Button onClick={() => handleUpload()}>上传</Button>
          <Image
            src={formData.img}
            style={{ width: "50px", height: "50px" }}
          ></Image>
        </View> */}

        {/* 提交按钮 */}
        <View className="submit_section">
          <Button className="submit_btn" onClick={handleSubmit}>
            确认上传
          </Button>
        </View>

        <View className="form_footer">
          <View className="footer_View">
            请确保所有信息真实有效，我们将保护您的隐私
          </View>
        </View>
      </View>
    </View>
  );
}

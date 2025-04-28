import {
  View,
  Image,
  Button,
  Input,
  Radio,
  RadioGroup,
  Text,
  Textarea,
  CoverView,
} from "@tarojs/components";
import {
  useLoad,
  chooseImage,
  chooseMessageFile,
  useShareAppMessage,
} from "@tarojs/taro";
import { useState } from "react";
import { Picker } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.scss";
import Switch from "./Switch";
import CustomImage from "./CustomImage";

// 获取全局wx对象
const wx = Taro.getEnv() === Taro.ENV_TYPE.WEAPP ? Taro : null;
const prompt =
  "🔔请先将图片/PDF文件发送到微信聊天(发给好友、自己或文件助手)，再选择该聊天，去聊天记录中勾选图片/PDF文件上传";

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

// 非道路移动机械排放标准
const nonRoadMobileEquipmentEmissionStandardList = [
  "国一",
  "国二",
  "国三",
  "国四",
  "纯电",
  "未知",
];

// 车辆排放标准
const vehicleEmissionStandardList = [
  "国一",
  "国二",
  "国三",
  "国四",
  "国五",
  "国六",
  "纯电",
  "未知",
];

// 运输车辆类型
const transportVehicleTypeList = ["轻型货车", "中型货车", "重型货车"];

// 加油来源
const oilSourceList = [
  "汽油",
  "柴油",
  "电动",
  "LPG",
  "天然气",
  "油气混合动力",
  "油电混合动力",
];

// 非道路移动机械类目
const nonRoadMobileEquipmentCategoryList = [
  "挖掘机",
  "推土机",
  "装载机",
  "压路机",
  "摊铺机",
  "平地机",
  "叉车",
  "其他",
];

// 申报施工项目
interface Project {
  // 项目基础信息
  projectName: string; // 项目名称
  companyName: string; // 建设单位名称
  companyCode: string; // 组织机构代码
  projectManagerName: string; // 施工负责人
  projectManagerPhone: string; // 施工负责人电话
  isAuthorized: number; // 是否受法人授权

  // 作业信息
  district: string; // 行政划分
  projectAddress: string; // 作业地址
  selectedLocation: LocationData; // 坐标位置
  projectType: string; // 作业类型
  startTime: string; // 计划开始时间
  endTime: string; // 计划结束时间
  projectContent: string; // 具体作业内容

  // 主要原辅材料
  materialList: Material[]; // 主要原辅材料列表

  // 是否全电工地
  isSafeSite: number;
  safeSiteImgsOrPdf: File[];

  // 运输车辆
  transportVehicleList: TransportVehicle[];

  // 非道路移动机械设备
  nonRoadMobileEquipmentList: NonRoadMobileEquipment[];

  // 挥发性有机物防治措施
  vocPreventionMeasures: string;
}

// 运输车辆
interface TransportVehicle {
  id: string; // 区分唯一id
  vehicleName: string; // 车辆名称
  vehicleCount: number; // 车辆数量
  vehicleOilSource: string; // 车辆加油来源
  vehicleEmissionStandard: string; // 车辆排放标准
  vehicleIsRegistered: number; // 车辆是否备案
  vehicleIsDustCover: number; // 车辆有无防尘罩
}

// 非道路移动机械设备
interface NonRoadMobileEquipment {
  id: string; // 区分唯一id
  equipmentName: string; // 非道路移动机械名称
  equipmentCount: number; // 非道路移动机械数量
  equipmentOilSource: string; // 非道路移动机械加油来源
  equipmentEmissionStandard: string; // 非道路移动机械排放标准
  equipmentIsRegistered: number; // 非道路移动机械是否备案
  equipmentIsDustCover: number; // 非道路移动机械有无防尘罩
}

interface LocationData {
  name: string; // 选择地点名字
  address: string; // 选择地点地址
  latitude: number; // 纬度
  longitude: number; // 经度
}

interface File {
  name: string; // 文件名
  fileID: string; // 文件路径
  nameStore: string; // oss存储名称
}

interface Material {
  materialName: string; // 主要原辅材料名称
  materialCount: number; // 数量
  materialUnit: string; // 单位
  isVocRateLower: number; // 是否VOC浓度低于10%
  id: string; // 区分唯一id

  vocSupportImgsOrPdf: File[]; // 上传的VOC防治措施图片/pdf
  lowerVocMaterialImgsOrPdf: File[]; // 上传的低于10%图片/pdf
}

export default function Summer() {
  useShareAppMessage((res) => {
    return {
      title: "无锡市夏季涉VOCs类施工作业填报",
      path: "/pages/summer/index",
    };
  });

  const initFormdata: Project = {
    projectName: "",
    companyName: "",
    companyCode: "",
    projectManagerName: "",
    projectManagerPhone: "",
    isAuthorized: 1, // 默认选择"是"
    district: "",
    projectAddress: "",
    selectedLocation: {} as LocationData,
    projectType: "",
    startTime: "",
    endTime: "",
    projectContent: "",
    materialList: [] as Material[],
    isSafeSite: 1, // 默认选择"是"
    safeSiteImgsOrPdf: [],
    // emissionStage: "",
    vocPreventionMeasures: "",
    transportVehicleList: [] as TransportVehicle[],
    nonRoadMobileEquipmentList: [] as NonRoadMobileEquipment[],
  };

  // 表单数据状态
  const [formData, setFormData] = useState<Project>(initFormdata);

  // 处理输入变化
  const handleChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // 使用Taro内置的地点选择器
  const handleChooseLocation = () => {
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
      complete: function () {},
    });
  };

  // 添加原辅材料
  const handleAddMaterial = () => {
    setFormData({
      ...formData,
      materialList: [
        ...formData.materialList,
        {
          materialName: "",
          materialCount: 0,
          materialUnit: "year",
          isVocRateLower: 1,
          lowerVocMaterialImgsOrPdf: [],
          vocSupportImgsOrPdf: [],
          id: Date.now().toString(),
        },
      ],
    });
  };

  // 添加运输车辆
  const handleAddTransportVehicle = () => {
    setFormData({
      ...formData,
      transportVehicleList: [
        ...formData.transportVehicleList,
        {
          id: Date.now().toString(),
          vehicleName: "",
          vehicleCount: 0,
          vehicleOilSource: "",
          vehicleEmissionStandard: "",
          vehicleIsRegistered: 1,
          vehicleIsDustCover: 1,
        },
      ],
    });
  };

  // 添加非道路移动机械
  const handleAddNonRoadMobileEquipment = () => {
    setFormData({
      ...formData,
      nonRoadMobileEquipmentList: [
        ...formData.nonRoadMobileEquipmentList,
        {
          id: Date.now().toString(),
          equipmentName: "",
          equipmentCount: 0,
          equipmentOilSource: "",
          equipmentEmissionStandard: "",
          equipmentIsRegistered: 1,
          equipmentIsDustCover: 1,
        },
      ],
    });
  };

  // 获取文件后缀
  const getFileExtension = (filename: string) => {
    const index = filename.lastIndexOf(".");
    if (index !== -1 && index < filename.length - 1) {
      return filename.substring(index + 1).toLowerCase(); // 返回不带点的后缀，如 "pdf"
    }
    return "";
  };
  // 上传文件
  const handleUploadFile = (
    item: any,
    index: number,
    callback: (err: Error | unknown, res: any, file_new_name: string) => void
  ) => {
    // 用于获取http公开链接
    const file_new_name =
      Date.now().toString() + "_" + index + "." + getFileExtension(item.name);
    if (!wx) {
      Taro.showToast({
        title: "系统错误，请稍后重试",
        icon: "none",
      });
      return;
    }
    wx.cloud.uploadFile({
      // 文件名规则：时间戳+文件索引
      cloudPath: file_new_name, // 对象存储路径，根路径直接填文件名，文件夹例子 test/文件名，不要 / 开头
      filePath: item.path, // 微信本地文件，通过选择图片，聊天文件等接口获取
      config: {
        env: "prod-4gcsgqa75da26b30", // 微信云托管环境ID
      },
      success: function (res) {
        callback(null, res, file_new_name);
      },
      fail: function (err) {
        callback(err, null, file_new_name);
      },
    });
  };

  const handleUploadMaterialImagesOrPdf = (
    type: string,
    materialId: string
  ) => {
    // chooseMessageFile({
    chooseMessageFile({
      count: 10, // 一次最多选4张
      type: "all",
      success: (res) => {
        console.log(">>>>>choosefile", res);
        res.tempFiles.forEach(
          (item: Taro.chooseMessageFile.ChooseFile, index: number) => {
            handleUploadFile(item, index, (err, res, file_new_name) => {
              if (err) {
                Taro.showToast({
                  title: "上传失败，请稍后重试",
                  icon: "none",
                });
                return;
              }

              setFormData((pre) => ({
                ...pre,
                materialList: pre.materialList.map((item1) => {
                  if (item1.id === materialId) {
                    return {
                      ...item1,
                      [type]: [
                        ...(item1[type] || []),
                        {
                          name: item.name,
                          fileID: res.fileID,
                          nameStore: file_new_name,
                        },
                      ],
                    };
                  }
                  return item1;
                }),
              }));
            });
          }
        );
      },
    });
  };

  const handleElectricSiteUpload = () => {
    chooseMessageFile({
      count: 10, // 一次最多选4张
      type: "all",
      success: (res) => {
        console.log(">>>>>choosefile", res);
        res.tempFiles.forEach(
          (item: Taro.chooseMessageFile.ChooseFile, index: number) => {
            handleUploadFile(item, index, (err, res, file_new_name) => {
              if (err) {
                Taro.showToast({
                  title: "上传失败",
                  icon: "none",
                });
                return;
              }
              console.log(res);
              setFormData((pre) => ({
                ...pre,
                safeSiteImgsOrPdf: [
                  ...(pre.safeSiteImgsOrPdf || []),
                  {
                    name: item.name,
                    fileID: res.fileID,
                    nameStore: file_new_name,
                  },
                ],
              }));
            });
          }
        );
      },
    });
  };

  // 提交表单
  const handleSubmit = async () => {
    console.log(">>>>>formData", JSON.stringify(formData));
    // 表单校验
    // 1. 检查项目基础信息
    if (!formData.projectName) {
      Taro.showToast({
        title: "请填写项目名称",
        icon: "none",
      });
      return;
    }

    if (!formData.companyName) {
      Taro.showToast({
        title: "请填写建设单位名称",
        icon: "none",
      });
      return;
    }

    if (!formData.companyCode) {
      Taro.showToast({
        title: "请填写组织机构代码",
        icon: "none",
      });
      return;
    }

    if (!formData.projectManagerName) {
      Taro.showToast({
        title: "请填写施工负责人",
        icon: "none",
      });
      return;
    }

    // 检查手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!formData.projectManagerPhone) {
      Taro.showToast({
        title: "请填写联系电话",
        icon: "none",
      });
      return;
    } else if (!phoneRegex.test(formData.projectManagerPhone)) {
      Taro.showToast({
        title: "请输入正确的手机号码",
        icon: "none",
      });
      return;
    }

    // 2. 检查作业信息
    if (!formData.district) {
      Taro.showToast({
        title: "请选择行政区划",
        icon: "none",
      });
      return;
    }

    if (!formData.projectAddress) {
      Taro.showToast({
        title: "请填写作业地址",
        icon: "none",
      });
      return;
    }

    if (Object.keys(formData.selectedLocation).length === 0) {
      Taro.showToast({
        title: "请选择坐标位置",
        icon: "none",
      });
      return;
    }

    if (!formData.projectType) {
      Taro.showToast({
        title: "请选择作业类型",
        icon: "none",
      });
      return;
    }

    if (!formData.startTime) {
      Taro.showToast({
        title: "请选择拟作业开始时间",
        icon: "none",
      });
      return;
    }

    if (!formData.endTime) {
      Taro.showToast({
        title: "请选择拟作业结束时间",
        icon: "none",
      });
      return;
    }

    // 检查结束时间是否大于等于开始时间
    if (new Date(formData.endTime) < new Date(formData.startTime)) {
      Taro.showToast({
        title: "结束时间不能早于开始时间",
        icon: "none",
      });
      return;
    }

    if (!formData.projectContent) {
      Taro.showToast({
        title: "请填写具体作业内容",
        icon: "none",
      });
      return;
    }

    // 3. 检查主要原辅材料
    if (formData.materialList.length === 0) {
      Taro.showToast({
        title: "请添加至少一种主要原辅材料",
        icon: "none",
      });
      return;
    }

    // 检查每种材料的必填信息
    for (let i = 0; i < formData.materialList.length; i++) {
      const material = formData.materialList[i];
      if (!material.materialName) {
        Taro.showToast({
          title: `请填写第${i + 1}个材料的名称`,
          icon: "none",
        });
        return;
      }

      if (!material.materialCount) {
        Taro.showToast({
          title: `请填写第${i + 1}个材料的数量`,
          icon: "none",
        });
        return;
      }

      // 检查低VOC的材料是否上传了证明文件
      if (
        material.isVocRateLower === 1 &&
        material.lowerVocMaterialImgsOrPdf.length === 0
      ) {
        Taro.showToast({
          title: `请上传第${i + 1}个材料的低VOCs证明文件`,
          icon: "none",
        });
        return;
      }
    }

    // 4. 检查全电工地证明
    if (formData.isSafeSite === 1 && formData.safeSiteImgsOrPdf.length === 0) {
      Taro.showToast({
        title: "请上传全电工地证明文件",
        icon: "none",
      });
      return;
    }

    // 6. 检查非全电工地情况下的运输车辆和非道路移动机械
    if (formData.isSafeSite === 0) {
      // 检查运输车辆
      if (formData.transportVehicleList.length === 0) {
        Taro.showToast({
          title: "请添加至少一辆运输车辆",
          icon: "none",
        });
        return;
      }

      // 检查每辆运输车辆的必填信息
      for (let i = 0; i < formData.transportVehicleList.length; i++) {
        const vehicle = formData.transportVehicleList[i];
        if (!vehicle.vehicleName) {
          Taro.showToast({
            title: `请选择第${i + 1}辆运输车辆的类型`,
            icon: "none",
          });
          return;
        }

        if (!vehicle.vehicleCount || vehicle.vehicleCount <= 0) {
          Taro.showToast({
            title: `请填写第${i + 1}辆运输车辆的数量`,
            icon: "none",
          });
          return;
        }

        if (!vehicle.vehicleOilSource) {
          Taro.showToast({
            title: `请选择第${i + 1}辆运输车辆的加油来源`,
            icon: "none",
          });
          return;
        }

        if (!vehicle.vehicleEmissionStandard) {
          Taro.showToast({
            title: `请选择第${i + 1}辆运输车辆的排放标准`,
            icon: "none",
          });
          return;
        }
      }

      // 检查非道路移动机械
      if (formData.nonRoadMobileEquipmentList.length === 0) {
        Taro.showToast({
          title: "请添加至少一台非道路移动机械",
          icon: "none",
        });
        return;
      }

      // 检查每台非道路移动机械的必填信息
      for (let i = 0; i < formData.nonRoadMobileEquipmentList.length; i++) {
        const equipment = formData.nonRoadMobileEquipmentList[i];
        if (!equipment.equipmentName) {
          Taro.showToast({
            title: `请选择第${i + 1}台非道路移动机械的名称`,
            icon: "none",
          });
          return;
        }

        if (!equipment.equipmentCount || equipment.equipmentCount <= 0) {
          Taro.showToast({
            title: `请填写第${i + 1}台非道路移动机械的数量`,
            icon: "none",
          });
          return;
        }

        if (!equipment.equipmentOilSource) {
          Taro.showToast({
            title: `请选择第${i + 1}台非道路移动机械的加油来源`,
            icon: "none",
          });
          return;
        }

        if (!equipment.equipmentEmissionStandard) {
          Taro.showToast({
            title: `请选择第${i + 1}台非道路移动机械的排放标准`,
            icon: "none",
          });
          return;
        }
      }
    }

    // 5. 检查挥发性有机物防治措施
    if (!formData.vocPreventionMeasures) {
      Taro.showToast({
        title: "请填写挥发性有机物防治措施",
        icon: "none",
      });
      return;
    }

    // 校验通过，执行提交操作
    try {
      // 表单数据都已经验证通过，可以调用接口提交数据
      if (wx) {
        const result = await wx.cloud.callContainer({
          config: {
            env: "prod-4gcsgqa75da26b30",
          },
          path: "/api/project",
          header: {
            "X-WX-SERVICE": "koa-s36g",
          },
          method: "POST",
          data: formData,
        } as any);
        console.log("提交结果：", result);
        if (result.statusCode === 200) {
          Taro.showToast({
            title: "提交成功",
            icon: "success",
          });
          // setFormData(initFormdata);
          // 可以在这里添加提交成功后的逻辑，比如返回列表页
        } else {
          Taro.showToast({
            title: "提交失败，请稍后重试",
            icon: "error",
          });
        }
      } else {
        console.error("wx对象不存在，无法调用云函数");
        Taro.showToast({
          title: "提交失败，请稍后重试",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("提交表单时发生错误：", error);
      Taro.showToast({
        title: "提交失败，请稍后重试",
        icon: "error",
      });
    }
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
              type="number"
              value={formData.projectManagerPhone}
              onInput={(e) =>
                handleChange("projectManagerPhone", e.detail.value)
              }
            />
          </View>
          <View className="form_item" style={{ borderBottom: "none" }}>
            <View className="label">是否受法人授权：</View>
            <Switch
              options={[
                {
                  label: "是",
                  value: 1,
                },
                {
                  label: "否",
                  value: 0,
                },
              ]}
              defaultValue={1}
              onSelect={(value) => {
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
                fontSize: 16,
                color: formData.district ? "#000" : "#8a8989",
                flex: 1,
              }}
            >
              <View className="picker">
                {formData.district ? `${formData.district}` : "请选择行政区划"}
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
                // justifyContent: "space-between",
              }}
              onClick={handleChooseLocation}
            >
              <View
                className="location_text"
                style={{
                  color:
                    Object.keys(formData.selectedLocation).length !== 0
                      ? "#000"
                      : "#8a8989",
                  fontSize: 16,
                }}
              >
                {Object.keys(formData.selectedLocation).length !== 0
                  ? `${formData.selectedLocation?.name}`
                  : "请点击选择具体位置"}
              </View>
              <Image
                className="location_icon"
                mode="aspectFill"
                src={require("../../assets/svg/location.svg")}
                style={{ width: 24, height: 24, marginLeft: 8 }}
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
                fontSize: 16,
                color: formData.projectType ? "#000" : "#8a8989",
                flex: 1,
              }}
            >
              <View className="picker">
                {formData.projectType
                  ? `${formData.projectType}`
                  : "请点击选择作业类型"}
              </View>
            </Picker>
          </View>
          <View className="form_item">
            <View className="label">拟作业时间：</View>
            <View
              style={{
                flex: 1,
                display: "flex",
                gap: 10,
              }}
            >
              <View style={{ display: "flex", alignItems: "center" }}>
                <Picker
                  mode="date"
                  value={formData.startTime}
                  onChange={(e) => {
                    handleChange("startTime", e.detail.value);
                  }}
                  style={{
                    fontSize: 14,
                    color: formData.startTime ? "#000" : "white",
                    flex: 1,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: formData.startTime ? "white" : "#0cc",
                    borderRadius: 4,
                    paddingLeft: 4,
                    paddingRight: 4,
                  }}
                >
                  <View className="picker">
                    {formData.startTime || "选择开始日期"}
                  </View>
                </Picker>
              </View>
              <View
                style={{
                  color: "#8a8989",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                —
              </View>
              <Picker
                mode="date"
                value={formData.endTime}
                onChange={(e) => {
                  handleChange("endTime", e.detail.value);
                }}
                style={{
                  fontSize: 14,
                  color: formData.endTime ? "#000" : "white",
                  flex: 1,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: formData.endTime ? "white" : "#0cc",
                  borderRadius: 4,
                  paddingLeft: 4,
                  paddingRight: 4,
                }}
              >
                <View className="picker">
                  {formData.endTime || "选择结束日期"}
                </View>
              </Picker>
            </View>
          </View>
          <View
            className="form_item"
            style={{
              flexDirection: "column",
              height: "unset",
              minHeight: 100,
              alignItems: "start ",
              borderBottom: "none",
            }}
          >
            <View className="label" style={{ height: 40 }}>
              具体作业内容：
            </View>
            <Textarea
              className="input"
              placeholder="请输入具体作业内容"
              value={formData.projectContent}
              onInput={(e) => handleChange("projectContent", e.detail.value)}
              style={{
                display: "flex",
                alignItems: "center",
              }}
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
            {formData.materialList?.map((item: Material) => (
              <View className="material_item">
                <View className="form_item">
                  <View className="label">材料名称：</View>
                  <Input
                    className="input"
                    placeholder="请输入主要原辅材料"
                    // value={item.materialName}
                    onInput={(e) =>
                      setFormData((pre) => ({
                        ...pre,
                        materialList: pre.materialList.map((item1) => {
                          if (item1.id === item.id) {
                            return { ...item1, materialName: e.detail.value };
                          }
                          return item1;
                        }),
                      }))
                    }
                  />
                </View>
                <View className="form_item">
                  <View className="label">数量和单位：</View>
                  <Input
                    className="input"
                    placeholder="请输入"
                    type="number"
                    onInput={(e) =>
                      setFormData((pre) => ({
                        ...pre,
                        materialList: pre.materialList.map((item1) => {
                          if (item1.id === item.id) {
                            return {
                              ...item1,
                              materialCount: Number(e.detail.value),
                            };
                          }
                          return item1;
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
                    onSelect={(value: string) => {
                      setFormData((pre) => ({
                        ...pre,
                        materialList: pre.materialList.map((item1) => {
                          if (item1.id === item.id) {
                            return {
                              ...item1,
                              materialUnit: value,
                            };
                          }
                          return item1;
                        }),
                      }));
                    }}
                  />
                </View>
                <View className="form_item">
                  <View className="label">VOCs容量是否低于10%</View>
                  <Switch
                    options={[
                      {
                        label: "是",
                        value: 1,
                      },
                      {
                        label: "否",
                        value: 0,
                      },
                    ]}
                    onSelect={(value: number) => {
                      if (value === 1) {
                        setFormData((pre) => ({
                          ...pre,
                          materialList: pre.materialList.map((item1) => {
                            if (item1.id === item.id) {
                              return {
                                ...item1,
                                isVocRateLower: value,
                                vocSupportImgsOrPdf: [],
                              };
                            }
                            return item1;
                          }),
                        }));
                      } else {
                        setFormData((pre) => ({
                          ...pre,
                          materialList: pre.materialList.map((item1) => {
                            if (item1.id === item.id) {
                              return {
                                ...item1,
                                isVocRateLower: value,
                                lowerVocMaterialImgsOrPdf: [],
                              };
                            }
                            return item1;
                          }),
                        }));
                      }
                    }}
                  />
                </View>
                <View className="prompt" style={{ marginTop: 4 }}>
                  {prompt}
                </View>
                <View className="form_item">
                  <View className="label">
                    {item.isVocRateLower === 1
                      ? "低 VOCs 原辅材料证明："
                      : "VOCs 原辅材料证明："}
                  </View>
                  <View
                    className="upload_btn"
                    style={{ height: 48 }}
                    onClick={() => {
                      handleUploadMaterialImagesOrPdf(
                        item.isVocRateLower === 1
                          ? "lowerVocMaterialImgsOrPdf"
                          : "vocSupportImgsOrPdf",
                        item.id
                      );
                    }}
                  >
                    请点击上传图片/PDF 文件
                  </View>
                </View>
                {(item?.lowerVocMaterialImgsOrPdf?.length > 0 ||
                  item?.vocSupportImgsOrPdf?.length > 0) && (
                  <View className="material_item_imgs">
                    {(item.isVocRateLower === 1
                      ? item.lowerVocMaterialImgsOrPdf
                      : item.vocSupportImgsOrPdf
                    )?.map((img: File, imgIndex) => (
                      <CustomImage
                        key={`${item.id}-${imgIndex}-${img.fileID}`}
                        file={img}
                        deleteFn={(id) => {
                          setFormData((pre) => {
                            const newList = pre.materialList.map((item1) => {
                              if (item1.id === item.id) {
                                const newFiles = (
                                  item.isVocRateLower === 1
                                    ? item1.lowerVocMaterialImgsOrPdf
                                    : item1.vocSupportImgsOrPdf
                                ).filter((item2) => item2.fileID !== id);
                                return {
                                  ...item1,
                                  [item.isVocRateLower === 1
                                    ? "lowerVocMaterialImgsOrPdf"
                                    : "vocSupportImgsOrPdf"]: newFiles,
                                };
                              }
                              return item1;
                            });
                            return {
                              ...pre,
                              materialList: newList,
                            };
                          });
                        }}
                      />
                    ))}
                  </View>
                )}
                <View
                  className="delete_material"
                  onClick={() => {
                    setFormData((pre) => ({
                      ...pre,
                      materialList: pre.materialList.filter(
                        (item1) => item1.id !== item.id
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

        {/* 第四部分 - 是否为全电工地 */}
        <View className="form_section">
          <View className="section_title">是否为全电工地（必填）</View>
          <View
            className="form_item"
            style={{
              border: "none",
              alignItems: "flex-start",
              flexDirection: "column",
              // height: 120,
              gap: 10,
            }}
          >
            <Switch
              options={[
                {
                  label: "是",
                  value: 1,
                },
                {
                  label: "否",
                  value: 0,
                },
              ]}
              onSelect={(value) => {
                if (value === 0) {
                  // 如果填否，就根据运输车辆和非道路移动机械设备列表的默认值
                  setFormData((prev) => ({
                    ...prev,
                    isSafeSite: value as number,
                    safeSiteImgsOrPdf: [],
                    transportVehicleList: [
                      ...prev.transportVehicleList,
                      {
                        id: Date.now().toString(),
                        vehicleName: "",
                        vehicleCount: 0,
                        vehicleOilSource: "",
                        vehicleEmissionStandard: "",
                        vehicleIsRegistered: 1,
                        vehicleIsDustCover: 1,
                      },
                    ],
                    nonRoadMobileEquipmentList: [
                      ...prev.nonRoadMobileEquipmentList,
                      {
                        id: Date.now().toString(),
                        equipmentName: "",
                        equipmentCount: 0,
                        equipmentOilSource: "",
                        equipmentEmissionStandard: "",
                        equipmentIsRegistered: 1,
                        equipmentIsDustCover: 1,
                      },
                    ],
                  }));
                } else {
                  setFormData((prev) => ({
                    ...prev,
                    isSafeSite: value as number,
                    transportVehicleList: [],
                    nonRoadMobileEquipmentList: [],
                  }));
                }
              }}
            />
            {formData.isSafeSite === 1 && (
              <View className="prompt">{prompt}</View>
            )}
            {formData.isSafeSite === 1 && (
              <View className="upload_btn" onClick={handleElectricSiteUpload}>
                点击上传全电工地证明(图片或者PDF 文件)
              </View>
            )}
          </View>
          {formData.safeSiteImgsOrPdf?.length > 0 &&
            formData.isSafeSite === 1 && (
              <View className="material_item_imgs">
                {formData.safeSiteImgsOrPdf?.map((img: File, imgIndex) => (
                  <CustomImage
                    deleteFn={(url) => {
                      setFormData((pre) => ({
                        ...pre,
                        safeSiteImgsOrPdf: pre.safeSiteImgsOrPdf.filter(
                          (item) => item.fileID !== url
                        ),
                      }));
                    }}
                    key={`${imgIndex}-${img.fileID}`}
                    file={img}
                  />
                ))}
              </View>
            )}
        </View>

        {/* 第五部分 - 运输车辆 */}
        {!formData?.isSafeSite && (
          <View className="form_section">
            <View
              className="section_title"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <Text>运输车辆（必填）</Text>
              <View
                className="add_material"
                onClick={handleAddTransportVehicle}
              >
                新增运输车辆
              </View>
            </View>
            <View className="material_list">
              {formData.transportVehicleList?.map((item: TransportVehicle) => (
                <View className="material_item">
                  <View className="form_item">
                    <View className="label">运输车辆名称：</View>
                    <Picker
                      mode="selector"
                      range={transportVehicleTypeList}
                      onChange={(e) => {
                        setFormData((pre) => ({
                          ...pre,
                          transportVehicleList: pre.transportVehicleList.map(
                            (item1) => {
                              if (item1.id === item.id) {
                                return {
                                  ...item1,
                                  vehicleName:
                                    transportVehicleTypeList[e.detail.value],
                                };
                              }
                              return item1;
                            }
                          ),
                        }));
                      }}
                      style={{
                        fontSize: 16,
                        color: formData.transportVehicleList.find(
                          (item1) => item1.id === item.id
                        )?.vehicleName
                          ? "#000"
                          : "#8a8989",
                        flex: 1,
                      }}
                    >
                      <View className="picker">
                        {formData.transportVehicleList.find(
                          (item1) => item1.id === item.id
                        )?.vehicleName
                          ? `${
                              formData.transportVehicleList.find(
                                (item1) => item1.id === item.id
                              )?.vehicleName
                            }`
                          : "请选择运输车辆类型"}
                      </View>
                    </Picker>
                  </View>
                  <View className="form_item">
                    <View className="label">数量：</View>
                    <Input
                      className="input"
                      placeholder="请输入"
                      type="number"
                      onInput={(e) =>
                        setFormData((pre) => ({
                          ...pre,
                          transportVehicleList: pre.transportVehicleList.map(
                            (item1) => {
                              if (item1.id === item.id) {
                                return {
                                  ...item1,
                                  vehicleCount: Number(e.detail.value),
                                };
                              }
                              return item1;
                            }
                          ),
                        }))
                      }
                    />
                  </View>

                  <View className="form_item">
                    <View className="label">加油来源：</View>
                    <Picker
                      mode="selector"
                      range={oilSourceList}
                      onChange={(e) => {
                        setFormData((pre) => ({
                          ...pre,
                          transportVehicleList: pre.transportVehicleList.map(
                            (item1) => {
                              if (item1.id === item.id) {
                                return {
                                  ...item1,
                                  vehicleOilSource:
                                    oilSourceList[e.detail.value],
                                };
                              }
                              return item1;
                            }
                          ),
                        }));
                      }}
                      style={{
                        fontSize: 16,
                        color: formData.transportVehicleList.find(
                          (item1) => item1.id === item.id
                        )?.vehicleOilSource
                          ? "#000"
                          : "#8a8989",
                        flex: 1,
                      }}
                    >
                      <View className="picker">
                        {formData.transportVehicleList.find(
                          (item1) => item1.id === item.id
                        )?.vehicleOilSource
                          ? `${
                              formData.transportVehicleList.find(
                                (item1) => item1.id === item.id
                              )?.vehicleOilSource
                            }`
                          : "请选择加油来源"}
                      </View>
                    </Picker>
                  </View>

                  <View
                    className="form_item"
                    style={{ justifyContent: "flex-start" }}
                  >
                    <View className="label">排放标准：</View>
                    <Picker
                      mode="selector"
                      range={vehicleEmissionStandardList}
                      onChange={(e) => {
                        setFormData((pre) => ({
                          ...pre,
                          transportVehicleList: pre.transportVehicleList.map(
                            (item1) => {
                              if (item1.id === item.id) {
                                return {
                                  ...item1,
                                  vehicleEmissionStandard:
                                    vehicleEmissionStandardList[e.detail.value],
                                };
                              }
                              return item1;
                            }
                          ),
                        }));
                      }}
                      style={{
                        fontSize: 16,
                        color: formData.transportVehicleList.find(
                          (item1) => item1.id === item.id
                        )?.vehicleEmissionStandard
                          ? "#000"
                          : "#8a8989",
                        flex: 1,
                      }}
                    >
                      <View className="picker">
                        {formData.transportVehicleList.find(
                          (item1) => item1.id === item.id
                        )?.vehicleEmissionStandard
                          ? `${
                              formData.transportVehicleList.find(
                                (item1) => item1.id === item.id
                              )?.vehicleEmissionStandard
                            }`
                          : "请选择排放标准"}
                      </View>
                    </Picker>
                  </View>

                  <View className="form_item" style={{ borderBottom: "none" }}>
                    <View className="label">是否备案：</View>
                    <Switch
                      options={[
                        {
                          label: "是",
                          value: 1,
                        },
                        {
                          label: "否",
                          value: 0,
                        },
                      ]}
                      defaultValue={1}
                      onSelect={(value) => {
                        setFormData((pre) => ({
                          ...pre,
                          transportVehicleList: pre.transportVehicleList.map(
                            (item1) => {
                              if (item1.id === item.id) {
                                return {
                                  ...item1,
                                  vehicleIsRegistered: value as number,
                                };
                              }
                              return item1;
                            }
                          ),
                        }));
                      }}
                    />
                  </View>

                  <View className="form_item" style={{ borderBottom: "none" }}>
                    <View className="label">有无防尘罩：</View>
                    <Switch
                      options={[
                        {
                          label: "是",
                          value: 1,
                        },
                        {
                          label: "否",
                          value: 0,
                        },
                      ]}
                      defaultValue={1}
                      onSelect={(value) => {
                        setFormData((pre) => ({
                          ...pre,
                          transportVehicleList: pre.transportVehicleList.map(
                            (item1) => {
                              if (item1.id === item.id) {
                                return {
                                  ...item1,
                                  vehicleIsDustCover: value as number,
                                };
                              }
                              return item1;
                            }
                          ),
                        }));
                      }}
                    />
                  </View>

                  <View
                    className="delete_material"
                    onClick={() => {
                      setFormData((pre) => ({
                        ...pre,
                        transportVehicleList: pre.transportVehicleList.filter(
                          (item1) => item1.id !== item.id
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
        )}

        {/* 第六部分 - 非道路移动机械设备 */}
        {!formData?.isSafeSite && (
          <View className="form_section">
            <View
              className="section_title"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <Text>非道路移动机械名称（必填）</Text>
              <View
                className="add_material"
                onClick={handleAddNonRoadMobileEquipment}
              >
                新增非道路移动机械
              </View>
            </View>
            <View className="material_list">
              {formData.nonRoadMobileEquipmentList?.map(
                (item: NonRoadMobileEquipment) => (
                  <View className="material_item">
                    <View className="form_item">
                      <View className="label">非道路移动机械名称：</View>
                      <Picker
                        mode="selector"
                        range={nonRoadMobileEquipmentCategoryList}
                        onChange={(e) => {
                          setFormData((pre) => ({
                            ...pre,
                            nonRoadMobileEquipmentList:
                              pre.nonRoadMobileEquipmentList.map((item1) => {
                                if (item1.id === item.id) {
                                  return {
                                    ...item1,
                                    equipmentName:
                                      nonRoadMobileEquipmentCategoryList[
                                        e.detail.value
                                      ],
                                  };
                                }
                                return item1;
                              }),
                          }));
                        }}
                        style={{
                          fontSize: 16,
                          color: formData.nonRoadMobileEquipmentList.find(
                            (item1) => item1.id === item.id
                          )?.equipmentName
                            ? "#000"
                            : "#8a8989",
                          flex: 1,
                        }}
                      >
                        <View className="picker">
                          {formData.nonRoadMobileEquipmentList.find(
                            (item1) => item1.id === item.id
                          )?.equipmentName
                            ? `${
                                formData.nonRoadMobileEquipmentList.find(
                                  (item1) => item1.id === item.id
                                )?.equipmentName
                              }`
                            : "请选择非道路移动机械名称"}
                        </View>
                      </Picker>
                    </View>
                    <View className="form_item">
                      <View className="label">数量：</View>
                      <Input
                        className="input"
                        placeholder="请输入"
                        type="number"
                        onInput={(e) =>
                          setFormData((pre) => ({
                            ...pre,
                            nonRoadMobileEquipmentList:
                              pre.nonRoadMobileEquipmentList.map((item1) => {
                                if (item1.id === item.id) {
                                  return {
                                    ...item1,
                                    equipmentCount: Number(e.detail.value),
                                  };
                                }
                                return item1;
                              }),
                          }))
                        }
                      />
                    </View>

                    <View className="form_item">
                      <View className="label">加油来源：</View>
                      <Picker
                        mode="selector"
                        range={oilSourceList}
                        onChange={(e) => {
                          setFormData((pre) => ({
                            ...pre,
                            nonRoadMobileEquipmentList:
                              pre.nonRoadMobileEquipmentList.map((item1) => {
                                if (item1.id === item.id) {
                                  return {
                                    ...item1,
                                    equipmentOilSource:
                                      oilSourceList[e.detail.value],
                                  };
                                }
                                return item1;
                              }),
                          }));
                        }}
                        style={{
                          fontSize: 16,
                          color: formData.nonRoadMobileEquipmentList.find(
                            (item1) => item1.id === item.id
                          )?.equipmentOilSource
                            ? "#000"
                            : "#8a8989",
                          flex: 1,
                        }}
                      >
                        <View className="picker">
                          {formData.nonRoadMobileEquipmentList.find(
                            (item1) => item1.id === item.id
                          )?.equipmentOilSource
                            ? `${
                                formData.nonRoadMobileEquipmentList.find(
                                  (item1) => item1.id === item.id
                                )?.equipmentOilSource
                              }`
                            : "请选择加油来源"}
                        </View>
                      </Picker>
                    </View>

                    <View
                      className="form_item"
                      style={{ justifyContent: "flex-start" }}
                    >
                      <View className="label">排放标准：</View>
                      <Picker
                        mode="selector"
                        range={nonRoadMobileEquipmentEmissionStandardList}
                        onChange={(e) => {
                          setFormData((pre) => ({
                            ...pre,
                            nonRoadMobileEquipmentList:
                              pre.nonRoadMobileEquipmentList.map((item1) => {
                                if (item1.id === item.id) {
                                  return {
                                    ...item1,
                                    equipmentEmissionStandard:
                                      nonRoadMobileEquipmentEmissionStandardList[
                                        e.detail.value
                                      ],
                                  };
                                }
                                return item1;
                              }),
                          }));
                        }}
                        style={{
                          fontSize: 16,
                          color: formData.nonRoadMobileEquipmentList.find(
                            (item1) => item1.id === item.id
                          )?.equipmentEmissionStandard
                            ? "#000"
                            : "#8a8989",
                          flex: 1,
                        }}
                      >
                        <View className="picker">
                          {formData.nonRoadMobileEquipmentList.find(
                            (item1) => item1.id === item.id
                          )?.equipmentEmissionStandard
                            ? `${
                                formData.nonRoadMobileEquipmentList.find(
                                  (item1) => item1.id === item.id
                                )?.equipmentEmissionStandard
                              }`
                            : "请选择排放标准"}
                        </View>
                      </Picker>
                    </View>

                    <View
                      className="form_item"
                      style={{ borderBottom: "none" }}
                    >
                      <View className="label">是否备案：</View>
                      <Switch
                        options={[
                          {
                            label: "是",
                            value: 1,
                          },
                          {
                            label: "否",
                            value: 0,
                          },
                        ]}
                        defaultValue={1}
                        onSelect={(value) => {
                          setFormData((pre) => ({
                            ...pre,
                            nonRoadMobileEquipmentList:
                              pre.nonRoadMobileEquipmentList.map((item1) => {
                                if (item1.id === item.id) {
                                  return {
                                    ...item1,
                                    equipmentIsRegistered: value as number,
                                  };
                                }
                                return item1;
                              }),
                          }));
                        }}
                      />
                    </View>

                    <View
                      className="form_item"
                      style={{ borderBottom: "none" }}
                    >
                      <View className="label">有无防尘罩：</View>
                      <Switch
                        options={[
                          {
                            label: "是",
                            value: 1,
                          },
                          {
                            label: "否",
                            value: 0,
                          },
                        ]}
                        defaultValue={1}
                        onSelect={(value) => {
                          setFormData((pre) => ({
                            ...pre,
                            nonRoadMobileEquipmentList:
                              pre.nonRoadMobileEquipmentList.map((item1) => {
                                if (item1.id === item.id) {
                                  return {
                                    ...item1,
                                    equipmentIsDustCover: value as number,
                                  };
                                }
                                return item1;
                              }),
                          }));
                        }}
                      />
                    </View>

                    <View
                      className="delete_material"
                      onClick={() => {
                        setFormData((pre) => ({
                          ...pre,
                          nonRoadMobileEquipmentList:
                            pre.nonRoadMobileEquipmentList.filter(
                              (item1) => item1.id !== item.id
                            ),
                        }));
                      }}
                    >
                      删除
                    </View>
                  </View>
                )
              )}
            </View>
          </View>
        )}

        {/* 第五部分 - 挥发性有机物防治措施 */}
        <View className="form_section">
          <View className="section_title">挥发性有机物防治措施（必填）</View>
          <View
            className="form_item"
            style={{
              flexDirection: "column",
              height: "unset",
              minHeight: 100,
              alignItems: "start ",
              borderBottom: "none",
            }}
          >
            <View className="label">挥发性有机物防治措施：</View>
            <Textarea
              className="input"
              placeholder="请输入挥发性有机物防治措施"
              value={formData.vocPreventionMeasures}
              onInput={(e) =>
                handleChange("vocPreventionMeasures", e.detail.value)
              }
              style={{
                marginTop: 10,
              }}
            />
          </View>
        </View>
      </View>

      {/* 提交按钮 */}
      <CoverView className="submit_section">
        <Button className="submit_btn" onClick={handleSubmit}>
          确认上传
        </Button>
      </CoverView>
    </View>
  );
}

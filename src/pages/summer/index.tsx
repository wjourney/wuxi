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
  Checkbox,
  CheckboxGroup,
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

const vocPreventionMeasuresList = [
  "使用水性/低VOCs原辅材料",
  "涉VOCs原辅材料密闭存储",
  "涉VOCs原辅材料密闭转运",
  "涉VOCs原辅材料非取用状态加盖密闭",
];

// 申报施工项目
interface Project {
  // 项目基础信息
  projectName: string; // 项目名称
  companyName: string; // 建设单位名称
  constructionCompanyName: string; // 施工单位名称
  companyCode: string; // 施工单位组织机构代码
  projectManagerName: string; // 施工负责人
  projectManagerPhone: string; // 施工负责人电话

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

  // 挥发性有机物防治措施
  vocPreventionMeasures: string[];
  agreedToTerms: boolean; // 添加协议同意状态
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
  materialCount: string; // 数量
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
    constructionCompanyName: "",
    projectManagerName: "",
    projectManagerPhone: "",
    district: "",
    projectAddress: "",
    selectedLocation: {} as LocationData,
    projectType: "",
    startTime: "",
    endTime: "",
    projectContent: "",
    materialList: [] as Material[],
    vocPreventionMeasures: [],
    agreedToTerms: false, // 初始化协议同意状态
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
          materialCount: "",
          isVocRateLower: 1,
          lowerVocMaterialImgsOrPdf: [],
          vocSupportImgsOrPdf: [],
          id: Date.now().toString(),
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

  // const handleElectricSiteUpload = () => {
  //   chooseMessageFile({
  //     count: 10, // 一次最多选4张
  //     type: "all",
  //     success: (res) => {
  //       console.log(">>>>>choosefile", res);
  //       res.tempFiles.forEach(
  //         (item: Taro.chooseMessageFile.ChooseFile, index: number) => {
  //           handleUploadFile(item, index, (err, res, file_new_name) => {
  //             if (err) {
  //               Taro.showToast({
  //                 title: "上传失败",
  //                 icon: "none",
  //               });
  //               return;
  //             }
  //             console.log(res);
  //             setFormData((pre) => ({
  //               ...pre,
  //               safeSiteImgsOrPdf: [
  //                 ...(pre.safeSiteImgsOrPdf || []),
  //                 {
  //                   name: item.name,
  //                   fileID: res.fileID,
  //                   nameStore: file_new_name,
  //                 },
  //               ],
  //             }));
  //           });
  //         }
  //       );
  //     },
  //   });
  // };

  // 处理复选框选择
  const handleCheckboxChange = (e) => {
    setFormData({
      ...formData,
      vocPreventionMeasures: e.detail.value,
    });
  };

  // 处理协议勾选
  const handleAgreementChange = (e) => {
    setFormData({
      ...formData,
      agreedToTerms: e.detail.value.length > 0,
    });
  };

  // 跳转到用户服务协议页面
  const navigateToUserAgreement = () => {
    Taro.navigateTo({
      url: "/pages/user-agreement/index",
    });
  };

  // 跳转到隐私政策页面
  const navigateToPrivacyPolicy = () => {
    Taro.navigateTo({
      url: "/pages/privacy-policy/index",
    });
  };

  // 提交表单
  const handleSubmit = async () => {
    console.log(">>>>>formData", formData, JSON.stringify(formData));
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
    if (!formData.constructionCompanyName) {
      Taro.showToast({
        title: "请填写施工单位名称",
        icon: "none",
      });
      return;
    }

    if (!formData.companyCode) {
      Taro.showToast({
        title: "请填写施工单位组织机构代码",
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
          title: `请填写第${i + 1}个原辅材料的施工期间原辅材料用量`,
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
          title: `请上传第${i + 1}个原辅材料的水性/低VOCs证明文件`,
          icon: "none",
        });
        return;
      }

      // 不是低voc时候，检查材料是否上传了证明文件
      if (
        material.isVocRateLower === 0 &&
        material.vocSupportImgsOrPdf.length === 0
      ) {
        Taro.showToast({
          title: `请上传第${i + 1}个原辅材料的VOCs证明文件`,
          icon: "none",
        });
        return;
      }
    }

    // 5. 检查挥发性有机物防治措施
    if (formData.vocPreventionMeasures.length === 0) {
      Taro.showToast({
        title: "请选择挥发性有机物防治措施",
        icon: "none",
      });
      return;
    }

    // 检查是否同意协议
    if (!formData.agreedToTerms) {
      Taro.showToast({
        title: "请阅读并同意用户服务协议和隐私政策",
        icon: "none",
      });
      return;
    }
    const { agreedToTerms, ...submitData } = formData;

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
          data: submitData,
        } as any);
        console.log("提交结果：", result);
        if (result.statusCode === 200) {
          Taro.showToast({
            title: "提交成功",
            icon: "success",
          });
          Taro.navigateTo({
            url: "/pages/index/index",
          });
          // setFormData(initFormdata);
          // 可以在这里添加提交成功后的逻辑，比如返回列表页
        } else {
          Taro.showToast({
            title: "提交失败",
            icon: "error",
          });
        }
      } else {
        console.error("wx对象不存在，无法调用云函数");
        Taro.showToast({
          title: "提交失败",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("提交表单时发生错误：", error);
      Taro.showToast({
        title: "提交失败",
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
            <View className="label">施工单位名称：</View>
            <Input
              className="input"
              placeholder="请输入施工单位名称"
              value={formData.constructionCompanyName}
              onInput={(e) =>
                handleChange("constructionCompanyName", e.detail.value)
              }
            />
          </View>
          <View
            className="form_item"
            style={{
              flexDirection: "column",
              alignItems: "start",
              justifyContent: "center",
              height: 70,
            }}
          >
            <View className="label">施工单位组织机构代码：</View>
            <Input
              className="input"
              placeholder="请输入施工单位组织机构代码"
              value={formData.companyCode}
              onInput={(e) => handleChange("companyCode", e.detail.value)}
              style={{ marginLeft: 6, width: "100%" }}
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
                  <View className="picker" style={{ whiteSpace: "nowrap" }}>
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
            style={{ display: "flex", flexDirection: "column" }}
          >
            <View style={{ display: "flex", justifyContent: "space-between" }}>
              <Text>主要原辅材料（必填）</Text>
              <View className="add_material" onClick={handleAddMaterial}>
                新增原辅材料
              </View>
            </View>
            <Text style={{ color: "red", fontSize: 14, fontWeight: 400 }}>
              若有多种原辅材料请点击新增原辅材料
            </Text>
          </View>
          <View className="material_list">
            {formData.materialList?.map((item: Material) => (
              <View className="material_item">
                <View className="form_item">
                  <View className="label">材料名称：</View>
                  <Input
                    className="input"
                    placeholder="请输入主要原辅材料"
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
                  <View className="label">施工期间原辅材料用量：</View>
                  <Input
                    className="input"
                    placeholder="请输入"
                    onInput={(e) =>
                      setFormData((pre) => ({
                        ...pre,
                        materialList: pre.materialList.map((item1) => {
                          if (item1.id === item.id) {
                            return {
                              ...item1,
                              materialCount: !!e.detail.value
                                ? `${e.detail.value}kg`
                                : "",
                            };
                          }
                          return item1;
                        }),
                      }))
                    }
                  />
                  <View style={{ color: "#494747", marginRight: 10 }}>kg</View>
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
                      ? "水性/低VOCs原辅材料证明："
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

        {/* 第五部分 - 挥发性有机物防治措施 */}
        <View className="form_section">
          <View className="section_title">挥发性有机物防治措施（必填）</View>
          <View
            className="form_item"
            style={{
              flexDirection: "column",
              height: "unset",
              alignItems: "start",
              borderBottom: "none",
            }}
          >
            <View className="label">挥发性有机物防治措施：</View>
            <CheckboxGroup
              style={{
                marginTop: 10,
                width: "100%",
                border: "1px solid #ccc",
                borderRadius: 4,
                padding: 8,
                boxSizing: "border-box",
              }}
              onChange={handleCheckboxChange}
            >
              {vocPreventionMeasuresList.map((measure) => (
                <View
                  key={measure}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <Checkbox
                    value={measure}
                    checked={formData.vocPreventionMeasures.includes(measure)}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{ fontSize: 14 }}>{measure}</Text>
                </View>
              ))}
            </CheckboxGroup>
          </View>
        </View>

        {/* 添加协议勾选部分 */}
        <View className="">
          <View className="form_item" style={{ borderBottom: "none" }}>
            <CheckboxGroup onChange={handleAgreementChange}>
              <View style={{ display: "flex", alignItems: "center" }}>
                <Checkbox
                  value="agreed"
                  checked={formData.agreedToTerms}
                  style={{ marginRight: 8 }}
                />
                <Text style={{ fontSize: 14 }}>
                  我已阅读并同意
                  <Text
                    style={{ color: "#0cc", marginLeft: 4 }}
                    onClick={navigateToUserAgreement}
                  >
                    《用户服务协议》
                  </Text>
                  和
                  <Text
                    style={{ color: "#0cc", marginLeft: 4 }}
                    onClick={navigateToPrivacyPolicy}
                  >
                    《隐私政策》
                  </Text>
                </Text>
              </View>
            </CheckboxGroup>
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

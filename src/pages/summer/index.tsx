import { View, Image, Button, Input } from "@tarojs/components";
import { useLoad, chooseImage } from "@tarojs/taro";
import "./index.scss";
import { useState } from "react";

export default function Summer() {
    useLoad(() => {
        console.log("Page loaded.");
    });

    // 表单数据状态
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: "",
        remark: "",
        img: "",//cloud://prod-4gcsgqa75da26b30.7072-prod-4gcsgqa75da26b30-1356097509/test.png
    });

    // 处理输入变化
    const handleChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value,
        });
    };
    // 处理输入变化
    const handleUpload = () => {
        chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success: (res) => {
                console.log(">>>>>choosefile", res)
                wx.cloud.uploadFile({
                    cloudPath: 'test.png', // 对象存储路径，根路径直接填文件名，文件夹例子 test/文件名，不要 / 开头
                    filePath: res.tempFilePaths[0], // 微信本地文件，通过选择图片，聊天文件等接口获取
                    config: {
                        env: 'prod-4gcsgqa75da26b30' // 微信云托管环境ID
                    },
                    success: function (res) {
                        console.log(res)
                        setFormData({
                            ...formData,
                            img: res.fileID
                        })
                    },
                    fail: console.error
                })
            }
        })
    };

    // 提交表单
    const handleSubmit = async () => {
        const result = await wx.cloud.callContainer({
            "config": {
                "env": "prod-4gcsgqa75da26b30"
            },
            "path": "/api/count",
            "header": {
                "X-WX-SERVICE": "koa-s36g"
            },
            "method": "GET",
        })
        console.log(">>>>>>", result);

        // 如下传参
        wx.cloud.getTempFileURL({
            fileList: ['cloud://test.png'] // 对象存储文件ID列表，最多50个，从上传文件接口或者控制台获取
        }).then(res => {
            console.log(res.fileList)
        }).catch(err => {
            console.error(err)
        })

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
                        <View className="label">项目名称</View>
                        <Input
                            className="input"
                            placeholder="请输入项目名称"
                            value={formData.name}
                            onInput={(e) => handleChange("name", e.detail.value)}
                        />
                    </View>
                    <View className="form_item">
                        <View className="label">上传文件</View>
                        <Button onClick={() => handleUpload()} >上传</Button>
                        <Image src={formData.img} style={{ width: "50px", height: "50px" }}></Image>
                    </View>
                    <View className="form_item">
                        <View className="label">建设单位名称</View>
                        <Input
                            className="input"
                            placeholder="请输入建设单位名称"
                            value={formData.phone}
                            onInput={(e) => handleChange("phone", e.detail.value)}
                        />
                    </View>
                    <View className="form_item">
                        <View className="label">组织机构代码</View>
                        <Input
                            className="input"
                            placeholder="请输入组织机构代码"
                            value={formData.address}
                            onInput={(e) => handleChange("address", e.detail.value)}
                        />
                    </View>
                    <View className="form_item">
                        <View className="label">施工负责人</View>
                        <Input
                            className="input"
                            placeholder="请输入施工负责人姓名"
                            value={formData.address}
                            onInput={(e) => handleChange("address", e.detail.value)}
                        />
                    </View>
                    <View className="form_item">
                        <View className="label">联系电话</View>
                        <Input
                            className="input"
                            placeholder="请输入正确的手机号码"
                            value={formData.address}
                            onInput={(e) => handleChange("address", e.detail.value)}
                        />
                    </View>
                </View>

                {/* 第二部分 - 其他信息 */}
                <View className="form_section">
                    <View className="section_title">其他信息（选填项）</View>
                    <View className="form_item">
                        <View className="label">备注信息</View>
                        <Input
                            className="input"
                            placeholder="请输入备注信息"
                            value={formData.remark}
                            onInput={(e) => handleChange("remark", e.detail.value)}
                        />
                    </View>
                </View>

                {/* 第三部分 - 服务协议 */}
                <View className="form_section">
                    <View className="section_title">服务协议（请仔细阅读协议条款）</View>
                    <View className="agreement">
                        <View className="agreement_View">
                            本人同意XXX服务协议，内容包括但不限于...
            </View>
                        <View className="agreement_buttons">
                            <Button className="btn agree">同意</Button>
                            <Button className="btn">拒绝</Button>
                        </View>
                    </View>
                    <View className="agreement">
                        <View className="agreement_View">XXXX内容协议（详细信息）</View>
                        <View className="agreement_value">100%</View>
                    </View>
                </View>

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

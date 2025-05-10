"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Camera,
  Download,
  RefreshCw,
  Heart,
  User,
  MapPin,
  CreditCard,
  FileText,
  Palette,
  Check,
  Sparkles,
} from "lucide-react"

// 定义证书样式类型
type CertificateTemplate = {
  id: string
  name: string
  description: string
  previewImage: string
}

// 预定义的证书模板
const certificateTemplates: CertificateTemplate[] = [
  {
    id: "traditional",
    name: "传统红色",
    description: "经典中国红风格，喜庆热烈",
    previewImage: "/certificate-preview-traditional.png",
  },
  {
    id: "modern",
    name: "现代简约",
    description: "简约现代的设计风格",
    previewImage: "/certificate-preview-modern.png",
  },
  {
    id: "elegant",
    name: "优雅装饰",
    description: "精美装饰的优雅风格",
    previewImage: "/certificate-preview-elegant.png",
  },
  {
    id: "vintage",
    name: "复古经典",
    description: "怀旧复古的经典风格",
    previewImage: "/certificate-preview-vintage.png",
  },
]

export function MarriageCertificateGenerator() {
  const [formData, setFormData] = useState({
    husbandName: "",
    wifeName: "",
    registrationDate: "",
    certificateNumber: "",
    husbandRegistrationPlace: "",
    wifeRegistrationPlace: "",
    husbandGender: "男",
    wifeGender: "女",
    husbandIdNumber: "",
    wifeIdNumber: "",
    husbandIdUrl: "https://www.gov.cn",
    wifeIdUrl: "https://www.gov.cn",
    husbandBirthDate: "",
    wifeBirthDate: "",
    registrar: "",
  })

  const [couplePhoto, setCouplePhoto] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("form")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("traditional")
  const certificateRef = useRef<HTMLDivElement>(null)

  const [animatePhoto, setAnimatePhoto] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [animatePreview, setAnimatePreview] = useState(false)

  // 照片上传动画效果
  useEffect(() => {
    if (couplePhoto) {
      setAnimatePhoto(true)
      const timer = setTimeout(() => setAnimatePhoto(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [couplePhoto])

  // 证书生成成功消息
  useEffect(() => {
    if (activeTab === "preview") {
      setAnimatePreview(true)
      setShowSuccessMessage(true)
      const timer = setTimeout(() => setShowSuccessMessage(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [activeTab])

  const generateCertificateNumber = (husbandName: string, wifeName: string) => {
    if (!husbandName || !wifeName) return ""

    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    // Generate a simple hash from the names
    let nameHash = 0
    const combinedName = husbandName + wifeName
    for (let i = 0; i < combinedName.length; i++) {
      nameHash = (nameHash << 5) - nameHash + combinedName.charCodeAt(i)
      nameHash = nameHash & 0xffff // Keep it 16-bit
    }

    // Format: 520XXX-YYYY-MMDDXXXX where XXXX is the name hash
    return `520${Math.abs(nameHash % 1000)
      .toString()
      .padStart(3, "0")}-${year}-${month}${day}${Math.abs(nameHash).toString().padStart(4, "0")}`
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const newData = { ...prev, [name]: value }

      // Auto-generate certificate number when names change
      if (name === "husbandName" || name === "wifeName") {
        newData.certificateNumber = generateCertificateNumber(
          name === "husbandName" ? value : prev.husbandName,
          name === "wifeName" ? value : prev.wifeName,
        )
      }

      return newData
    })
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setCouplePhoto(event.target.result as string)
        }
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
  }

  const generateCertificate = () => {
    setIsGenerating(true)
    // 模拟生成延迟并添加动画
    setTimeout(() => {
      setIsGenerating(false)
      setActiveTab("preview")
    }, 1500)
  }

  const downloadCertificate = async () => {
    if (!certificateRef.current) return

    try {
      // 显示加载状态
      setIsGenerating(true)

      // 导入 html2canvas (动态导入以减少初始加载时间)
      const html2canvas = (await import("html2canvas")).default

      // 捕获证书元素为图片
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // 提高分辨率
        useCORS: true, // 允许跨域图片
        allowTaint: true,
        backgroundColor: null,
      })

      // 转换为图片数据
      const image = canvas.toDataURL("image/png", 1.0)

      // 创建下载链接
      const downloadLink = document.createElement("a")
      const fileName = `婚姻证书_${formData.husbandName}_${formData.wifeName}_${new Date().getTime()}.png`

      downloadLink.href = image
      downloadLink.download = fileName
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      // 显示成功消息
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
    } catch (error) {
      console.error("下载证书时出错:", error)
      alert("下载证书时出错，请重试")
    } finally {
      setIsGenerating(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }

  // Render the certificate based on the selected template
  const renderCertificate = () => {
    switch (selectedTemplate) {
      case "traditional":
        return renderTraditionalCertificate()
      case "modern":
        return renderModernCertificate()
      case "elegant":
        return renderElegantCertificate()
      case "vintage":
        return renderVintageCertificate()
      default:
        return renderTraditionalCertificate()
    }
  }

  // Traditional Chinese style certificate
  const renderTraditionalCertificate = () => {
    return (
      <motion.div
        className="bg-white border border-gray-200 rounded-lg p-8 relative shadow-lg"
        style={{ minHeight: "600px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* 保持原有内容不变 */}
        <div className="relative">
          {/* Decorative header */}
          <div className="absolute top-0 left-0 w-full">
            <div
              className="h-16 w-full bg-contain bg-no-repeat bg-center"
              style={{
                backgroundImage: "url('/elegant-floral-wedding-certificate-pattern.png')",
                opacity: 0.3,
              }}
            ></div>
          </div>

          <div className="text-center mb-6 pt-6">
            <h2 className="text-2xl font-bold text-red-600 font-serif">结婚证书</h2>
            <div className="mt-2 flex justify-center">
              <div className="h-0.5 w-16 bg-red-400 rounded"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left section */}
            <div className="col-span-2 space-y-6">
              <div className="flex items-center space-x-4">
                <span className="font-semibold text-gray-700">登记员:</span>
                <span className="text-red-600 border-b border-red-600 px-2">{formData.registrar || "___________"}</span>
              </div>

              <div className="flex items-center space-x-4">
                <span className="font-semibold text-gray-700">登记日期:</span>
                <span className="text-red-600 border-b border-red-600 px-2">
                  {formatDate(formData.registrationDate) || "___________"}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                <span className="font-semibold text-gray-700">结婚证书号:</span>
                <span className="border-b border-gray-400 px-2 text-gray-800">
                  {formData.certificateNumber || "___________"}
                </span>
              </div>

              <div className="mt-8">
                <span className="font-semibold text-gray-700">备注:</span>
              </div>
            </div>

            {/* Right section - Photo */}
            <div className="col-span-1">
              <div className="border-4 border-red-600 h-48 w-full bg-red-600 flex items-center justify-center shadow-md">
                {couplePhoto ? (
                  <Image
                    src={couplePhoto || "/placeholder.svg"}
                    alt="Couple photo"
                    width={180}
                    height={180}
                    className="object-cover"
                  />
                ) : (
                  <div className="text-white text-center text-sm">请上传合照</div>
                )}
              </div>
            </div>
          </div>

          {/* Husband information */}
          <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-4">
            <div className="flex items-center space-x-4">
              <span className="font-semibold text-gray-700">姓名:</span>
              <span className="text-red-600 border-b border-red-600 px-2">{formData.husbandName || "___________"}</span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="font-semibold text-gray-700">性别:</span>
              <span className="border-b border-gray-400 px-2 text-gray-800">{formData.husbandGender}</span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="font-semibold text-gray-700">办理地:</span>
              <span className="border-b border-gray-400 px-2 text-gray-800">
                {formData.husbandRegistrationPlace || "___________"}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="font-semibold text-gray-700">出生日期:</span>
              <span className="border-b border-gray-400 px-2 text-gray-800">
                {formatDate(formData.husbandBirthDate) || "___________"}
              </span>
            </div>

            <div className="col-span-2 flex items-center space-x-4">
              <span className="font-semibold text-gray-700">身份证件号:</span>
              <a
                href={formData.husbandIdUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border-b border-gray-400 px-2 flex-1 text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                {formData.husbandIdNumber || "___________"}
              </a>
            </div>
          </div>

          {/* Wife information */}
          <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-4">
            <div className="flex items-center space-x-4">
              <span className="font-semibold text-gray-700">姓名:</span>
              <span className="text-red-600 border-b border-red-600 px-2">{formData.wifeName || "___________"}</span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="font-semibold text-gray-700">性别:</span>
              <span className="border-b border-gray-400 px-2 text-gray-800">{formData.wifeGender}</span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="font-semibold text-gray-700">办理地:</span>
              <span className="border-b border-gray-400 px-2 text-gray-800">
                {formData.wifeRegistrationPlace || "___________"}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="font-semibold text-gray-700">出生日期:</span>
              <span className="border-b border-gray-400 px-2 text-gray-800">
                {formatDate(formData.wifeBirthDate) || "___________"}
              </span>
            </div>

            <div className="col-span-2 flex items-center space-x-4">
              <span className="font-semibold text-gray-700">身份证件号:</span>
              <a
                href={formData.wifeIdUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border-b border-gray-400 px-2 flex-1 text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                {formData.wifeIdNumber || "___________"}
              </a>
            </div>
          </div>

          {/* Official seal placeholder */}
          <div className="absolute bottom-4 right-4 h-28 w-28 opacity-30 rounded-full border border-red-600 flex items-center justify-center text-red-600 text-xs transform rotate-12">
            <div className="absolute inset-0 rounded-full border-2 border-red-600 flex items-center justify-center">
              <div className="text-center">
                <div>婚姻登记专用章</div>
                <div className="text-[10px] mt-1">{formatDate(formData.registrationDate) || "日期"}</div>
              </div>
            </div>
          </div>

          {/* Decorative corner elements */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-red-300 rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-red-300 rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-red-300 rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-red-300 rounded-br-lg"></div>
        </div>
      </motion.div>
    )
  }

  // Modern minimalist certificate
  const renderModernCertificate = () => {
    return (
      <motion.div
        className="bg-white border border-gray-200 rounded-lg p-8 relative shadow-lg"
        style={{ minHeight: "600px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          {/* Modern header with logo */}
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold text-gray-800">婚姻证书</h2>
                <p className="text-sm text-gray-500">MARRIAGE CERTIFICATE</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">证书编号</div>
              <div className="text-md font-medium text-gray-800">{formData.certificateNumber || "N/A"}</div>
            </div>
          </div>

          {/* Photo and basic info */}
          <div className="flex flex-col md:flex-row gap-8 mb-10">
            <div className="w-full md:w-1/3">
              <div className="aspect-square w-full bg-gray-100 rounded-lg overflow-hidden shadow-md">
                {couplePhoto ? (
                  <Image src={couplePhoto || "/placeholder.svg"} alt="Couple photo" fill className="object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400">
                    <Camera className="h-12 w-12" />
                  </div>
                )}
              </div>
            </div>
            <div className="w-full md:w-2/3 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">登记日期</div>
                  <div className="text-lg font-medium text-gray-800">
                    {formatDate(formData.registrationDate) || "未填写"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">登记员</div>
                  <div className="text-lg font-medium text-gray-800">{formData.registrar || "未填写"}</div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-500 mb-2">备注</div>
                <div className="text-gray-700 italic">此证书证明双方已依法登记结婚，具有法律效力。</div>
              </div>
            </div>
          </div>

          {/* Couple information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* First person */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-700 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                第一位信息
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">姓名</span>
                  <span className="font-medium text-gray-800">{formData.husbandName || "未填写"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">性别</span>
                  <span className="font-medium text-gray-800">{formData.husbandGender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">办理地</span>
                  <span className="font-medium text-gray-800">{formData.husbandRegistrationPlace || "未填写"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">出生日期</span>
                  <span className="font-medium text-gray-800">{formatDate(formData.husbandBirthDate) || "未填写"}</span>
                </div>
                <div className="pt-2 border-t border-blue-100">
                  <div className="text-gray-500 text-sm mb-1">身份证件号</div>
                  <a
                    href={formData.husbandIdUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {formData.husbandIdNumber || "未填写"}
                  </a>
                </div>
              </div>
            </div>

            {/* Second person */}
            <div className="bg-pink-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-pink-700 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                第二位信息
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">姓名</span>
                  <span className="font-medium text-gray-800">{formData.wifeName || "未填写"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">性别</span>
                  <span className="font-medium text-gray-800">{formData.wifeGender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">办理地</span>
                  <span className="font-medium text-gray-800">{formData.wifeRegistrationPlace || "未填写"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">出生日期</span>
                  <span className="font-medium text-gray-800">{formatDate(formData.wifeBirthDate) || "未填写"}</span>
                </div>
                <div className="pt-2 border-t border-pink-100">
                  <div className="text-gray-500 text-sm mb-1">身份证件号</div>
                  <a
                    href={formData.wifeIdUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:text-pink-800 font-medium"
                  >
                    {formData.wifeIdNumber || "未填写"}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with QR code placeholder */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <div className="text-gray-500 text-sm">
              <div>登记日期: {formatDate(formData.registrationDate) || "未填写"}</div>
              <div className="mt-1">证书编号: {formData.certificateNumber || "未生成"}</div>
            </div>
            <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
              <div className="text-xs text-center">
                <div>扫描验证</div>
                <div>证书真伪</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Elegant decorative certificate
  const renderElegantCertificate = () => {
    return (
      <motion.div
        className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-lg p-8 relative shadow-lg"
        style={{ minHeight: "600px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          {/* Elegant header with ornaments */}
          <div className="absolute top-0 left-0 w-full h-32 opacity-10">
            <div
              className="h-full w-full bg-contain bg-no-repeat bg-center"
              style={{
                backgroundImage: "url('/elegant-ornament.png')",
              }}
            ></div>
          </div>

          <div className="text-center pt-8 mb-10">
            <div className="text-amber-800 text-sm uppercase tracking-widest">Certificate of</div>
            <h2 className="text-3xl font-serif font-bold text-amber-700 mt-1">Marriage</h2>
            <div className="mt-2 flex justify-center">
              <div className="h-px w-32 bg-amber-300"></div>
            </div>
          </div>

          {/* Main content with decorative border */}
          <div className="border-2 border-amber-200 rounded-lg p-6 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-50 px-4">
              <Heart className="h-6 w-6 text-amber-400" />
            </div>

            {/* Photo and basic info */}
            <div className="flex flex-col md:flex-row items-center gap-8 mb-8 mt-4">
              <div className="w-full md:w-1/3 flex justify-center">
                <div className="h-48 w-48 rounded-full overflow-hidden border-4 border-amber-200 shadow-md">
                  {couplePhoto ? (
                    <Image
                      src={couplePhoto || "/placeholder.svg"}
                      alt="Couple photo"
                      width={192}
                      height={192}
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-amber-100 flex items-center justify-center">
                      <Camera className="h-12 w-12 text-amber-300" />
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full md:w-2/3 space-y-4 text-center md:text-left">
                <div>
                  <div className="text-sm text-amber-700 font-medium">登记日期</div>
                  <div className="text-lg font-serif text-amber-900">
                    {formatDate(formData.registrationDate) || "未填写"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-amber-700 font-medium">登记员</div>
                  <div className="text-lg font-serif text-amber-900">{formData.registrar || "未填写"}</div>
                </div>
                <div>
                  <div className="text-sm text-amber-700 font-medium">证书编号</div>
                  <div className="text-lg font-serif text-amber-900">{formData.certificateNumber || "未生成"}</div>
                </div>
              </div>
            </div>

            {/* Couple information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              {/* First person */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-amber-800 mb-3 pb-2 border-b border-amber-200">第一位信息</h3>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-amber-700">姓名</span>
                  <span className="col-span-2 font-medium text-amber-900">{formData.husbandName || "未填写"}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-amber-700">性别</span>
                  <span className="col-span-2 font-medium text-amber-900">{formData.husbandGender}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-amber-700">办理地</span>
                  <span className="col-span-2 font-medium text-amber-900">
                    {formData.husbandRegistrationPlace || "未填写"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-amber-700">出生日期</span>
                  <span className="col-span-2 font-medium text-amber-900">
                    {formatDate(formData.husbandBirthDate) || "未填写"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-amber-700">身份证件号</span>
                  <a
                    href={formData.husbandIdUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="col-span-2 text-amber-600 hover:text-amber-800 font-medium"
                  >
                    {formData.husbandIdNumber || "未填写"}
                  </a>
                </div>
              </div>

              {/* Second person */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-amber-800 mb-3 pb-2 border-b border-amber-200">第二位信息</h3>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-amber-700">姓名</span>
                  <span className="col-span-2 font-medium text-amber-900">{formData.wifeName || "未填写"}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-amber-700">性别</span>
                  <span className="col-span-2 font-medium text-amber-900">{formData.wifeGender}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-amber-700">办理地</span>
                  <span className="col-span-2 font-medium text-amber-900">
                    {formData.wifeRegistrationPlace || "未填写"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-amber-700">出生日期</span>
                  <span className="col-span-2 font-medium text-amber-900">
                    {formatDate(formData.wifeBirthDate) || "未填写"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-amber-700">身份证件号</span>
                  <a
                    href={formData.wifeIdUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="col-span-2 text-amber-600 hover:text-amber-800 font-medium"
                  >
                    {formData.wifeIdNumber || "未填写"}
                  </a>
                </div>
              </div>
            </div>

            {/* Seal and signature */}
            <div className="flex justify-between items-end mt-8 pt-4">
              <div className="text-amber-700 text-sm italic">此证书证明双方已依法登记结婚，具有法律效力。</div>
              <div className="flex flex-col items-center">
                <div className="h-20 w-20 rounded-full border-2 border-amber-300 flex items-center justify-center opacity-60">
                  <div className="text-xs text-center text-amber-800">
                    <div>婚姻登记专用章</div>
                    <div className="text-[10px] mt-1">{formatDate(formData.registrationDate) || "日期"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-16 h-16 opacity-30">
            <div
              className="h-full w-full bg-contain bg-no-repeat"
              style={{
                backgroundImage: "url('/elegant-corner.png')",
                transform: "rotate(0deg)",
              }}
            ></div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 opacity-30">
            <div
              className="h-full w-full bg-contain bg-no-repeat"
              style={{
                backgroundImage: "url('/elegant-corner.png')",
                transform: "rotate(90deg)",
              }}
            ></div>
          </div>
          <div className="absolute bottom-0 left-0 w-16 h-16 opacity-30">
            <div
              className="h-full w-full bg-contain bg-no-repeat"
              style={{
                backgroundImage: "url('/elegant-corner.png')",
                transform: "rotate(270deg)",
              }}
            ></div>
          </div>
          <div className="absolute bottom-0 right-0 w-16 h-16 opacity-30">
            <div
              className="h-full w-full bg-contain bg-no-repeat"
              style={{
                backgroundImage: "url('/elegant-corner.png')",
                transform: "rotate(180deg)",
              }}
            ></div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Vintage classic certificate
  const renderVintageCertificate = () => {
    return (
      <motion.div
        className="bg-amber-100 border-4 border-amber-800 rounded-lg p-8 relative shadow-lg"
        style={{
          minHeight: "600px",
          backgroundImage: "url('/vintage-paper-texture.png')",
          backgroundSize: "cover",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          {/* Vintage header */}
          <div className="text-center mb-8">
            <div
              className="h-24 w-full bg-contain bg-no-repeat bg-center mb-4"
              style={{
                backgroundImage: "url('/vintage-header.png')",
              }}
            ></div>
            <h2 className="text-3xl font-serif font-bold text-amber-900">结婚证书</h2>
            <div className="text-amber-800 text-sm mt-1 font-serif">CERTIFICATE OF MARRIAGE</div>
          </div>

          {/* Main content with vintage styling */}
          <div className="border-2 border-amber-700 p-6 bg-amber-50 bg-opacity-60 rounded">
            {/* Photo and basic info */}
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="w-full md:w-1/3 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 border-8 border-amber-800 rounded-lg transform rotate-3"></div>
                  <div className="h-48 w-40 relative z-10 border-4 border-amber-200 bg-amber-50 rounded-lg overflow-hidden">
                    {couplePhoto ? (
                      <Image src={couplePhoto || "/placeholder.svg"} alt="Couple photo" fill className="object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Camera className="h-12 w-12 text-amber-300" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-full md:w-2/3 font-serif">
                <div className="text-center md:text-left mb-4">
                  <div className="text-lg text-amber-900 font-bold">婚姻登记证明</div>
                  <div className="text-sm text-amber-700">兹证明以下二人已依法办理结婚登记</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-amber-800 font-medium">登记日期</div>
                    <div className="text-lg text-amber-900">{formatDate(formData.registrationDate) || "未填写"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-amber-800 font-medium">登记员</div>
                    <div className="text-lg text-amber-900">{formData.registrar || "未填写"}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-sm text-amber-800 font-medium">证书编号</div>
                  <div className="text-lg text-amber-900 font-bold">{formData.certificateNumber || "未生成"}</div>
                </div>
              </div>
            </div>

            {/* Couple information in vintage style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* First person */}
              <div className="bg-amber-50 bg-opacity-70 p-4 border border-amber-300 rounded">
                <h3 className="text-lg font-serif font-bold text-amber-900 mb-3 text-center border-b border-amber-300 pb-2">
                  {formData.husbandName || "第一位姓名"}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-amber-800 font-serif">性别</span>
                    <span className="font-medium text-amber-900 font-serif">{formData.husbandGender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-800 font-serif">办理地</span>
                    <span className="font-medium text-amber-900 font-serif">
                      {formData.husbandRegistrationPlace || "未填写"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-800 font-serif">出生日期</span>
                    <span className="font-medium text-amber-900 font-serif">
                      {formatDate(formData.husbandBirthDate) || "未填写"}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-amber-300">
                    <div className="text-amber-800 font-serif text-sm mb-1">身份证件号</div>
                    <a
                      href={formData.husbandIdUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-700 hover:text-amber-900 font-medium font-serif"
                    >
                      {formData.husbandIdNumber || "未填写"}
                    </a>
                  </div>
                </div>
              </div>

              {/* Second person */}
              <div className="bg-amber-50 bg-opacity-70 p-4 border border-amber-300 rounded">
                <h3 className="text-lg font-serif font-bold text-amber-900 mb-3 text-center border-b border-amber-300 pb-2">
                  {formData.wifeName || "第二位姓名"}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-amber-800 font-serif">性别</span>
                    <span className="font-medium text-amber-900 font-serif">{formData.wifeGender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-800 font-serif">办理地</span>
                    <span className="font-medium text-amber-900 font-serif">
                      {formData.wifeRegistrationPlace || "未填写"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-800 font-serif">出生日期</span>
                    <span className="font-medium text-amber-900 font-serif">
                      {formatDate(formData.wifeBirthDate) || "未填写"}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-amber-300">
                    <div className="text-amber-800 font-serif text-sm mb-1">身份证件号</div>
                    <a
                      href={formData.wifeIdUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-700 hover:text-amber-900 font-medium font-serif"
                    >
                      {formData.wifeIdNumber || "未填写"}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Vintage seal and signature */}
            <div className="flex justify-between items-end mt-8 pt-4">
              <div className="text-amber-800 text-sm italic font-serif">
                兹证明上述二人的结婚登记符合法律规定，特发此证。
              </div>
              <div className="flex flex-col items-center">
                <div className="h-24 w-24 opacity-70">
                  <div
                    className="h-full w-full bg-contain bg-no-repeat bg-center"
                    style={{
                      backgroundImage: "url('/vintage-seal.png')",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Vintage decorative elements */}
          <div className="absolute top-2 left-2 w-20 h-20 opacity-30">
            <div
              className="h-full w-full bg-contain bg-no-repeat"
              style={{
                backgroundImage: "url('/vintage-ornament-corner.png')",
              }}
            ></div>
          </div>
          <div className="absolute top-2 right-2 w-20 h-20 opacity-30 transform scale-x-[-1]">
            <div
              className="h-full w-full bg-contain bg-no-repeat"
              style={{
                backgroundImage: "url('/vintage-ornament-corner.png')",
              }}
            ></div>
          </div>
          <div className="absolute bottom-2 left-2 w-20 h-20 opacity-30 transform scale-y-[-1]">
            <div
              className="h-full w-full bg-contain bg-no-repeat"
              style={{
                backgroundImage: "url('/vintage-ornament-corner.png')",
              }}
            ></div>
          </div>
          <div className="absolute bottom-2 right-2 w-20 h-20 opacity-30 transform scale-x-[-1] scale-y-[-1]">
            <div
              className="h-full w-full bg-contain bg-no-repeat"
              style={{
                backgroundImage: "url('/vintage-ornament-corner.png')",
              }}
            ></div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* 成功消息 */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-100 border border-green-200 text-green-700 px-4 py-2 rounded-full shadow-lg flex items-center"
          >
            <Check className="h-5 w-5 mr-2 text-green-500" />
            证书生成成功！
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <motion.div
            className="flex justify-center mb-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <Heart className="h-12 w-12 text-red-500" />
          </motion.div>
          <motion.h1
            className="text-4xl font-bold text-gray-900 sm:text-5xl mb-2 font-serif"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            在线婚姻证书生成器
          </motion.h1>
          <motion.p
            className="mt-3 text-xl text-gray-500 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            创建您专属的婚姻证书，定制您的爱情见证
          </motion.p>
          <motion.div
            className="mt-4 flex justify-center"
            initial={{ width: 0 }}
            animate={{ width: "5rem" }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="h-1 w-20 bg-red-400 rounded"></div>
          </motion.div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 rounded-full p-1 bg-pink-100">
            <TabsTrigger
              value="form"
              className="rounded-full data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm transition-all duration-200"
            >
              <FileText className="mr-2 h-4 w-4" />
              填写信息
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="rounded-full data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm transition-all duration-200"
            >
              <Heart className="mr-2 h-4 w-4" />
              预览证书
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="space-y-6">
            <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 h-2"></div>
              <CardContent className="pt-6">
                <div className="mb-8">
                  <h3 className="text-lg font-medium flex items-center text-red-500">
                    <Palette className="mr-2 h-5 w-5" />
                    选择证书样式
                  </h3>
                  <div className="mt-4">
                    <RadioGroup
                      defaultValue={selectedTemplate}
                      onValueChange={handleTemplateChange}
                      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
                    >
                      {certificateTemplates.map((template, index) => (
                        <motion.div
                          key={template.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                          className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 ${
                            selectedTemplate === template.id
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <RadioGroupItem value={template.id} id={template.id} className="sr-only" />
                          <Label htmlFor={template.id} className="cursor-pointer flex flex-col items-center">
                            <div className="w-full h-24 mb-2 rounded overflow-hidden relative">
                              <Image
                                src={template.previewImage || "/placeholder.svg"}
                                alt={template.name}
                                width={200}
                                height={120}
                                className="w-full h-full object-cover"
                              />
                              {selectedTemplate === template.id && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center"
                                >
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                    className="bg-white rounded-full p-1"
                                  >
                                    <Check className="h-5 w-5 text-red-500" />
                                  </motion.div>
                                </motion.div>
                              )}
                            </div>
                            <span className="font-medium text-gray-900">{template.name}</span>
                            <span className="text-xs text-gray-500 mt-1">{template.description}</span>
                          </Label>
                        </motion.div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <h3 className="text-lg font-medium flex items-center text-red-500">
                      <User className="mr-2 h-5 w-5" />
                      个人信息
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="husbandName" className="text-sm font-medium text-gray-700">
                          第一位姓名
                        </Label>
                        <Input
                          id="husbandName"
                          name="husbandName"
                          value={formData.husbandName}
                          onChange={handleInputChange}
                          placeholder="例如：张小帅"
                          className="rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="husbandGender" className="text-sm font-medium text-gray-700">
                          第一位性别
                        </Label>
                        <Input
                          id="husbandGender"
                          name="husbandGender"
                          value={formData.husbandGender}
                          onChange={handleInputChange}
                          placeholder="例如：男"
                          className="rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="wifeName" className="text-sm font-medium text-gray-700">
                          第二位姓名
                        </Label>
                        <Input
                          id="wifeName"
                          name="wifeName"
                          value={formData.wifeName}
                          onChange={handleInputChange}
                          placeholder="例如：萌小美"
                          className="rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="wifeGender" className="text-sm font-medium text-gray-700">
                          第二位性别
                        </Label>
                        <Input
                          id="wifeGender"
                          name="wifeGender"
                          value={formData.wifeGender}
                          onChange={handleInputChange}
                          placeholder="例如：女"
                          className="rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                        />
                      </div>
                    </div>

                    <h3 className="text-lg font-medium flex items-center pt-2 text-red-500">
                      <MapPin className="mr-2 h-5 w-5" />
                      办理信息
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="husbandRegistrationPlace" className="text-sm font-medium text-gray-700">
                          第一位办理地
                        </Label>
                        <Input
                          id="husbandRegistrationPlace"
                          name="husbandRegistrationPlace"
                          value={formData.husbandRegistrationPlace}
                          onChange={handleInputChange}
                          placeholder="例如：北京市"
                          className="rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="wifeRegistrationPlace" className="text-sm font-medium text-gray-700">
                          第二位办理地
                        </Label>
                        <Input
                          id="wifeRegistrationPlace"
                          name="wifeRegistrationPlace"
                          value={formData.wifeRegistrationPlace}
                          onChange={handleInputChange}
                          placeholder="例如：上海市"
                          className="rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="registrationDate" className="text-sm font-medium text-gray-700">
                          登记日期
                        </Label>
                        <Input
                          id="registrationDate"
                          name="registrationDate"
                          type="date"
                          value={formData.registrationDate}
                          onChange={handleInputChange}
                          className="rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="registrar" className="text-sm font-medium text-gray-700">
                          登记员
                        </Label>
                        <Input
                          id="registrar"
                          name="registrar"
                          value={formData.registrar}
                          onChange={handleInputChange}
                          placeholder="登记员姓名"
                          className="rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <h3 className="text-lg font-medium flex items-center text-red-500">
                      <CreditCard className="mr-2 h-5 w-5" />
                      证件信息
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="husbandIdNumber" className="text-sm font-medium text-gray-700">
                        第一位身份证号
                      </Label>
                      <Input
                        id="husbandIdNumber"
                        name="husbandIdNumber"
                        value={formData.husbandIdNumber}
                        onChange={handleInputChange}
                        placeholder="18位身份证号码"
                        className="rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="husbandIdUrl" className="text-sm font-medium text-gray-700">
                        第一位身份证号链接
                      </Label>
                      <Input
                        id="husbandIdUrl"
                        name="husbandIdUrl"
                        value={formData.husbandIdUrl}
                        onChange={handleInputChange}
                        placeholder="例如：https://www.gov.cn"
                        className="rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="wifeIdNumber" className="text-sm font-medium text-gray-700">
                        第二位身份证号
                      </Label>
                      <Input
                        id="wifeIdNumber"
                        name="wifeIdNumber"
                        value={formData.wifeIdNumber}
                        onChange={handleInputChange}
                        placeholder="18位身份证号码"
                        className="rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="wifeIdUrl" className="text-sm font-medium text-gray-700">
                        第二位身份证号链接
                      </Label>
                      <Input
                        id="wifeIdUrl"
                        name="wifeIdUrl"
                        value={formData.wifeIdUrl}
                        onChange={handleInputChange}
                        placeholder="例如：https://www.gov.cn"
                        className="rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="husbandBirthDate" className="text-sm font-medium text-gray-700">
                          第一位出生日期
                        </Label>
                        <Input
                          id="husbandBirthDate"
                          name="husbandBirthDate"
                          type="date"
                          value={formData.husbandBirthDate}
                          onChange={handleInputChange}
                          className="rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="wifeBirthDate" className="text-sm font-medium text-gray-700">
                          第二位出生日期
                        </Label>
                        <Input
                          id="wifeBirthDate"
                          name="wifeBirthDate"
                          type="date"
                          value={formData.wifeBirthDate}
                          onChange={handleInputChange}
                          className="rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <Label className="text-sm font-medium text-gray-700">上传合照（红底）</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="border-2 border-dashed border-pink-300 rounded-lg p-4 flex flex-col items-center justify-center bg-pink-50 hover:bg-pink-100 transition-colors duration-200"
                        >
                          <Camera className="h-8 w-8 text-pink-400 mb-2" />
                          <label htmlFor="photo-upload" className="cursor-pointer">
                            <span className="text-sm text-pink-600 font-medium">点击上传照片</span>
                            <input
                              id="photo-upload"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handlePhotoUpload}
                            />
                          </label>
                        </motion.div>

                        {couplePhoto && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                              opacity: 1,
                              scale: animatePhoto ? 1.05 : 1,
                              transition: {
                                scale: { type: "spring", stiffness: 300, damping: 15 },
                              },
                            }}
                            className="relative h-32 w-full border rounded-lg overflow-hidden shadow-sm"
                          >
                            <Image
                              src={couplePhoto || "/placeholder.svg"}
                              alt="Couple photo"
                              fill
                              className="object-cover"
                            />
                            {animatePhoto && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-white bg-opacity-30 flex items-center justify-center"
                              >
                                <Sparkles className="h-8 w-8 text-amber-500" />
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={generateCertificate}
                      disabled={isGenerating}
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full px-8 py-2 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Heart className="mr-2 h-4 w-4" />
                          生成证书
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 h-2"></div>
              <CardContent className="pt-6">
                <motion.div
                  ref={certificateRef}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5 },
                  }}
                >
                  {renderCertificate()}
                </motion.div>

                <div className="mt-6 flex justify-end">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={downloadCertificate}
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full px-8 py-2 shadow-md hover:shadow-lg transition-all duration-200 flex items-center"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      下载证书
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

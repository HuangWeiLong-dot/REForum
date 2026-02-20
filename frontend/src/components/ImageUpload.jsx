import React, { useRef, useState } from 'react'
import { FaTimes, FaUpload } from 'react-icons/fa'
import { useLanguage } from '../context/LanguageContext'
import './ImageUpload.css'

const formatWithParams = (template, params = {}) => {
  if (!template) return ''
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    Object.prototype.hasOwnProperty.call(params, key) ? params[key] : `{${key}}`
  )
}

const ImageUpload = ({ images = [], onChange, maxImages = 10 }) => {
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const { t } = useLanguage()

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files)
    const allFiles = fileArray

    if (allFiles.length === 0) {
      alert(t('image.alertSelect'))
      return
    }

    if (images.length + allFiles.length > maxImages) {
      alert(formatWithParams(t('image.alertMax'), { max: maxImages }))
      return
    }

    // 检查文件大小（30MB）
    const oversizedFiles = allFiles.filter(file => file.size > 30 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      alert(t('image.alertSize'))
      return
    }

    try {
      const newFiles = []
      for (const file of allFiles) {
        // 创建预览URL
        const previewUrl = URL.createObjectURL(file)
        newFiles.push({
          file: file,
          preview: previewUrl,
          url: null, // 提交时会上传并获取URL
          name: file.name,
          type: file.type
        })
      }

      // 只添加预览，不上传
      onChange([...images, ...newFiles])
    } catch (error) {
      console.error('Failed to process files:', error)
      alert(t('image.processFail'))
    }
  }

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files)
    }
    // 重置input，允许重复选择同一文件
    e.target.value = ''
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const handleRemove = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="image-upload">
      <label className="image-upload-label">{t('image.label')}</label>
      
      {/* 上传区域 */}
      {images.length < maxImages && (
        <div
          className={`image-upload-area ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="*/*"
            multiple
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
          <FaUpload className="upload-icon" />
          <p className="upload-text">
            {t('image.cta')}
          </p>
          <p className="upload-hint">
            {formatWithParams(t('image.hint'), { max: maxImages })}
          </p>
        </div>
      )}

      {/* 文件预览 */}
      {images.length > 0 && (
        <div className="image-preview-grid">
          {images.map((file, index) => (
            <div key={index} className="image-preview-item">
              {file.type.startsWith('image/') ? (
                // 图片预览
                <img
                  src={file.preview}
                  alt={file.name || formatWithParams(t('image.alt'), { index: index + 1 })}
                  className="image-preview"
                  onError={(e) => {
                    console.error('Preview image failed to load:', file.preview)
                    e.target.style.display = 'none'
                  }}
                />
              ) : (
                // 非图片文件预览
                <div className="file-preview">
                </div>
              )}
              <button
                type="button"
                className="image-remove-button"
                onClick={() => handleRemove(index)}
                title={t('image.delete')}
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageUpload


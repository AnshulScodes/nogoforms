import React, { useState } from 'react';
import { Modal } from 'antd';
import { ZoomInOutlined } from '@ant-design/icons';
import { FormBlockConfig } from './FormBlockSDK';
import './ImageField.css';

interface ImageFieldProps {
  field: FormBlockConfig;
}

export const ImageField: React.FC<ImageFieldProps> = ({ field }) => {
  const [previewVisible, setPreviewVisible] = useState(false);

  if (!field.imageUrl) {
    return (
      <div className="image-field-placeholder">
        <div>No image available</div>
      </div>
    );
  }

  const imageStyle: React.CSSProperties = {
    width: field.imageWidth ? `${field.imageWidth}px` : '100%',
    height: field.imageHeight ? `${field.imageHeight}px` : 'auto',
    objectFit: 'contain',
    borderRadius: field.imageBorderRadius ? `${field.imageBorderRadius}px` : '0',
    border: field.imageBorder ? '1px solid #d9d9d9' : 'none',
  };

  const containerStyle: React.CSSProperties = {
    textAlign: field.imageAlignment || 'center',
  };

  const handlePreview = () => {
    setPreviewVisible(true);
  };

  const handleCancel = () => {
    setPreviewVisible(false);
  };

  return (
    <div className="image-field">
      <div 
        className={`image-field-container ${field.imageFullField ? 'full-field' : ''}`} 
        style={containerStyle}
      >
        <div className="image-wrapper">
          <img 
            src={field.imageUrl} 
            alt={field.imageAlt || field.label || 'Image'} 
            style={imageStyle}
            className="image-field-img"
          />
          <div className="image-overlay" onClick={handlePreview}>
            <ZoomInOutlined className="zoom-icon" />
          </div>
        </div>
        {field.imageCaption && (
          <div className="image-caption">{field.imageCaption}</div>
        )}
      </div>

      <Modal
        visible={previewVisible}
        title={field.label || 'Image Preview'}
        footer={null}
        onCancel={handleCancel}
        width="auto"
        centered
        className="image-preview-modal"
      >
        <img 
          alt={field.imageAlt || field.label || 'Image Preview'} 
          src={field.imageUrl} 
          className="preview-image"
        />
        {field.imageCaption && (
          <div className="preview-caption">{field.imageCaption}</div>
        )}
      </Modal>
    </div>
  );
}; 
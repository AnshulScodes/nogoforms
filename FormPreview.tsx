import React from 'react';
import { Form, Input, Checkbox, Radio, Select, DatePicker, TimePicker, Upload, Button, Divider } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { FormBlockConfig } from './FormBlockSDK';
import { ImageField } from './ImageField';
import './FormPreview.css';

interface FormPreviewProps {
  fields: FormBlockConfig[];
  readOnly?: boolean;
}

export const FormPreview: React.FC<FormPreviewProps> = ({ fields, readOnly = false }) => {
  const renderFieldImage = (field: FormBlockConfig) => {
    if (!field.imageUrl) return null;

    // If image is set to full field mode, return only the image
    if (field.imageFullField) {
      return (
        <div className="form-field-image full-field">
          <img 
            src={field.imageUrl} 
            alt={field.imageAlt || field.label || 'Field image'} 
            className="full-field-image"
          />
          {field.imageCaption && (
            <div className="image-caption">{field.imageCaption}</div>
          )}
        </div>
      );
    }

    // Otherwise return the inline image with specified dimensions and styling
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

    return (
      <div className="form-field-image" style={containerStyle}>
        <img 
          src={field.imageUrl} 
          alt={field.imageAlt || field.label || 'Field image'} 
          style={imageStyle}
        />
        {field.imageCaption && (
          <div className="image-caption">{field.imageCaption}</div>
        )}
      </div>
    );
  };

  const renderField = (field: FormBlockConfig) => {
    // If it's a full-field image, only render the image
    if (field.type === 'image' && field.imageFullField) {
      return <ImageField field={field} />;
    }

    switch (field.type) {
      case 'text':
        return (
          <Form.Item
            label={field.label}
            required={field.required}
            help={field.description}
            className="form-preview-item"
          >
            {renderFieldImage(field)}
            <Input
              placeholder={field.placeholder}
              defaultValue={field.defaultValue}
              disabled={readOnly}
            />
          </Form.Item>
        );
      case 'textarea':
        return (
          <Form.Item
            label={field.label}
            required={field.required}
            help={field.description}
            className="form-preview-item"
          >
            {renderFieldImage(field)}
            <Input.TextArea
              placeholder={field.placeholder}
              defaultValue={field.defaultValue}
              rows={4}
              disabled={readOnly}
            />
          </Form.Item>
        );
      case 'number':
        return (
          <Form.Item
            label={field.label}
            required={field.required}
            help={field.description}
            className="form-preview-item"
          >
            {renderFieldImage(field)}
            <Input
              type="number"
              placeholder={field.placeholder}
              defaultValue={field.defaultValue}
              min={field.min}
              max={field.max}
              step={field.step}
              disabled={readOnly}
            />
          </Form.Item>
        );
      case 'checkbox':
        return (
          <Form.Item
            label={field.label}
            required={field.required}
            help={field.description}
            className="form-preview-item"
          >
            {renderFieldImage(field)}
            <Checkbox.Group disabled={readOnly}>
              {field.options?.map((option, index) => (
                <Checkbox key={index} value={option.value}>
                  {option.label}
                </Checkbox>
              )) || (
                <>
                  <Checkbox value="option1">Option 1</Checkbox>
                  <Checkbox value="option2">Option 2</Checkbox>
                  <Checkbox value="option3">Option 3</Checkbox>
                </>
              )}
            </Checkbox.Group>
          </Form.Item>
        );
      case 'radio':
        return (
          <Form.Item
            label={field.label}
            required={field.required}
            help={field.description}
            className="form-preview-item"
          >
            {renderFieldImage(field)}
            <Radio.Group disabled={readOnly}>
              {field.options?.map((option, index) => (
                <Radio key={index} value={option.value}>
                  {option.label}
                </Radio>
              )) || (
                <>
                  <Radio value="option1">Option 1</Radio>
                  <Radio value="option2">Option 2</Radio>
                  <Radio value="option3">Option 3</Radio>
                </>
              )}
            </Radio.Group>
          </Form.Item>
        );
      case 'select':
        return (
          <Form.Item
            label={field.label}
            required={field.required}
            help={field.description}
            className="form-preview-item"
          >
            {renderFieldImage(field)}
            <Select
              placeholder={field.placeholder}
              defaultValue={field.defaultValue}
              style={{ width: '100%' }}
              disabled={readOnly}
            >
              {field.options?.map((option, index) => (
                <Select.Option key={index} value={option.value}>
                  {option.label}
                </Select.Option>
              )) || (
                <>
                  <Select.Option value="option1">Option 1</Select.Option>
                  <Select.Option value="option2">Option 2</Select.Option>
                  <Select.Option value="option3">Option 3</Select.Option>
                </>
              )}
            </Select>
          </Form.Item>
        );
      case 'date':
        return (
          <Form.Item
            label={field.label}
            required={field.required}
            help={field.description}
            className="form-preview-item"
          >
            {renderFieldImage(field)}
            <DatePicker style={{ width: '100%' }} disabled={readOnly} />
          </Form.Item>
        );
      case 'time':
        return (
          <Form.Item
            label={field.label}
            required={field.required}
            help={field.description}
            className="form-preview-item"
          >
            {renderFieldImage(field)}
            <TimePicker style={{ width: '100%' }} disabled={readOnly} />
          </Form.Item>
        );
      case 'email':
        return (
          <Form.Item
            label={field.label}
            required={field.required}
            help={field.description}
            className="form-preview-item"
          >
            {renderFieldImage(field)}
            <Input
              type="email"
              placeholder={field.placeholder || 'Enter email'}
              defaultValue={field.defaultValue}
              disabled={readOnly}
            />
          </Form.Item>
        );
      case 'phone':
        return (
          <Form.Item
            label={field.label}
            required={field.required}
            help={field.description}
            className="form-preview-item"
          >
            {renderFieldImage(field)}
            <Input
              placeholder={field.placeholder || 'Enter phone number'}
              defaultValue={field.defaultValue}
              disabled={readOnly}
            />
          </Form.Item>
        );
      case 'url':
        return (
          <Form.Item
            label={field.label}
            required={field.required}
            help={field.description}
            className="form-preview-item"
          >
            {renderFieldImage(field)}
            <Input
              placeholder={field.placeholder || 'Enter URL'}
              defaultValue={field.defaultValue}
              disabled={readOnly}
            />
          </Form.Item>
        );
      case 'file':
        return (
          <Form.Item
            label={field.label}
            required={field.required}
            help={field.description}
            className="form-preview-item"
          >
            {renderFieldImage(field)}
            <Upload disabled={readOnly}>
              <Button icon={<UploadOutlined />} disabled={readOnly}>
                Click to Upload
              </Button>
            </Upload>
          </Form.Item>
        );
      case 'image':
        return (
          <Form.Item
            label={field.label}
            help={field.description}
            className="form-preview-item"
          >
            <ImageField field={field} />
          </Form.Item>
        );
      case 'heading':
        const HeadingTag = (field.headingLevel || 'h2') as keyof JSX.IntrinsicElements;
        return (
          <div className="form-preview-heading">
            {renderFieldImage(field)}
            <HeadingTag>{field.label}</HeadingTag>
          </div>
        );
      case 'paragraph':
        return (
          <div className="form-preview-paragraph">
            {renderFieldImage(field)}
            <p>{field.label}</p>
          </div>
        );
      case 'divider':
        return (
          <div className="form-preview-divider">
            {renderFieldImage(field)}
            <Divider />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="form-preview">
      <Form layout="vertical">
        {fields.map((field, index) => (
          <div key={index} className="form-preview-field">
            {renderField(field)}
          </div>
        ))}
      </Form>
    </div>
  );
}; 
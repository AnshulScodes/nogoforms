import React from 'react';
import { FormBlockType } from './FormBlockSDK';
import { Input, Checkbox, Radio, Select, DatePicker, TimePicker, Upload, Divider, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import './FieldPreviewCard.css';

interface FieldPreviewCardProps {
  fieldType: FormBlockType;
}

export const FieldPreviewCard: React.FC<FieldPreviewCardProps> = ({ fieldType }) => {
  const renderPreview = () => {
    switch (fieldType) {
      case 'text':
        return (
          <div className="preview-content">
            <label>Text Field</label>
            <Input placeholder="Enter text" />
          </div>
        );
      case 'textarea':
        return (
          <div className="preview-content">
            <label>Text Area</label>
            <Input.TextArea rows={3} placeholder="Enter multiple lines of text" />
          </div>
        );
      case 'number':
        return (
          <div className="preview-content">
            <label>Number Field</label>
            <Input type="number" placeholder="123" />
          </div>
        );
      case 'checkbox':
        return (
          <div className="preview-content">
            <label>Checkbox Group</label>
            <div>
              <Checkbox>Option 1</Checkbox>
              <Checkbox>Option 2</Checkbox>
              <Checkbox>Option 3</Checkbox>
            </div>
          </div>
        );
      case 'radio':
        return (
          <div className="preview-content">
            <label>Radio Group</label>
            <Radio.Group>
              <Radio value={1}>Option 1</Radio>
              <Radio value={2}>Option 2</Radio>
              <Radio value={3}>Option 3</Radio>
            </Radio.Group>
          </div>
        );
      case 'select':
        return (
          <div className="preview-content">
            <label>Dropdown</label>
            <Select
              placeholder="Select an option"
              options={[
                { value: '1', label: 'Option 1' },
                { value: '2', label: 'Option 2' },
                { value: '3', label: 'Option 3' },
              ]}
              style={{ width: '100%' }}
            />
          </div>
        );
      case 'date':
        return (
          <div className="preview-content">
            <label>Date Picker</label>
            <DatePicker style={{ width: '100%' }} />
          </div>
        );
      case 'time':
        return (
          <div className="preview-content">
            <label>Time Picker</label>
            <TimePicker style={{ width: '100%' }} />
          </div>
        );
      case 'email':
        return (
          <div className="preview-content">
            <label>Email Field</label>
            <Input placeholder="example@email.com" />
          </div>
        );
      case 'phone':
        return (
          <div className="preview-content">
            <label>Phone Field</label>
            <Input placeholder="(123) 456-7890" />
          </div>
        );
      case 'url':
        return (
          <div className="preview-content">
            <label>URL Field</label>
            <Input placeholder="https://example.com" />
          </div>
        );
      case 'file':
        return (
          <div className="preview-content">
            <label>File Upload</label>
            <Upload>
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </div>
        );
      case 'image':
        return (
          <div className="preview-content">
            <label>Image</label>
            <div className="image-preview-placeholder">
              <div className="image-preview-content">
                <div className="image-icon">🖼️</div>
                <div className="image-preview-text">
                  <div>Image Display</div>
                  <small>Supports JPG, PNG, GIF, SVG</small>
                </div>
              </div>
            </div>
          </div>
        );
      case 'heading':
        return (
          <div className="preview-content">
            <h3>Heading Example</h3>
          </div>
        );
      case 'paragraph':
        return (
          <div className="preview-content">
            <p>This is an example paragraph text that would appear in your form.</p>
          </div>
        );
      case 'divider':
        return (
          <div className="preview-content">
            <Divider />
          </div>
        );
      default:
        return <div>No preview available</div>;
    }
  };

  return (
    <div className="field-preview-card">
      <h4>Preview: {fieldType.charAt(0).toUpperCase() + fieldType.slice(1)}</h4>
      {renderPreview()}
    </div>
  );
}; 
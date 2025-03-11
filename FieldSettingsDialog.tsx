import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Switch, Select, Button, Tabs, Upload, message, Space, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined, InfoCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { FormBlockConfig, FormBlockType } from './FormBlockSDK';
import './FieldSettingsDialog.css';

const { TabPane } = Tabs;

interface FieldSettingsDialogProps {
  visible: boolean;
  field: FormBlockConfig | null;
  onClose: () => void;
  onSave: (field: FormBlockConfig) => void;
}

export const FieldSettingsDialog: React.FC<FieldSettingsDialogProps> = ({
  visible,
  field,
  onClose,
  onSave,
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('basic');
  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFullField, setImageFullField] = useState(false);

  useEffect(() => {
    if (field) {
      form.setFieldsValue({
        ...field,
        required: field.required || false,
        placeholder: field.placeholder || '',
        defaultValue: field.defaultValue || '',
        description: field.description || '',
        minLength: field.minLength || '',
        maxLength: field.maxLength || '',
        min: field.min || '',
        max: field.max || '',
        step: field.step || '',
        imageUrl: field.imageUrl || '',
        imageWidth: field.imageWidth || 300,
        imageHeight: field.imageHeight || 200,
        imageFullField: field.imageFullField || false,
        imageAlt: field.imageAlt || '',
        imageAlignment: field.imageAlignment || 'center',
        imageBorderRadius: field.imageBorderRadius || 0,
        imageBorder: field.imageBorder || false,
        imageCaption: field.imageCaption || '',
      });

      // Set options for select, checkbox, radio
      if (field.options) {
        setOptions(field.options);
      } else {
        setOptions([]);
      }

      // Set image preview
      if (field.imageUrl) {
        setImagePreview(field.imageUrl);
      } else {
        setImagePreview(null);
      }

      setImageFullField(field.imageFullField || false);
    }
  }, [field, form]);

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (field) {
        const updatedField: FormBlockConfig = {
          ...field,
          ...values,
          options: ['select', 'checkbox', 'radio'].includes(field.type) ? options : undefined,
        };
        onSave(updatedField);
      }
    });
  };

  const addOption = () => {
    const newOption = { label: `Option ${options.length + 1}`, value: `option-${options.length + 1}` };
    setOptions([...options, newOption]);
  };

  const removeOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const moveOption = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === options.length - 1)
    ) {
      return;
    }

    const newOptions = [...options];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newOptions[index];
    newOptions[index] = newOptions[targetIndex];
    newOptions[targetIndex] = temp;
    setOptions(newOptions);
  };

  const updateOption = (index: number, key: 'label' | 'value', value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [key]: value };
    setOptions(newOptions);
  };

  const handleImageUpload = (info: any) => {
    if (info.file.status === 'done') {
      // This is a mock implementation. In a real app, you'd upload to a server
      // and get back a URL. Here we're just using a FileReader to get a data URL.
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setImagePreview(imageUrl);
        form.setFieldsValue({ imageUrl });
      };
      reader.readAsDataURL(info.file.originFileObj);
      message.success(`${info.file.name} uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} upload failed.`);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImagePreview(url);
  };

  const handleImageFullFieldChange = (checked: boolean) => {
    setImageFullField(checked);
  };

  const renderBasicSettings = () => (
    <div>
      <Form.Item
        name="label"
        label="Field Label"
        rules={[{ required: true, message: 'Please enter a field label' }]}
      >
        <Input placeholder="Enter field label" />
      </Form.Item>

      {field?.type !== 'heading' && field?.type !== 'paragraph' && field?.type !== 'divider' && field?.type !== 'image' && (
        <>
          <Form.Item name="required" label="Required" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="description" label="Help Text">
            <Input.TextArea
              placeholder="Enter help text to display below the field"
              rows={2}
            />
          </Form.Item>
        </>
      )}

      {['text', 'textarea', 'email', 'url', 'phone'].includes(field?.type || '') && (
        <Form.Item name="placeholder" label="Placeholder">
          <Input placeholder="Enter placeholder text" />
        </Form.Item>
      )}

      {['select'].includes(field?.type || '') && (
        <Form.Item name="placeholder" label="Placeholder">
          <Input placeholder="Enter placeholder text" />
        </Form.Item>
      )}

      {['text', 'textarea', 'email', 'url', 'phone', 'select', 'radio', 'checkbox'].includes(
        field?.type || ''
      ) && (
        <Form.Item name="defaultValue" label="Default Value">
          <Input placeholder="Enter default value" />
        </Form.Item>
      )}
    </div>
  );

  const renderAdvancedSettings = () => (
    <div>
      {['text', 'textarea', 'email', 'url', 'phone'].includes(field?.type || '') && (
        <>
          <Form.Item name="minLength" label="Minimum Length">
            <Input type="number" placeholder="Minimum characters" />
          </Form.Item>
          <Form.Item name="maxLength" label="Maximum Length">
            <Input type="number" placeholder="Maximum characters" />
          </Form.Item>
        </>
      )}

      {['number'].includes(field?.type || '') && (
        <>
          <Form.Item name="min" label="Minimum Value">
            <Input type="number" placeholder="Minimum value" />
          </Form.Item>
          <Form.Item name="max" label="Maximum Value">
            <Input type="number" placeholder="Maximum value" />
          </Form.Item>
          <Form.Item name="step" label="Step">
            <Input type="number" placeholder="Step value" />
          </Form.Item>
        </>
      )}

      {['heading'].includes(field?.type || '') && (
        <Form.Item name="headingLevel" label="Heading Level">
          <Select>
            <Select.Option value="h1">H1 - Main Heading</Select.Option>
            <Select.Option value="h2">H2 - Section Heading</Select.Option>
            <Select.Option value="h3">H3 - Subsection Heading</Select.Option>
            <Select.Option value="h4">H4 - Minor Heading</Select.Option>
          </Select>
        </Form.Item>
      )}
    </div>
  );

  const renderOptionsSettings = () => (
    <div className="options-settings">
      <div className="options-header">
        <h4>Options</h4>
        <Button type="primary" icon={<PlusOutlined />} onClick={addOption}>
          Add Option
        </Button>
      </div>

      {options.length === 0 && (
        <div className="no-options-message">
          No options added yet. Click "Add Option" to create your first option.
        </div>
      )}

      {options.map((option, index) => (
        <div key={index} className="option-item">
          <div className="option-inputs">
            <Input
              placeholder="Option Label"
              value={option.label}
              onChange={(e) => updateOption(index, 'label', e.target.value)}
              className="option-label-input"
            />
            <Input
              placeholder="Option Value"
              value={option.value}
              onChange={(e) => updateOption(index, 'value', e.target.value)}
              className="option-value-input"
            />
          </div>
          <div className="option-actions">
            <Button
              icon={<ArrowUpOutlined />}
              disabled={index === 0}
              onClick={() => moveOption(index, 'up')}
              size="small"
            />
            <Button
              icon={<ArrowDownOutlined />}
              disabled={index === options.length - 1}
              onClick={() => moveOption(index, 'down')}
              size="small"
            />
            <Button
              icon={<DeleteOutlined />}
              onClick={() => removeOption(index)}
              size="small"
              danger
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderImageSettings = () => (
    <div className="image-settings">
      <Form.Item name="imageUrl" label="Image URL">
        <Input 
          placeholder="Enter image URL" 
          onChange={handleImageUrlChange}
          suffix={
            <Tooltip title="Enter a direct URL to an image">
              <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
            </Tooltip>
          }
        />
      </Form.Item>

      <div className="image-upload-section">
        <Upload
          name="image"
          listType="picture-card"
          className="image-uploader"
          showUploadList={false}
          action="https://www.mocky.io/v2/5cc8019d300000980a055e76" // Replace with your actual upload endpoint
          onChange={handleImageUpload}
          accept="image/*"
          beforeUpload={(file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
              message.error('You can only upload image files!');
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
              message.error('Image must be smaller than 2MB!');
            }
            return isImage && isLt2M;
          }}
        >
          {imagePreview ? (
            <div className="image-preview-wrapper">
              <img src={imagePreview} alt="Preview" style={{ width: '100%' }} />
              <div className="image-preview-overlay">
                <PlusOutlined />
                <div>Change</div>
              </div>
            </div>
          ) : (
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          )}
        </Upload>
        <div className="upload-instructions">
          <h4>Upload an Image</h4>
          <p>Click the box to upload an image or enter a URL above.</p>
          <p>Supported formats: JPG, PNG, GIF, SVG</p>
          <p>Maximum size: 2MB</p>
        </div>
      </div>

      <Form.Item name="imageAlt" label="Alt Text (Accessibility)">
        <Input 
          placeholder="Describe the image for screen readers" 
          suffix={
            <Tooltip title="Helps make your form accessible to people using screen readers">
              <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
            </Tooltip>
          }
        />
      </Form.Item>

      <Form.Item name="imageFullField" label="Image Display Mode">
        <Select 
          defaultValue={imageFullField ? "full" : "inline"}
          onChange={(value) => handleImageFullFieldChange(value === "full")}
        >
          <Select.Option value="inline">Inline with content</Select.Option>
          <Select.Option value="full">Full field (image only)</Select.Option>
        </Select>
      </Form.Item>

      {!imageFullField && (
        <>
          <Form.Item name="imageWidth" label="Image Width">
            <Input 
              type="number" 
              placeholder="Width in pixels" 
              addonAfter="px"
              min={50}
              max={2000}
            />
          </Form.Item>

          <Form.Item name="imageHeight" label="Image Height">
            <Input 
              type="number" 
              placeholder="Height in pixels" 
              addonAfter="px"
              min={50}
              max={2000}
            />
          </Form.Item>

          <Form.Item name="imageAlignment" label="Image Alignment">
            <Select defaultValue="center">
              <Select.Option value="left">Left</Select.Option>
              <Select.Option value="center">Center</Select.Option>
              <Select.Option value="right">Right</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="imageBorderRadius" label="Border Radius">
            <Input 
              type="number" 
              placeholder="Rounded corners" 
              addonAfter="px"
              min={0}
              max={50}
            />
          </Form.Item>

          <Form.Item name="imageBorder" label="Border" valuePropName="checked">
            <Switch />
          </Form.Item>
        </>
      )}

      <Form.Item name="imageCaption" label="Caption">
        <Input.TextArea 
          placeholder="Add a caption below the image (optional)" 
          rows={2}
        />
      </Form.Item>
    </div>
  );

  return (
    <Modal
      title={`Edit ${field?.type?.charAt(0).toUpperCase()}${field?.type?.slice(1)} Field`}
      open={visible}
      onCancel={onClose}
      onOk={handleSave}
      width={700}
      className="field-settings-dialog"
    >
      <Form form={form} layout="vertical">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Basic" key="basic">
            {renderBasicSettings()}
          </TabPane>
          
          <TabPane tab="Advanced" key="advanced">
            {renderAdvancedSettings()}
          </TabPane>
          
          {['select', 'checkbox', 'radio'].includes(field?.type || '') && (
            <TabPane tab="Options" key="options">
              {renderOptionsSettings()}
            </TabPane>
          )}
          
          {field?.type === 'image' && (
            <TabPane tab="Image" key="image">
              {renderImageSettings()}
            </TabPane>
          )}
        </Tabs>
      </Form>
    </Modal>
  );
}; 
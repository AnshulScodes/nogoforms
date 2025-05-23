import { useState, useRef, useEffect } from 'react';
import { FormBlockConfig, FormBlockType, createDefaultField } from './FormBlockSDK';
import { Dropdown, Button, Input, Checkbox, Empty, Tooltip } from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  SettingOutlined, 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  DragOutlined,
  InfoCircleOutlined,
  LayoutOutlined
} from '@ant-design/icons';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FormPreview } from './FormPreview';
import './FormBuilder.css';
import { FieldSettingsDialog } from './FieldSettingsDialog';
import { FieldPreviewCard } from './FieldPreviewCard';
import GridLayout from '../components/form-builder/GridLayout';

interface FormBuilderProps {
  initialConfig: FormBlockConfig[];
  onChange: (fields: FormBlockConfig[]) => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const DND_ITEM_TYPE = 'form-field';

const FormField = ({ 
  field, 
  index, 
  moveField, 
  onEdit, 
  onDelete, 
  onMoveUp, 
  onMoveDown,
  fieldsCount
}: { 
  field: FormBlockConfig; 
  index: number; 
  moveField: (dragIndex: number, hoverIndex: number) => void; 
  onEdit: () => void; 
  onDelete: () => void; 
  onMoveUp: () => void; 
  onMoveDown: () => void;
  fieldsCount: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: DND_ITEM_TYPE,
    item: { type: DND_ITEM_TYPE, id: field.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  const [{ isOver }, drop] = useDrop({
    accept: DND_ITEM_TYPE,
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      
      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;
      
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      
      // Time to actually perform the action
      moveField(dragIndex, hoverIndex);
      
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });
  
  drag(drop(ref));
  
  return (
    <div 
      ref={ref} 
      className={`form-field ${isDragging ? 'dragging' : ''} ${isOver ? 'drop-target' : ''}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="field-header">
        <div className="field-title-container">
          <Tooltip title="Drag to reorder">
            <div className="drag-handle">
              <DragOutlined />
            </div>
          </Tooltip>
          <div className="field-title">{field.label}</div>
          <div className="field-type-badge">{field.type}</div>
        </div>
        <div className="field-actions">
          <Tooltip title="Move Up">
            <Button 
              icon={<ArrowUpOutlined />} 
              size="small"
              onClick={onMoveUp}
              disabled={index === 0}
            />
          </Tooltip>
          <Tooltip title="Move Down">
            <Button 
              icon={<ArrowDownOutlined />} 
              size="small"
              onClick={onMoveDown}
              disabled={index === fieldsCount - 1}
            />
          </Tooltip>
          <Tooltip title="Edit Field">
            <Button 
              icon={<SettingOutlined />} 
              size="small"
              onClick={onEdit}
            />
          </Tooltip>
          <Tooltip title="Delete Field">
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              danger
              onClick={onDelete}
            />
          </Tooltip>
        </div>
      </div>
      <div className="field-content">
        <FormPreview fields={[field]} readOnly />
      </div>
    </div>
  );
};

const FormBuilder = ({ initialConfig, onChange }: FormBuilderProps) => {
  const [fields, setFields] = useState<FormBlockConfig[]>(initialConfig || []);
  const [editingField, setEditingField] = useState<FormBlockConfig | null>(null);
  const [isSettingsDialogVisible, setIsSettingsDialogVisible] = useState(false);
  
  // Add state for hover preview
  const [hoveredFieldType, setHoveredFieldType] = useState<FormBlockType | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  
  // Add state for layout mode
  const [useGridLayout, setUseGridLayout] = useState(true);
  const gridLayoutRef = useRef<{ addRow: (template?: string) => void; deleteRow: (rowIndex: number) => void } | null>(null);
  
  useEffect(() => {
    onChange(fields);
  }, [fields, onChange]);
  
  const addField = (type: FormBlockType) => {
    const newField = createDefaultField(type);
    setFields([...fields, newField]);
    setDropdownVisible(false);
  };
  
  const addFieldToGrid = (type: FormBlockType, rowIndex: number, colIndex: number) => {
    const newField = createDefaultField(type);
    // Add grid position information
    newField.rowIndex = rowIndex;
    newField.colIndex = colIndex;
    setFields([...fields, newField]);
  };
  
  const deleteField = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
  };
  
  const deleteFieldById = (id: string) => {
    const newFields = fields.filter(field => field.id !== id);
    setFields(newFields);
  };
  
  const editField = (index: number) => {
    setEditingField(fields[index]);
    setIsSettingsDialogVisible(true);
  };
  
  const editFieldById = (id: string) => {
    const field = fields.find(f => f.id === id);
    if (field) {
      setEditingField(field);
      setIsSettingsDialogVisible(true);
    }
  };
  
  const handleFieldUpdate = (updatedField: FormBlockConfig) => {
    const newFields = fields.map((field) =>
      field.id === updatedField.id ? updatedField : field
    );
    setFields(newFields);
    setIsSettingsDialogVisible(false);
    setEditingField(null);
  };
  
  const updateFieldById = (id: string, updates: Partial<FormBlockConfig>) => {
    const newFields = fields.map((field) =>
      field.id === id ? { ...field, ...updates } : field
    );
    setFields(newFields);
  };
  
  const moveField = (dragIndex: number, hoverIndex: number) => {
    const dragField = fields[dragIndex];
    const newFields = [...fields];
    newFields.splice(dragIndex, 1);
    newFields.splice(hoverIndex, 0, dragField);
    setFields(newFields);
  };
  
  const moveFieldUp = (index: number) => {
    if (index === 0) return;
    moveField(index, index - 1);
  };
  
  const moveFieldDown = (index: number) => {
    if (index === fields.length - 1) return;
    moveField(index, index + 1);
  };
  
  const handleFieldTypeHover = (fieldType: FormBlockType) => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Set a timeout to show the preview after 200ms
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredFieldType(fieldType);
    }, 200);
  };
  
  const handleFieldTypeHoverEnd = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredFieldType(null);
  };
  
  const addGridRow = (template: string = "1-column") => {
    if (gridLayoutRef.current) {
      gridLayoutRef.current.addRow(template);
    }
  };
  
  const deleteGridRow = (rowIndex: number) => {
    if (gridLayoutRef.current) {
      // First, remove all fields in this row
      const newFields = fields.filter(field => field.rowIndex !== rowIndex);
      
      // Then, update rowIndex for all fields in rows after this one
      const updatedFields = newFields.map(field => {
        if (field.rowIndex !== undefined && field.rowIndex > rowIndex) {
          return { ...field, rowIndex: field.rowIndex - 1 };
        }
        return field;
      });
      
      setFields(updatedFields);
      gridLayoutRef.current.deleteRow(rowIndex);
    }
  };
  
  const handleReorderElements = (reorderedElements: FormBlockConfig[]) => {
    setFields(reorderedElements);
  };
  
  // Field type options with enhanced hover behavior
  const fieldTypeItems = [
    { key: 'text', value: 'text', label: 'Text Field' },
    { key: 'textarea', value: 'textarea', label: 'Text Area' },
    { key: 'number', value: 'number', label: 'Number' },
    { key: 'checkbox', value: 'checkbox', label: 'Checkbox' },
    { key: 'radio', value: 'radio', label: 'Radio Button' },
    { key: 'select', value: 'select', label: 'Dropdown' },
    { key: 'date', value: 'date', label: 'Date' },
    { key: 'time', value: 'time', label: 'Time' },
    { key: 'email', value: 'email', label: 'Email' },
    { key: 'phone', value: 'phone', label: 'Phone' },
    { key: 'url', value: 'url', label: 'URL' },
    { key: 'file', value: 'file', label: 'File Upload' },
    { key: 'image', value: 'image', label: 'Image' },
    { key: 'heading', value: 'heading', label: 'Heading' },
    { key: 'paragraph', value: 'paragraph', label: 'Paragraph' },
    { key: 'divider', value: 'divider', label: 'Divider' },
  ];
  
  const fieldTypeOptions = fieldTypeItems.map(option => ({
    key: option.key,
    label: (
      <div 
        className="field-type-option"
        onMouseEnter={() => handleFieldTypeHover(option.value as FormBlockType)}
        onMouseLeave={handleFieldTypeHoverEnd}
      >
        {option.label}
      </div>
    )
  }));
  
  // Group field types for the grid layout
  const fieldGroups = {
    "Basic Fields": ["text", "textarea", "number", "email", "phone", "url"],
    "Choice Fields": ["checkbox", "radio", "select"],
    "Date & Time": ["date", "time"],
    "File Uploads": ["file"],
    "Layout Elements": ["image", "heading", "paragraph", "divider"]
  };
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="form-builder">
        <div className="form-builder-header">
          <h2>Form Builder</h2>
          <div className="form-builder-actions">
            <Tooltip title={useGridLayout ? "Switch to List Layout" : "Switch to Grid Layout"}>
              <Button 
                icon={<LayoutOutlined />}
                onClick={() => setUseGridLayout(!useGridLayout)}
                className="layout-toggle-btn"
              >
                {useGridLayout ? "List View" : "Grid View"}
              </Button>
            </Tooltip>
            
            {useGridLayout && (
              <Button 
                type="primary" 
                onClick={() => addGridRow()}
                className="add-row-btn"
              >
                Add Row
              </Button>
            )}
            
            {!useGridLayout && (
              <Dropdown
                menu={{
                  items: fieldTypeOptions,
                  onClick: ({ key }) => addField(key as FormBlockType),
                }}
                trigger={['click']}
                placement="bottomRight"
                getPopupContainer={(trigger) => trigger.parentElement || document.body}
                dropdownRender={(menu) => (
                  <div className="field-type-dropdown">
                    <div className="field-type-dropdown-header">
                      <h4>Select Field Type</h4>
                      <p>Hover over a field type to see a preview</p>
                    </div>
                    {menu}
                    {hoveredFieldType && (
                      <div className="field-preview-container">
                        <FieldPreviewCard fieldType={hoveredFieldType} />
                      </div>
                    )}
                  </div>
                )}
                open={dropdownVisible}
                onOpenChange={setDropdownVisible}
              >
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setDropdownVisible(true)}
                  size="large"
                >
                  Add Field
                </Button>
              </Dropdown>
            )}
          </div>
        </div>
        
        {useGridLayout ? (
          <div className="grid-layout-container">
            <GridLayout
              ref={gridLayoutRef}
              elements={fields}
              onAddElement={addFieldToGrid}
              onDeleteRow={deleteGridRow}
              onUpdateElement={updateFieldById}
              onDeleteElement={deleteFieldById}
              fieldGroups={fieldGroups}
              onReorderElements={handleReorderElements}
            />
          </div>
        ) : (
          <div className="form-fields-container">
            <div className="form-fields">
              {fields.length === 0 ? (
                <Empty
                  description="No fields added yet. Click 'Add Field' to start building your form."
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  className="empty-form-message"
                />
              ) : (
                fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    field={field}
                    index={index}
                    moveField={moveField}
                    onEdit={() => editField(index)}
                    onDelete={() => deleteField(index)}
                    onMoveUp={() => moveFieldUp(index)}
                    onMoveDown={() => moveFieldDown(index)}
                    fieldsCount={fields.length}
                  />
                ))
              )}
            </div>
          </div>
        )}
        
        <FieldSettingsDialog
          visible={isSettingsDialogVisible}
          field={editingField}
          onClose={() => setIsSettingsDialogVisible(false)}
          onSave={handleFieldUpdate}
        />
      </div>
    </DndProvider>
  );
};

export default FormBuilder; 
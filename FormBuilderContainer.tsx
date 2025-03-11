import React from 'react';
import FormBuilder from './FormBuilder';
import { FormBlockConfig } from './FormBlockSDK';
import './FormBuilderContainer.css';

interface FormBuilderContainerProps {
  initialConfig: FormBlockConfig[];
  onChange: (fields: FormBlockConfig[]) => void;
}

const FormBuilderContainer: React.FC<FormBuilderContainerProps> = ({ initialConfig, onChange }) => {
  return (
    <div className="form-builder-container">
      <div className="form-builder-wrapper">
        <FormBuilder initialConfig={initialConfig} onChange={onChange} />
      </div>
    </div>
  );
};

export default FormBuilderContainer; 
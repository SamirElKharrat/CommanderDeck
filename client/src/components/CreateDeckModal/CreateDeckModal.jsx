import { Modal, Form, Input, Select, Button } from 'antd';
import { CrownOutlined } from '@ant-design/icons';
import { BUDGET_INFO } from '../../data/mockData';
import './CreateDeckModal.css';

export default function CreateDeckModal({ open, onClose, onSubmit, onRecommend }) {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSubmit(values);
      form.resetFields();
    });
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const budgetOptions = Object.entries(BUDGET_INFO).map(([key, info]) => ({
    value: key,
    label: (
      <div className="create-deck-modal__bracket-option">
        <span className="create-deck-modal__bracket-label">{info.label}</span>
        <span className="create-deck-modal__bracket-desc">{info.description}</span>
      </div>
    ),
  }));

  return (
    <Modal
      title={
        <span>
          <CrownOutlined style={{ color: '#d4a537', marginRight: 8 }} />
          Crear Nuevo Mazo
        </span>
      }
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Crear Mazo"
      cancelText="Cancelar"
      className="create-deck-modal"
      width={480}
      destroyOnClose
      id="create-deck-modal"
    >
      <Form
        form={form}
        layout="vertical"
        className="create-deck-modal__form"
        id="create-deck-form"
      >
        <Form.Item
          name="commander"
          label="Comandante"
          rules={[{ required: true, message: 'Introduce el nombre del comandante' }]}
        >
          <Input
            placeholder="Ej: Atraxa, Praetors' Voice"
            size="large"
            id="commander-input"
          />
        </Form.Item>

        <div style={{ marginBottom: 24, padding: '12px 16px', background: 'rgba(212, 165, 55, 0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(212, 165, 55, 0.3)' }}>
          <span style={{ fontSize: 13, color: '#e8e6f0' }}>
            ¿No sabes qué comandante elegir? Deja que te recomiende algunos.
          </span>
          <Button
            type="primary"
            size="small"
            onClick={onRecommend}
            style={{ background: '#d4a537', color: '#0d0f1a', fontWeight: 600, border: 'none' }}
          >
            Recomiéndame
          </Button>
        </div>

        <Form.Item
          name="budget"
          label="Presupuesto"
          rules={[{ required: true, message: 'Selecciona un presupuesto' }]}
        >
          <Select
            placeholder="Selecciona el presupuesto del mazo"
            size="large"
            options={budgetOptions}
            id="budget-select"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

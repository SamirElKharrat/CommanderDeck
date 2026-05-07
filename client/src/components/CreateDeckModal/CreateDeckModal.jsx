import { Modal, Form, Input, Select, Button } from 'antd';
import { CrownOutlined } from '@ant-design/icons';
import './CreateDeckModal.css';

const BUDGET_OPTIONS = [
  { value: 'budget', label: 'Budget — Económico, cartas accesibles' },
  { value: 'expensive', label: 'Expensive — Sin límite de precio' },
];

export default function CreateDeckModal({ open, onClose, onSubmit, onRecommend, loading }) {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSubmit(values);
      // form.resetFields(); // Don't reset yet in case of error
    });
  };

  const handleCancel = () => {
    if (loading) return;
    form.resetFields();
    onClose();
  };

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
      confirmLoading={loading}
      okText={loading ? 'Creando...' : 'Crear Mazo'}
      cancelText="Cancelar"
      className="create-deck-modal"
      width={480}
      destroyOnClose
      id="create-deck-modal"
      maskClosable={!loading}
      closable={!loading}
      cancelButtonProps={{ disabled: loading }}
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
            style={{ background: '#d4a537', color: '#0d0f1a', fontWeight: 600, border: 'none', flexShrink: 0, marginLeft: 12 }}
          >
            Recomiéndame
          </Button>
        </div>

        <Form.Item
          name="budget"
          label="Presupuesto"
          initialValue="budget"
          rules={[{ required: true, message: 'Selecciona un presupuesto' }]}
        >
          <Select
            placeholder="Selecciona el presupuesto del mazo"
            size="large"
            options={BUDGET_OPTIONS}
            id="budget-select"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

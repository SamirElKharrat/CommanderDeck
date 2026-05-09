import { Modal, Form, Input, Select, Button, Spin, Radio, Alert } from 'antd';
import { CrownOutlined, RobotOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { sendChatMessage } from '../../api/chat';
import './CreateDeckModal.css';

const BUDGET_OPTIONS = [
  { value: 'budget', label: 'Budget — Económico, cartas accesibles' },
  { value: 'expensive', label: 'Expensive — Sin límite de precio' },
];

export default function CreateDeckModal({ open, onClose, onSubmit, loading }) {
  const [form] = Form.useForm();
  const [recsLoading, setRecsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSubmit(values);
      // form.resetFields(); // Don't reset yet in case of error
    });
  };

  const handleCancel = () => {
    if (loading) return;
    form.resetFields();
    setRecommendations([]);
    onClose();
  };

  const handleRecommend = async () => {
    setRecsLoading(true);
    setRecommendations([]);
    try {
      const prompt = `Recomiendame 5 comandantes. Solo enseña los que son reales. Comprueba cuales son reales com la herramientas cards_check. Devuelve tu respuesta ÚNICAMENTE como un array JSON válido con objetos que tengan 'name' (nombre del comandante exacto) y 'description' (descripción muy breve de su estilo de juego). No uses backticks ni bloques de código ni markdown. Solo el JSON. Ejemplo: [{"name": "Atraxa, Praetors' Voice", "description": "Counters"}]`;
      const result = await sendChatMessage(prompt);

      let text = result.response.trim();
      if (text.startsWith('```json')) text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      else if (text.startsWith('```')) text = text.replace(/```/g, '').trim();

      let data = JSON.parse(text);
      if (!Array.isArray(data)) {
        data = data.comandantes || data.commanders || Object.values(data)[0] || [];
      }
      setRecommendations(data.slice(0, 3));
    } catch (e) {
      console.error(e);
      setRecommendations([{ name: "Error", description: "No se pudieron obtener recomendaciones, intenta de nuevo." }]);
    } finally {
      setRecsLoading(false);
    }
  };

  const handleSelectRecommendation = (e) => {
    const name = e.target.value;
    if (name !== 'Error') {
      form.setFieldsValue({ commander: name });
    }
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

        <div style={{ marginBottom: 24, padding: '12px 16px', background: 'rgba(212, 165, 55, 0.1)', borderRadius: 8, display: 'flex', flexDirection: 'column', border: '1px solid rgba(212, 165, 55, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#e8e6f0' }}>
              ¿No sabes qué comandante elegir? Deja que te recomiende algunos.
            </span>
            <Button
              type="primary"
              size="small"
              onClick={handleRecommend}
              loading={recsLoading}
              icon={<RobotOutlined />}
              style={{ background: '#d4a537', color: '#0d0f1a', fontWeight: 600, border: 'none', flexShrink: 0, marginLeft: 12 }}
            >
              {recsLoading ? 'Consultando...' : 'Recomiéndame'}
            </Button>
          </div>

          {recommendations.length > 0 && (
            <div style={{ marginTop: 16 }}>
              {recommendations[0].name === "Error" ? (
                <Alert type="error" message={recommendations[0].description} showIcon />
              ) : (
                <Form.Item name="selectedRecommendation" noStyle>
                  <Radio.Group onChange={handleSelectRecommendation} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {recommendations.map((rec, idx) => (
                      <Radio.Button
                        key={idx}
                        value={rec.name}
                        style={{ height: 'auto', padding: '8px 12px', background: 'rgba(13, 15, 26, 0.5)', borderColor: 'rgba(212, 165, 55, 0.4)', borderRadius: 6, display: 'block', textAlign: 'left' }}
                      >
                        <div style={{ color: '#d4a537', fontWeight: 'bold', fontSize: 14 }}>{rec.name}</div>
                        <div style={{ color: '#a0a3c4', fontSize: 12, lineHeight: 1.3, marginTop: 4, whiteSpace: 'normal' }}>{rec.description}</div>
                      </Radio.Button>
                    ))}
                  </Radio.Group>
                </Form.Item>
              )}
            </div>
          )}
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
            disabled={loading}
          />
        </Form.Item>

        {loading && (
          <div className="create-deck-modal__loading-overlay">
            <Spin size="large" />
            <p>Generando tu mazo de Commander...</p>
            <small>Esto puede tardar unos segundos mientras consulto con EDHRec</small>
          </div>
        )}
      </Form>
    </Modal>
  );
}

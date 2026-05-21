import { Modal, Form, Input, Select, Button, Spin, Radio, Alert, Tabs } from 'antd';
import { CrownOutlined, RobotOutlined, ExperimentOutlined, BookOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { sendChatMessage } from '../../api/chat';
import './CreateDeckModal.css';

const { TabPane } = Tabs;

const BUDGET_OPTIONS = [
  { value: 'budget', label: 'Budget — Económico, cartas accesibles' },
  { value: 'expensive', label: 'Expensive — Sin límite de precio' },
];

const BRACKET_OPTIONS = [
  { value: '1', label: 'Bracket 1 - Casual bajo (Precons sin modificar, mazos temáticos)' },
  { value: '2', label: 'Bracket 2 - Casual medio (Precons mejorados, estrategias claras)' },
  { value: '3', label: 'Bracket 3 - Optimizado (Alta sinergia, combos, rápido)' },
  { value: '4', label: 'Bracket 4 - cEDH (Máxima eficiencia, combos letales)' },
];

export default function CreateDeckModal({ open, onClose, onSubmit, loading }) {
  const [form] = Form.useForm();
  const [recsLoading, setRecsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [deckType, setDeckType] = useState('standard');

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSubmit({ ...values, isExperimental: deckType === 'experimental' });
    });
  };

  const handleCancel = () => {
    if (loading) return;
    form.resetFields();
    setRecommendations([]);
    setDeckType('standard');
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CrownOutlined style={{ color: '#c4952a' }} />
          <span>Crear Nuevo Mazo</span>
        </div>
      }
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={loading ? 'Creando...' : 'Crear Mazo'}
      cancelText="Cancelar"
      className="create-deck-modal"
      width={520}
      destroyOnClose
      id="create-deck-modal"
      maskClosable={!loading}
      closable={!loading}
      cancelButtonProps={{ disabled: loading }}
    >
      <Tabs 
        activeKey={deckType} 
        onChange={setDeckType} 
        style={{ marginBottom: '16px' }}
        items={[
          {
            key: 'standard',
            label: (
              <span><BookOutlined /> Mazo Estándar</span>
            ),
          },
          {
            key: 'experimental',
            label: (
              <span><ExperimentOutlined /> Mazo Experimental</span>
            ),
          }
        ]}
      />

      <Form
        form={form}
        layout="vertical"
        className="create-deck-modal__form"
        id="create-deck-form"
        initialValues={{ budget: 'budget', bracket: '2' }}
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
            disabled={loading}
          />
        </Form.Item>

        {deckType === 'standard' && (
          <>
            <div style={{ marginBottom: 24, padding: '12px 16px', background: 'rgba(196, 149, 42, 0.05)', borderRadius: 8, display: 'flex', flexDirection: 'column', border: '1px solid rgba(196, 149, 42, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#e8dcc4' }}>
                  ¿No sabes qué comandante elegir? Deja que te recomiende algunos.
                </span>
                <Button
                  type="primary"
                  size="small"
                  onClick={handleRecommend}
                  loading={recsLoading}
                  icon={<RobotOutlined />}
                  style={{ background: '#c4952a', color: '#12100d', fontWeight: 600, border: 'none', flexShrink: 0, marginLeft: 12 }}
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
                            style={{ height: 'auto', padding: '8px 12px', background: 'rgba(26, 23, 16, 0.8)', borderColor: 'rgba(196, 149, 42, 0.4)', borderRadius: 6, display: 'block', textAlign: 'left' }}
                          >
                            <div style={{ color: '#c4952a', fontWeight: 'bold', fontSize: 14 }}>{rec.name}</div>
                            <div style={{ color: '#b8a88a', fontSize: 12, lineHeight: 1.3, marginTop: 4, whiteSpace: 'normal' }}>{rec.description}</div>
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
          </>
        )}

        {deckType === 'experimental' && (
          <Form.Item
            name="bracket"
            label="Bracket de Poder"
            rules={[{ required: true, message: 'Selecciona un bracket' }]}
            extra={<span style={{ color: '#b8a88a', fontSize: '12px' }}>El agente creará un mazo experimental adaptado al bracket seleccionado usando inteligencia artificial en vez de EDHRec.</span>}
          >
            <Select
              placeholder="Selecciona el Bracket"
              size="large"
              options={BRACKET_OPTIONS}
              disabled={loading}
            />
          </Form.Item>
        )}

        {loading && (
          <div className="create-deck-modal__loading-overlay">
            <Spin size="large" />
            <p style={{ marginTop: '16px', color: '#e8dcc4', fontWeight: 500 }}>
              {deckType === 'experimental' ? 'Diseñando mazo experimental...' : 'Consultando EDHRec...'}
            </p>
            <small style={{ color: '#8b8fa6' }}>Esto puede tardar unos segundos</small>
          </div>
        )}
      </Form>
    </Modal>
  );
}

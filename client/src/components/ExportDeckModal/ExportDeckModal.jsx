import { useState, useEffect } from 'react';
import { Modal, Input, Button, message, Spin } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { sendChatMessage } from '../../api/chat';

const { TextArea } = Input;

export default function ExportDeckModal({ visible, onCancel, deck }) {
  const [loading, setLoading] = useState(false);
  const [deckText, setDeckText] = useState('');

  useEffect(() => {
    if (visible && deck) {
      handleExport();
    } else {
      setDeckText('');
    }
  }, [visible, deck]);

  const handleExport = async () => {
    setLoading(true);
    try {
      // Pedimos específicamente el formato (1x Sol Ring)
      const prompt = `Genera una lista de texto de todas las cartas del mazo "${deck.name}" con el formato exacto "(cantidadx nombrecarta)", por ejemplo: "1x Sol Ring". Pon cada carta en una línea nueva. Solo devuelve la lista de cartas, sin introducciones ni despedidas ni explicaciones.`;
      const data = await sendChatMessage(prompt, deck.id);
      setDeckText(data.response);
    } catch (error) {
      message.error('Error al exportar el mazo: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!deckText) return;
    navigator.clipboard.writeText(deckText);
    message.success('Copiado al portapapeles');
  };

  return (
    <Modal
      title={`Exportar: ${deck?.name}`}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Cerrar
        </Button>,
        <Button
          key="copy"
          type="primary"
          icon={<CopyOutlined />}
          onClick={handleCopy}
          disabled={!deckText || loading}
        >
          Copiar todo
        </Button>,
      ]}
      width={600}
      centered
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px', color: '#5d6080' }}>Generando lista...</p>
        </div>
      ) : (
        <div className="export-modal-content">
          <p style={{ color: '#c8cad4', marginBottom: '16px' }}>
            Aquí tienes la lista completa de tu mazo en formato de texto:
          </p>
          <TextArea
            value={deckText}
            readOnly
            autoSize={{ minRows: 10, maxRows: 20 }}
            style={{
              fontFamily: 'monospace',
              backgroundColor: '#0d0f1a',
              color: '#d4a537',
              borderColor: '#2a2d4a',
              borderRadius: '8px',
              padding: '12px'
            }}
          />
        </div>
      )}
    </Modal>
  );
}

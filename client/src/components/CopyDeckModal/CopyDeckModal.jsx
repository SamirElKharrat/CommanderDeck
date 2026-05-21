import { Modal, Form, Switch, Button, Typography } from 'antd';
import { CopyOutlined, LockOutlined, GlobalOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Text } = Typography;

export default function CopyDeckModal({ visible, deck, loading, onCancel, onCopy }) {
  const [isPublic, setIsPublic] = useState(false);

  const handleOk = () => {
    if (deck) {
      onCopy(deck.id, isPublic);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CopyOutlined style={{ color: '#c4952a' }} />
          <span>Copiar Mazo</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} style={{ background: '#12100d', borderColor: 'rgba(196,149,42,0.2)', color: '#b8a88a' }}>
          Cancelar
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
          Copiar
        </Button>,
      ]}
    >
      <div style={{ padding: '16px 0' }}>
        <p style={{ color: '#b8a88a', marginBottom: '24px' }}>
          Vas a copiar el mazo <strong>{deck?.name}</strong> a tu colección personal.
        </p>

        <Form layout="vertical">
          <Form.Item label={<span style={{ color: '#e8dcc4' }}>Visibilidad del nuevo mazo</span>}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(196,149,42,0.05)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(196,149,42,0.1)' }}>
              <Switch 
                checked={isPublic} 
                onChange={setIsPublic} 
                checkedChildren={<GlobalOutlined />}
                unCheckedChildren={<LockOutlined />}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Text style={{ color: '#e8dcc4', fontWeight: 500 }}>
                  {isPublic ? 'Público' : 'Privado'}
                </Text>
                <Text style={{ color: '#8b8fa6', fontSize: '12px' }}>
                  {isPublic ? 'Cualquiera podrá ver este mazo' : 'Solo tú podrás ver este mazo'}
                </Text>
              </div>
            </div>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}

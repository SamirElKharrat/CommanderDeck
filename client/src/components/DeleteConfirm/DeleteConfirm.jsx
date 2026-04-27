import { Modal, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';

export default function DeleteConfirm({ onConfirm, children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOk = (e) => {
    e.stopPropagation();
    setIsModalOpen(false);
    onConfirm();
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    setIsModalOpen(false);
  };

  return (
    <>
      <div onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }} style={{ display: 'inline-block' }}>
        {children}
      </div>
      <Modal
        title={
          <span>
            <ExclamationCircleOutlined style={{ color: '#e8553d', marginRight: 8 }} />
            Eliminar mazo
          </span>
        }
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Eliminar"
        cancelText="Cancelar"
        okButtonProps={{ danger: true }}
        centered
        className="delete-modal"
      >
        <p style={{ color: '#c8cad4' }}>¿Estás seguro de que quieres eliminar este mazo? Esta acción no se puede deshacer.</p>
      </Modal>
    </>
  );
}

import { useState, useMemo } from 'react';
import { Segmented, Select, Table, Button } from 'antd';
import {
  AppstoreOutlined,
  UnorderedListOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import './CardList.css';

export default function CardList({ cards, isEditMode = false, onRemoveCard }) {
  const [viewMode, setViewMode] = useState('grid');
  const [typeFilter, setTypeFilter] = useState('all');

  // Extract unique card types for filter
  const cardTypes = useMemo(() => {
    const types = new Set();
    cards.forEach((card) => {
      // Take only the base type (e.g., "Creature" from "Legendary Creature")
      const baseType = card.type.split('—')[0].trim().split(' ').pop();
      if (baseType) types.add(baseType);
    });
    return ['all', ...Array.from(types).sort()];
  }, [cards]);

  const filteredCards = useMemo(() => {
    if (typeFilter === 'all') return cards;
    return cards.filter((card) => card.type.toLowerCase().includes(typeFilter.toLowerCase()));
  }, [cards, typeFilter]);

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span style={{ fontWeight: 500, color: '#e8e6f0' }}>{text}</span>,
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (text) => <span style={{ color: '#8b8fa6' }}>{text}</span>,
    },
    {
      title: 'Coste de Maná',
      dataIndex: 'manaCost',
      key: 'manaCost',
      render: (text) => <span className="card-list__mana-cost">{text || '—'}</span>,
    },
    ...(isEditMode
      ? [
          {
            title: '',
            key: 'action',
            width: 50,
            render: (_, record) => (
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                className="card-list__remove-btn"
                onClick={() => onRemoveCard?.(record.id)}
              />
            ),
          },
        ]
      : []),
  ];

  const filterOptions = cardTypes.map((type) => ({
    value: type,
    label: type === 'all' ? 'Todos los tipos' : type,
  }));

  return (
    <div className="card-list" id="card-list">
      <div className="card-list__controls">
        <Segmented
          className="card-list__view-toggle"
          value={viewMode}
          onChange={setViewMode}
          options={[
            { value: 'grid', icon: <AppstoreOutlined />, label: 'Grid' },
            { value: 'list', icon: <UnorderedListOutlined />, label: 'Texto' },
          ]}
          id="card-view-toggle"
        />
        <Select
          className="card-list__filter"
          value={typeFilter}
          onChange={setTypeFilter}
          options={filterOptions}
          placeholder="Filtrar por tipo"
          id="card-type-filter"
        />
      </div>

      {viewMode === 'grid' ? (
        <div className="card-list__grid" id="card-grid-view">
          {filteredCards.map((card) => (
            <div key={card.id} className="card-list__grid-item">
              <img
                className="card-list__grid-image"
                src={card.image}
                alt={card.name}
                loading="lazy"
                onError={(e) => {
                  e.target.src =
                    'https://via.placeholder.com/200x280/13152a/d4a537?text=Card';
                }}
              />
              <div className="card-list__grid-name">{card.name}</div>
              {isEditMode && (
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  className="card-list__remove-btn"
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    background: 'rgba(13,15,26,0.8)',
                    borderRadius: '50%',
                  }}
                  onClick={() => onRemoveCard?.(card.id)}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <Table
          className="card-list__table"
          dataSource={filteredCards}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="small"
          id="card-table-view"
        />
      )}
    </div>
  );
}

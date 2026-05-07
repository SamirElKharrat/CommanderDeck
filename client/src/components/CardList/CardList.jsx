import { useState, useMemo } from 'react';
import { Segmented, Select, Table, Button, Image, Popover, Badge, Modal, InputNumber, Input, Empty } from 'antd';
import {
  AppstoreOutlined,
  UnorderedListOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import './CardList.css';

// Helper to render mana symbols using Scryfall SVGs
const ManaSymbol = ({ symbol }) => {
  const sym = symbol.replace(/\{|\}/g, '');
  return (
    <img 
      src={`https://svgs.scryfall.io/card-symbols/${sym}.svg`} 
      alt={symbol} 
      style={{ width: 14, height: 14, marginRight: 2, verticalAlign: 'middle' }}
    />
  );
};

const renderManaCost = (cost) => {
  if (!cost) return '—';
  const symbols = cost.match(/\{[^}]+\}/g);
  if (!symbols) return cost;
  return symbols.map((sym, i) => <ManaSymbol key={i} symbol={sym} />);
};

// Map of card types to order and Spanish labels
const TYPE_MAP = {
  'commander': { label: 'Comandante', order: 0 },
  'creature': { label: 'Criaturas', order: 1 },
  'planeswalker': { label: 'Planeswalkers', order: 2 },
  'artifact': { label: 'Artefactos', order: 3 },
  'enchantment': { label: 'Encantamientos', order: 4 },
  'sorcery': { label: 'Conjuros', order: 5 },
  'instant': { label: 'Instantáneos', order: 6 },
  'land': { label: 'Tierras', order: 7 },
  'other': { label: 'Otros', order: 8 },
};

export default function CardList({ cards, isEditMode = false, onRemoveCard, commanderName }) {
  const [viewMode, setViewMode] = useState('grid');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Deletion state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [deleteQty, setDeleteQty] = useState(1);

  // Grouping logic
  const groupedCards = useMemo(() => {
    const filtered = cards.filter((card) => {
      const matchesType = typeFilter === 'all' || card.type.toLowerCase().includes(typeFilter.toLowerCase());
      const matchesSearch = card.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });

    const groups = {};
    
    filtered.forEach(card => {
      let typeKey = 'other';
      const fullType = card.type.toLowerCase();
      
      // Special case for commander
      if (card.name.trim().toLowerCase() === commanderName?.trim().toLowerCase()) {
        typeKey = 'commander';
      } else if (fullType.includes('creature')) {
        typeKey = 'creature';
      } else if (fullType.includes('planeswalker')) {
        typeKey = 'planeswalker';
      } else if (fullType.includes('artifact')) {
        typeKey = 'artifact';
      } else if (fullType.includes('enchantment')) {
        typeKey = 'enchantment';
      } else if (fullType.includes('sorcery')) {
        typeKey = 'sorcery';
      } else if (fullType.includes('instant')) {
        typeKey = 'instant';
      } else if (fullType.includes('land')) {
        typeKey = 'land';
      }
      
      if (!groups[typeKey]) groups[typeKey] = [];
      groups[typeKey].push(card);
    });

    // Sort types by defined order
    return Object.keys(groups)
      .sort((a, b) => TYPE_MAP[a].order - TYPE_MAP[b].order)
      .map(key => ({
        key,
        label: TYPE_MAP[key].label,
        items: groups[key]
      }));
  }, [cards, typeFilter, searchQuery, commanderName]);

  const cardTypes = useMemo(() => {
    const types = new Set();
    cards.forEach((card) => {
      const baseType = card.type.split('—')[0].trim().split(' ').pop();
      if (baseType) types.add(baseType);
    });
    return ['all', ...Array.from(types).sort()];
  }, [cards]);

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Popover 
          content={<img src={record.image} alt={text} style={{ width: 200 }} />} 
          title={text}
          trigger="hover"
          placement="right"
        >
          <span style={{ fontWeight: 500, color: '#e8e6f0', cursor: 'pointer' }}>{text}</span>
        </Popover>
      ),
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
      render: (text) => <div className="card-list__mana-cost">{renderManaCost(text)}</div>,
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      render: (val) => <span style={{ color: '#d4a537', fontWeight: 600 }}>×{val || 1}</span>,
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
                onClick={() => {
                  setCardToDelete(record);
                  setDeleteQty(1);
                  setIsDeleteModalOpen(true);
                }}
              />
            ),
          },
        ]
      : []),
  ];

  const handleConfirmDelete = () => {
    if (cardToDelete) {
      onRemoveCard?.(cardToDelete.id, deleteQty);
      setIsDeleteModalOpen(false);
      setCardToDelete(null);
    }
  };

  return (
    <div className="card-list" id="card-list">
      <div className="card-list__header-row">
        <Input
          placeholder="Buscar cartas..."
          prefix={<SearchOutlined style={{ color: '#5d6080' }} />}
          className="card-list__search"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          allowClear
          id="card-search-input"
        />
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
            options={cardTypes.map(t => ({ value: t, label: t === 'all' ? 'Todos los tipos' : t }))}
            placeholder="Filtrar por tipo"
            id="card-type-filter"
          />
        </div>
      </div>

      <Image.PreviewGroup>
        {groupedCards.length === 0 ? (
          <Empty description="No se encontraron cartas" style={{ marginTop: 40 }} />
        ) : (
          groupedCards.map(group => (
            <div key={group.key} className="card-list__section">
              <h3 className="card-list__section-title">
                {group.label} <span className="card-list__section-count">({group.items.length})</span>
              </h3>
              
              {viewMode === 'grid' ? (
                <div className="card-list__grid">
                  {group.items.map((card) => (
                    <div key={card.id} className="card-list__grid-item">
                      <Badge count={card.quantity > 1 ? card.quantity : 0} offset={[-20, 20]} color="#d4a537">
                        <Image
                          className="card-list__grid-image"
                          src={card.image}
                          alt={card.name}
                          fallback="https://via.placeholder.com/200x280/13152a/d4a537?text=Card"
                          preview={{
                            mask: <div className="card-list__preview-mask"><EyeOutlined /> Ver</div>
                          }}
                        />
                      </Badge>
                      <div className="card-list__grid-name">{card.name}</div>
                      {isEditMode && (
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          className="card-list__remove-btn-grid"
                          onClick={() => {
                            setCardToDelete(card);
                            setDeleteQty(1);
                            setIsDeleteModalOpen(true);
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Table
                  className="card-list__table"
                  dataSource={group.items}
                  columns={columns}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  showHeader={group.key === groupedCards[0].key}
                />
              )}
            </div>
          ))
        )}
      </Image.PreviewGroup>

      {/* Delete Modal */}
      <Modal
        title="Quitar Cartas"
        open={isDeleteModalOpen}
        onOk={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        okText="Confirmar"
        cancelText="Cancelar"
        okButtonProps={{ danger: true }}
        width={400}
        id="card-delete-modal"
      >
        {cardToDelete && (
          <div style={{ padding: '10px 0' }}>
            <p>¿Cuántas copias de <strong>{cardToDelete.name}</strong> quieres quitar?</p>
            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 15 }}>
              <InputNumber
                min={1}
                max={cardToDelete.quantity}
                value={deleteQty}
                onChange={setDeleteQty}
                style={{ width: '100%' }}
                size="large"
                id="delete-qty-input"
              />
              <span style={{ color: '#5d6080', fontSize: 13, whiteSpace: 'nowrap' }}>
                de {cardToDelete.quantity} disponibles
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


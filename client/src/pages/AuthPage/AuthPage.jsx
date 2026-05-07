import { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import {
  MailOutlined,
  LockOutlined,
  UserOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { loginUser, registerUser } from '../../api/auth';
import './AuthPage.css';

export default function AuthPage({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (isLogin) {
        await loginUser(values.email, values.password);
        message.success('¡Bienvenido de nuevo!');
      } else {
        await registerUser({
          user_name: values.user_name,
          email: values.email,
          password: values.password,
        });
        // Auto-login after register
        await loginUser(values.email, values.password);
        message.success('¡Cuenta creada con éxito!');
      }
      onAuthSuccess();
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" id="auth-page">
      <div className="auth-page__ambient" />

      <div className="auth-page__card">
        <div className="auth-page__logo">
          <CrownOutlined className="auth-page__logo-icon" />
          <h1 className="auth-page__logo-title">
            Commander<span className="auth-page__logo-accent">Deck</span>
          </h1>
          <p className="auth-page__logo-subtitle">
            Gestiona tus mazos de Commander con IA
          </p>
        </div>

        <div className="auth-page__tabs">
          <button
            className={`auth-page__tab ${isLogin ? 'auth-page__tab--active' : ''}`}
            onClick={() => { setIsLogin(true); form.resetFields(); }}
          >
            Iniciar Sesión
          </button>
          <button
            className={`auth-page__tab ${!isLogin ? 'auth-page__tab--active' : ''}`}
            onClick={() => { setIsLogin(false); form.resetFields(); }}
          >
            Registrarse
          </button>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="auth-page__form"
          id="auth-form"
        >
          {!isLogin && (
            <Form.Item
              name="user_name"
              rules={[{ required: true, message: 'Introduce tu nombre de usuario' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#5d6080' }} />}
                placeholder="Nombre de usuario"
                size="large"
                id="auth-username"
              />
            </Form.Item>
          )}

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Introduce tu email' },
              { type: 'email', message: 'Email no válido' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#5d6080' }} />}
              placeholder="Email"
              size="large"
              id="auth-email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Introduce tu contraseña' },
              { min: 6, message: 'Mínimo 6 caracteres' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#5d6080' }} />}
              placeholder="Contraseña"
              size="large"
              id="auth-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
              className="auth-page__submit-btn"
              id="auth-submit"
            >
              {isLogin ? 'Entrar' : 'Crear Cuenta'}
            </Button>
          </Form.Item>
        </Form>
      </div>

      <div className="auth-page__particles">
        {[...Array(6)].map((_, i) => (
          <span key={i} className="auth-page__particle" style={{ '--i': i }} />
        ))}
      </div>
    </div>
  );
}

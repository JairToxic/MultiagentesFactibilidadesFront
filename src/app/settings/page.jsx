// app/settings/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import toast from 'react-hot-toast';
import Sidebar from '../../../components/layout/Sidebar';
import Header from '../../../components/layout/Header';
import Button from '../../../components/common/Button';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Estados de configuración
  const [generalSettings, setGeneralSettings] = useState({
    autoRefresh: true,
    refreshInterval: 5000,
    notificationsEnabled: true,
    soundEnabled: false,
  });

  const [emailSettings, setEmailSettings] = useState({
    autoReplyEnabled: true,
    replyFromSupport: false,
    includeSignature: true,
    signature: 'Saludos,\nEquipo de Soporte\nInova Solutions',
  });

  const [ticketSettings, setTicketSettings] = useState({
    autoAssign: true,
    defaultPriority: 'media',
    autoCloseResolved: false,
    autoCloseDays: 7,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    newTicket: true,
    statusChange: true,
    newMessage: true,
    assignment: true,
    emailNotifications: false,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/tickets');
    }
  }, [status, router]);

  useEffect(() => {
    // Cargar configuración guardada
    const loadSettings = () => {
      const saved = localStorage.getItem('ticketSystemSettings');
      if (saved) {
        const settings = JSON.parse(saved);
        setGeneralSettings(settings.general || generalSettings);
        setEmailSettings(settings.email || emailSettings);
        setTicketSettings(settings.ticket || ticketSettings);
        setNotificationSettings(settings.notification || notificationSettings);
      }
    };

    if (session) {
      loadSettings();
    }
  }, [session]);

  const handleSaveSettings = () => {
    setLoading(true);

    const allSettings = {
      general: generalSettings,
      email: emailSettings,
      ticket: ticketSettings,
      notification: notificationSettings,
    };

    try {
      localStorage.setItem('ticketSystemSettings', JSON.stringify(allSettings));
      toast.success('Configuración guardada correctamente');
    } catch (error) {
      toast.error('Error al guardar configuración');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    if (confirm('¿Estás seguro de restaurar la configuración predeterminada?')) {
      localStorage.removeItem('ticketSystemSettings');
      window.location.reload();
    }
  };

  if (status === 'loading') {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'email', label: 'Email', icon: '📧' },
    { id: 'tickets', label: 'Tickets', icon: '🎫' },
    { id: 'notifications', label: 'Notificaciones', icon: '🔔' },
    { id: 'users', label: 'Usuarios', icon: '👥' },
  ];

  return (
    <div className={styles.page}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={styles.main}>
        <Header title="⚙️ Configuración" onMenuClick={() => setSidebarOpen(true)} />

        <div className={styles.content}>
          <div className={styles.container}>
            {/* Tabs */}
            <div className={styles.tabs}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`${styles.tab} ${
                    activeTab === tab.id ? styles.activeTab : ''
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className={styles.tabIcon}>{tab.icon}</span>
                  <span className={styles.tabLabel}>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className={styles.settingsContent}>
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Configuración General</h2>

                  <div className={styles.setting}>
                    <div className={styles.settingInfo}>
                      <label className={styles.settingLabel}>Auto-refresh</label>
                      <p className={styles.settingDescription}>
                        Actualizar automáticamente la lista de tickets
                      </p>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={generalSettings.autoRefresh}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            autoRefresh: e.target.checked,
                          })
                        }
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  {generalSettings.autoRefresh && (
                    <div className={styles.setting}>
                      <div className={styles.settingInfo}>
                        <label className={styles.settingLabel}>
                          Intervalo de actualización
                        </label>
                        <p className={styles.settingDescription}>
                          Frecuencia de actualización en milisegundos
                        </p>
                      </div>
                      <input
                        type="number"
                        className={styles.input}
                        value={generalSettings.refreshInterval}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            refreshInterval: parseInt(e.target.value),
                          })
                        }
                        min="1000"
                        step="1000"
                      />
                    </div>
                  )}

                  <div className={styles.setting}>
                    <div className={styles.settingInfo}>
                      <label className={styles.settingLabel}>
                        Notificaciones en pantalla
                      </label>
                      <p className={styles.settingDescription}>
                        Mostrar notificaciones toast para eventos importantes
                      </p>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={generalSettings.notificationsEnabled}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            notificationsEnabled: e.target.checked,
                          })
                        }
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  <div className={styles.setting}>
                    <div className={styles.settingInfo}>
                      <label className={styles.settingLabel}>Sonidos</label>
                      <p className={styles.settingDescription}>
                        Reproducir sonido al recibir notificaciones
                      </p>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={generalSettings.soundEnabled}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            soundEnabled: e.target.checked,
                          })
                        }
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                </div>
              )}

              {/* Email Settings */}
              {activeTab === 'email' && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Configuración de Email</h2>

                  <div className={styles.setting}>
                    <div className={styles.settingInfo}>
                      <label className={styles.settingLabel}>
                        Respuesta automática
                      </label>
                      <p className={styles.settingDescription}>
                        Enviar respuesta automática al crear un ticket
                      </p>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={emailSettings.autoReplyEnabled}
                        onChange={(e) =>
                          setEmailSettings({
                            ...emailSettings,
                            autoReplyEnabled: e.target.checked,
                          })
                        }
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  <div className={styles.setting}>
                    <div className={styles.settingInfo}>
                      <label className={styles.settingLabel}>
                        Responder desde buzón de soporte
                      </label>
                      <p className={styles.settingDescription}>
                        Usar buzón de soporte por defecto en lugar del buzón del usuario
                      </p>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={emailSettings.replyFromSupport}
                        onChange={(e) =>
                          setEmailSettings({
                            ...emailSettings,
                            replyFromSupport: e.target.checked,
                          })
                        }
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  <div className={styles.setting}>
                    <div className={styles.settingInfo}>
                      <label className={styles.settingLabel}>
                        Incluir firma en respuestas
                      </label>
                      <p className={styles.settingDescription}>
                        Agregar firma personalizada al final de las respuestas
                      </p>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={emailSettings.includeSignature}
                        onChange={(e) =>
                          setEmailSettings({
                            ...emailSettings,
                            includeSignature: e.target.checked,
                          })
                        }
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  {emailSettings.includeSignature && (
                    <div className={styles.settingFull}>
                      <label className={styles.settingLabel}>Firma</label>
                      <textarea
                        className={styles.textarea}
                        value={emailSettings.signature}
                        onChange={(e) =>
                          setEmailSettings({
                            ...emailSettings,
                            signature: e.target.value,
                          })
                        }
                        rows={4}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Ticket Settings */}
              {activeTab === 'tickets' && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Configuración de Tickets</h2>

                  <div className={styles.setting}>
                    <div className={styles.settingInfo}>
                      <label className={styles.settingLabel}>
                        Asignación automática
                      </label>
                      <p className={styles.settingDescription}>
                        Asignar automáticamente tickets a técnicos usando IA
                      </p>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={ticketSettings.autoAssign}
                        onChange={(e) =>
                          setTicketSettings({
                            ...ticketSettings,
                            autoAssign: e.target.checked,
                          })
                        }
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  <div className={styles.setting}>
                    <div className={styles.settingInfo}>
                      <label className={styles.settingLabel}>
                        Prioridad predeterminada
                      </label>
                      <p className={styles.settingDescription}>
                        Prioridad asignada cuando la IA no puede determinarla
                      </p>
                    </div>
                    <select
                      className={styles.select}
                      value={ticketSettings.defaultPriority}
                      onChange={(e) =>
                        setTicketSettings({
                          ...ticketSettings,
                          defaultPriority: e.target.value,
                        })
                      }
                    >
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                      <option value="critica">Crítica</option>
                    </select>
                  </div>

                  <div className={styles.setting}>
                    <div className={styles.settingInfo}>
                      <label className={styles.settingLabel}>
                        Cerrar tickets resueltos automáticamente
                      </label>
                      <p className={styles.settingDescription}>
                        Cerrar automáticamente tickets después de estar resueltos
                      </p>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={ticketSettings.autoCloseResolved}
                        onChange={(e) =>
                          setTicketSettings({
                            ...ticketSettings,
                            autoCloseResolved: e.target.checked,
                          })
                        }
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  {ticketSettings.autoCloseResolved && (
                    <div className={styles.setting}>
                      <div className={styles.settingInfo}>
                        <label className={styles.settingLabel}>
                          Días antes de cerrar
                        </label>
                        <p className={styles.settingDescription}>
                          Número de días después de resolver antes de cerrar
                        </p>
                      </div>
                      <input
                        type="number"
                        className={styles.input}
                        value={ticketSettings.autoCloseDays}
                        onChange={(e) =>
                          setTicketSettings({
                            ...ticketSettings,
                            autoCloseDays: parseInt(e.target.value),
                          })
                        }
                        min="1"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    Configuración de Notificaciones
                  </h2>

                  <div className={styles.setting}>
                    <div className={styles.settingInfo}>
                      <label className={styles.settingLabel}>Nuevo ticket</label>
                      <p className={styles.settingDescription}>
                        Notificar cuando se crea un nuevo ticket
                      </p>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.newTicket}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            newTicket: e.target.checked,
                          })
                        }
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  <div className={styles.setting}>
                    <div className={styles.settingInfo}>
                      <label className={styles.settingLabel}>Cambio de estado</label>
                      <p className={styles.settingDescription}>
                        Notificar cuando un ticket cambia de estado
                      </p>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.statusChange}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            statusChange: e.target.checked,
                          })
                        }
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  <div className={styles.setting}>
                    <div className={styles.settingInfo}>
                      <label className={styles.settingLabel}>Nuevo mensaje</label>
                      <p className={styles.settingDescription}>
                        Notificar cuando se recibe un nuevo mensaje en un ticket
                      </p>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.newMessage}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            newMessage: e.target.checked,
                          })
                        }
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  <div className={styles.setting}>
                    <div className={styles.settingInfo}>
                      <label className={styles.settingLabel}>Asignación</label>
                      <p className={styles.settingDescription}>
                        Notificar cuando se asigna o reasigna un ticket
                      </p>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.assignment}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            assignment: e.target.checked,
                          })
                        }
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  <div className={styles.setting}>
                    <div className={styles.settingInfo}>
                      <label className={styles.settingLabel}>
                        Notificaciones por email
                      </label>
                      <p className={styles.settingDescription}>
                        Enviar notificaciones también por correo electrónico
                      </p>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            emailNotifications: e.target.checked,
                          })
                        }
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                </div>
              )}

              {/* User Settings */}
              {activeTab === 'users' && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Gestión de Usuarios</h2>
                  
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      {session?.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className={styles.userDetails}>
                      <h3>{session?.user?.name}</h3>
                      <p>{session?.user?.email}</p>
                      <span className={styles.userRole}>Administrador</span>
                    </div>
                  </div>

                  <div className={styles.infoBox}>
                    <p className={styles.infoIcon}>ℹ️</p>
                    <div>
                      <p className={styles.infoTitle}>Gestión de usuarios</p>
                      <p className={styles.infoText}>
                        La gestión avanzada de usuarios y roles estará disponible
                        en una próxima actualización. Por ahora, todos los usuarios
                        autenticados tienen acceso completo al sistema.
                      </p>
                    </div>
                  </div>

                  <div className={styles.userActions}>
                    <Button variant="secondary">Ver todos los usuarios</Button>
                    <Button variant="primary">Invitar usuario</Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className={styles.actions}>
                <Button
                  variant="secondary"
                  onClick={handleResetSettings}
                  disabled={loading}
                >
                  Restaurar predeterminados
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveSettings}
                  loading={loading}
                  icon="💾"
                >
                  Guardar cambios
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Save, User, Building, Shield, Bell, Database, Key } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
export function SettingsPage() {
    const [activeTab, setActiveTab] = useState('user');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userSettings, setUserSettings] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [companySettings, setCompanySettings] = useState({
        name: '',
        document: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
    });
    const [systemSettings, setSystemSettings] = useState({
        theme: 'light',
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        dateFormat: 'DD/MM/YYYY',
        currency: 'BRL'
    });
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        pushNotifications: true,
        orderUpdates: true,
        stockAlerts: true,
        financialReports: false,
        systemMaintenance: true
    });
    const [securitySettings, setSecuritySettings] = useState({
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordExpiry: 90,
        loginAttempts: 5
    });
    useEffect(() => {
        // Simular carregamento das configurações
        const loadSettings = async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Dados mockados
            setUserSettings({
                name: 'João Silva',
                email: 'joao@artplim.com',
                phone: '(11) 99999-9999'
            });
            setCompanySettings({
                name: 'ArtPlim Indústria e Comércio',
                document: '12.345.678/0001-90',
                email: 'contato@artplim.com',
                phone: '(11) 3333-4444',
                address: 'Rua das Indústrias, 123',
                city: 'São Paulo',
                state: 'SP',
                zipCode: '01234-567'
            });
            setLoading(false);
        };
        loadSettings();
    }, []);
    const handleSave = async () => {
        setSaving(true);
        try {
            // Simular salvamento
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success('Configurações salvas com sucesso!');
        }
        catch {
            toast.error('Erro ao salvar configurações');
        }
        finally {
            setSaving(false);
        }
    };
    const tabs = [
        { id: 'user', label: 'Usuário', icon: User },
        { id: 'company', label: 'Empresa', icon: Building },
        { id: 'system', label: 'Sistema', icon: Database },
        { id: 'notifications', label: 'Notificações', icon: Bell },
        { id: 'security', label: 'Segurança', icon: Shield }
    ];
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Configura\u00E7\u00F5es" }), _jsx("p", { className: "text-gray-600", children: "Gerencie as configura\u00E7\u00F5es do sistema" })] }), _jsxs(Button, { onClick: handleSave, disabled: saving, children: [_jsx(Save, { className: "mr-2 h-4 w-4" }), saving ? 'Salvando...' : 'Salvar Alterações'] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-6", children: [_jsx("div", { className: "lg:col-span-1", children: _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsx("nav", { className: "space-y-2", children: tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        return (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${activeTab === tab.id
                                                ? 'bg-primary text-white'
                                                : 'text-gray-700 hover:bg-gray-100'}`, children: [_jsx(Icon, { className: "h-4 w-4" }), tab.label] }, tab.id));
                                    }) }) }) }) }), _jsxs("div", { className: "lg:col-span-3", children: [activeTab === 'user' && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(User, { className: "h-5 w-5" }), "Configura\u00E7\u00F5es do Usu\u00E1rio"] }) }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Nome Completo" }), _jsx(Input, { value: userSettings.name, onChange: (e) => setUserSettings(prev => ({ ...prev, name: e.target.value })), placeholder: "Digite seu nome completo" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "E-mail" }), _jsx(Input, { type: "email", value: userSettings.email, onChange: (e) => setUserSettings(prev => ({ ...prev, email: e.target.value })), placeholder: "Digite seu e-mail" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Telefone" }), _jsx(Input, { value: userSettings.phone, onChange: (e) => setUserSettings(prev => ({ ...prev, phone: e.target.value })), placeholder: "Digite seu telefone" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Foto do Perfil" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center", children: _jsx(User, { className: "h-8 w-8 text-gray-400" }) }), _jsx(Button, { variant: "outline", children: "Alterar Foto" })] })] })] })] })), activeTab === 'company' && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Building, { className: "h-5 w-5" }), "Configura\u00E7\u00F5es da Empresa"] }) }), _jsx(CardContent, { className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Raz\u00E3o Social" }), _jsx(Input, { value: companySettings.name, onChange: (e) => setCompanySettings(prev => ({ ...prev, name: e.target.value })), placeholder: "Digite a raz\u00E3o social" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "CNPJ" }), _jsx(Input, { value: companySettings.document, onChange: (e) => setCompanySettings(prev => ({ ...prev, document: e.target.value })), placeholder: "00.000.000/0000-00" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "E-mail" }), _jsx(Input, { type: "email", value: companySettings.email, onChange: (e) => setCompanySettings(prev => ({ ...prev, email: e.target.value })), placeholder: "contato@empresa.com" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Telefone" }), _jsx(Input, { value: companySettings.phone, onChange: (e) => setCompanySettings(prev => ({ ...prev, phone: e.target.value })), placeholder: "(11) 0000-0000" })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Endere\u00E7o" }), _jsx(Input, { value: companySettings.address, onChange: (e) => setCompanySettings(prev => ({ ...prev, address: e.target.value })), placeholder: "Rua, n\u00FAmero, complemento" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Cidade" }), _jsx(Input, { value: companySettings.city, onChange: (e) => setCompanySettings(prev => ({ ...prev, city: e.target.value })), placeholder: "Digite a cidade" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Estado" }), _jsx(Input, { value: companySettings.state, onChange: (e) => setCompanySettings(prev => ({ ...prev, state: e.target.value })), placeholder: "SP" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "CEP" }), _jsx(Input, { value: companySettings.zipCode, onChange: (e) => setCompanySettings(prev => ({ ...prev, zipCode: e.target.value })), placeholder: "00000-000" })] })] }) })] })), activeTab === 'system' && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Database, { className: "h-5 w-5" }), "Configura\u00E7\u00F5es do Sistema"] }) }), _jsx(CardContent, { className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Tema" }), _jsxs("select", { value: systemSettings.theme, onChange: (e) => setSystemSettings(prev => ({ ...prev, theme: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent", children: [_jsx("option", { value: "light", children: "Claro" }), _jsx("option", { value: "dark", children: "Escuro" }), _jsx("option", { value: "auto", children: "Autom\u00E1tico" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Idioma" }), _jsxs("select", { value: systemSettings.language, onChange: (e) => setSystemSettings(prev => ({ ...prev, language: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent", children: [_jsx("option", { value: "pt-BR", children: "Portugu\u00EAs (Brasil)" }), _jsx("option", { value: "en-US", children: "English (US)" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Fuso Hor\u00E1rio" }), _jsxs("select", { value: systemSettings.timezone, onChange: (e) => setSystemSettings(prev => ({ ...prev, timezone: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent", children: [_jsx("option", { value: "America/Sao_Paulo", children: "S\u00E3o Paulo (GMT-3)" }), _jsx("option", { value: "America/New_York", children: "New York (GMT-5)" }), _jsx("option", { value: "Europe/London", children: "London (GMT+0)" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Formato de Data" }), _jsxs("select", { value: systemSettings.dateFormat, onChange: (e) => setSystemSettings(prev => ({ ...prev, dateFormat: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent", children: [_jsx("option", { value: "DD/MM/YYYY", children: "DD/MM/YYYY" }), _jsx("option", { value: "MM/DD/YYYY", children: "MM/DD/YYYY" }), _jsx("option", { value: "YYYY-MM-DD", children: "YYYY-MM-DD" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Moeda" }), _jsxs("select", { value: systemSettings.currency, onChange: (e) => setSystemSettings(prev => ({ ...prev, currency: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent", children: [_jsx("option", { value: "BRL", children: "Real (R$)" }), _jsx("option", { value: "USD", children: "D\u00F3lar ($)" }), _jsx("option", { value: "EUR", children: "Euro (\u20AC)" })] })] })] }) })] })), activeTab === 'notifications' && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Bell, { className: "h-5 w-5" }), "Configura\u00E7\u00F5es de Notifica\u00E7\u00F5es"] }) }), _jsx(CardContent, { className: "space-y-6", children: _jsx("div", { className: "space-y-4", children: [
                                                { key: 'emailNotifications', label: 'Notificações por E-mail', description: 'Receber notificações por e-mail' },
                                                { key: 'pushNotifications', label: 'Notificações Push', description: 'Receber notificações no navegador' },
                                                { key: 'orderUpdates', label: 'Atualizações de Ordens', description: 'Notificar sobre mudanças em ordens de serviço' },
                                                { key: 'stockAlerts', label: 'Alertas de Estoque', description: 'Notificar sobre estoque baixo ou zerado' },
                                                { key: 'financialReports', label: 'Relatórios Financeiros', description: 'Receber relatórios financeiros periódicos' },
                                                { key: 'systemMaintenance', label: 'Manutenção do Sistema', description: 'Notificar sobre manutenções programadas' }
                                            ].map((item) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900", children: item.label }), _jsx("p", { className: "text-sm text-gray-600", children: item.description })] }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: notificationSettings[item.key], onChange: (e) => setNotificationSettings(prev => ({ ...prev, [item.key]: e.target.checked })), className: "sr-only peer" }), _jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" })] })] }, item.key))) }) })] })), activeTab === 'security' && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "h-5 w-5" }), "Configura\u00E7\u00F5es de Seguran\u00E7a"] }) }), _jsx(CardContent, { className: "space-y-6", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900", children: "Autentica\u00E7\u00E3o de Dois Fatores" }), _jsx("p", { className: "text-sm text-gray-600", children: "Adicione uma camada extra de seguran\u00E7a \u00E0 sua conta" })] }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: securitySettings.twoFactorAuth, onChange: (e) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: e.target.checked })), className: "sr-only peer" }), _jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Timeout da Sess\u00E3o (minutos)" }), _jsx(Input, { type: "number", value: securitySettings.sessionTimeout, onChange: (e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) || 30 })), min: "5", max: "480" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Expira\u00E7\u00E3o da Senha (dias)" }), _jsx(Input, { type: "number", value: securitySettings.passwordExpiry, onChange: (e) => setSecuritySettings(prev => ({ ...prev, passwordExpiry: parseInt(e.target.value) || 90 })), min: "30", max: "365" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Tentativas de Login" }), _jsx(Input, { type: "number", value: securitySettings.loginAttempts, onChange: (e) => setSecuritySettings(prev => ({ ...prev, loginAttempts: parseInt(e.target.value) || 5 })), min: "3", max: "10" })] })] }), _jsxs("div", { className: "pt-4 border-t", children: [_jsxs(Button, { variant: "outline", className: "mr-4", children: [_jsx(Key, { className: "mr-2 h-4 w-4" }), "Alterar Senha"] }), _jsxs(Button, { variant: "outline", children: [_jsx(Shield, { className: "mr-2 h-4 w-4" }), "Log de Atividades"] })] })] }) })] }))] })] })] }));
}

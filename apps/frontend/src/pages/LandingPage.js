import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import DemoCharts from '../components/DemoCharts';
import { BarChart3, Users, Package, FileText, TrendingUp, Shield } from 'lucide-react';
const LandingPage = () => {
    const navigate = useNavigate();
    const handleLoginClick = () => {
        navigate('/auth/login');
    };
    const features = [
        {
            icon: _jsx(BarChart3, { className: "w-8 h-8 text-blue-600" }),
            title: 'Dashboard Inteligente',
            description: 'Visualize seus dados de vendas, estoque e orçamentos em tempo real'
        },
        {
            icon: _jsx(Users, { className: "w-8 h-8 text-green-600" }),
            title: 'Gestão de Clientes',
            description: 'Controle completo de clientes, fornecedores e parceiros'
        },
        {
            icon: _jsx(Package, { className: "w-8 h-8 text-purple-600" }),
            title: 'Controle de Estoque',
            description: 'Gerencie insumos, produtos e acabamentos com precisão'
        },
        {
            icon: _jsx(FileText, { className: "w-8 h-8 text-orange-600" }),
            title: 'Orçamentos Digitais',
            description: 'Crie e gerencie orçamentos de forma rápida e profissional'
        },
        {
            icon: _jsx(TrendingUp, { className: "w-8 h-8 text-red-600" }),
            title: 'Relatórios Avançados',
            description: 'Análises detalhadas para tomada de decisões estratégicas'
        },
        {
            icon: _jsx(Shield, { className: "w-8 h-8 text-indigo-600" }),
            title: 'Segurança LGPD',
            description: 'Proteção total dos dados conforme a Lei Geral de Proteção de Dados'
        }
    ];
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100", children: [_jsx("header", { className: "bg-white shadow-sm", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex justify-between items-center py-4", children: [_jsx("div", { className: "flex items-center", children: _jsxs("div", { className: "flex-shrink-0", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "ArtPlim ERP" }), _jsx("p", { className: "text-sm text-gray-600", children: "Sistema de Gest\u00E3o para Gr\u00E1ficas" })] }) }), _jsx("div", { className: "flex items-center space-x-4", children: _jsx("button", { onClick: handleLoginClick, className: "bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200", children: "Entrar no Sistema" }) })] }) }) }), _jsx("section", { className: "py-20", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center", children: [_jsxs("h2", { className: "text-4xl md:text-6xl font-bold text-gray-900 mb-6", children: ["Gerencie sua Gr\u00E1fica com", _jsx("span", { className: "text-blue-600", children: " Intelig\u00EAncia" })] }), _jsx("p", { className: "text-xl text-gray-600 mb-8 max-w-3xl mx-auto", children: "O ArtPlim ERP \u00E9 a solu\u00E7\u00E3o completa para gest\u00E3o de gr\u00E1ficas, oferecendo controle total sobre vendas, estoque, or\u00E7amentos e muito mais. Desenvolvido especialmente para o setor gr\u00E1fico." }), _jsx("button", { onClick: handleLoginClick, className: "bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors duration-200", children: "Come\u00E7ar Agora" })] }) }), _jsx("section", { className: "py-16 bg-white", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h3", { className: "text-3xl font-bold text-gray-900 mb-4", children: "Dashboard em Tempo Real" }), _jsx("p", { className: "text-lg text-gray-600", children: "Visualize dados importantes do seu neg\u00F3cio de forma clara e intuitiva" })] }), _jsx(DemoCharts, {})] }) }), _jsx("section", { className: "py-16 bg-gray-50", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h3", { className: "text-3xl font-bold text-gray-900 mb-4", children: "Funcionalidades Principais" }), _jsx("p", { className: "text-lg text-gray-600", children: "Tudo que voc\u00EA precisa para gerenciar sua gr\u00E1fica de forma eficiente" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", children: features.map((feature, index) => (_jsxs("div", { className: "bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200", children: [_jsxs("div", { className: "flex items-center mb-4", children: [feature.icon, _jsx("h4", { className: "text-xl font-semibold text-gray-900 ml-3", children: feature.title })] }), _jsx("p", { className: "text-gray-600", children: feature.description })] }, index))) })] }) }), _jsx("footer", { className: "bg-gray-900 text-white py-12", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-xl font-bold mb-4", children: "ArtPlim ERP" }), _jsx("p", { className: "text-gray-400", children: "Sistema de gest\u00E3o completo para gr\u00E1ficas, desenvolvido com as melhores pr\u00E1ticas de seguran\u00E7a e conformidade com a LGPD." })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-4", children: "Funcionalidades" }), _jsxs("ul", { className: "space-y-2 text-gray-400", children: [_jsx("li", { children: "\u2022 Gest\u00E3o de Vendas" }), _jsx("li", { children: "\u2022 Controle de Estoque" }), _jsx("li", { children: "\u2022 Or\u00E7amentos Digitais" }), _jsx("li", { children: "\u2022 Relat\u00F3rios Avan\u00E7ados" })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold mb-4", children: "Tecnologia" }), _jsxs("ul", { className: "space-y-2 text-gray-400", children: [_jsx("li", { children: "\u2022 React + TypeScript" }), _jsx("li", { children: "\u2022 Node.js + Express" }), _jsx("li", { children: "\u2022 PostgreSQL" }), _jsx("li", { children: "\u2022 Conformidade LGPD" })] })] })] }), _jsx("div", { className: "border-t border-gray-800 mt-8 pt-8 text-center text-gray-400", children: _jsx("p", { children: "\u00A9 2024 ArtPlim ERP. Todos os direitos reservados." }) })] }) })] }));
};
export default LandingPage;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
// Registrar componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);
const DemoCharts = () => {
    // Dados de exemplo para vendas mensais
    const salesData = {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [
            {
                label: 'Vendas (R$)',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
            },
        ],
    };
    // Dados de exemplo para estoque
    const stockData = {
        labels: ['Papel A4', 'Tinta Cyan', 'Tinta Magenta', 'Tinta Yellow', 'Tinta Black'],
        datasets: [
            {
                label: 'Quantidade em Estoque',
                data: [150, 45, 38, 42, 55],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(107, 114, 128, 0.8)',
                ],
                borderWidth: 0,
            },
        ],
    };
    // Dados de exemplo para orçamentos
    const quotesData = {
        labels: ['Pendentes', 'Aprovados', 'Rejeitados', 'Em Análise'],
        datasets: [
            {
                data: [25, 45, 8, 22],
                backgroundColor: [
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                ],
                borderWidth: 0,
            },
        ],
    };
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };
    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
        },
    };
    return (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12", children: [_jsxs("div", { className: "bg-white p-6 rounded-lg shadow-lg", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-4", children: "Vendas Mensais" }), _jsx("div", { className: "h-64", children: _jsx(Bar, { data: salesData, options: chartOptions }) })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow-lg", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-4", children: "Estoque Atual" }), _jsx("div", { className: "h-64", children: _jsx(Doughnut, { data: stockData, options: doughnutOptions }) })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow-lg", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-4", children: "Status dos Or\u00E7amentos" }), _jsx("div", { className: "h-64", children: _jsx(Doughnut, { data: quotesData, options: doughnutOptions }) })] })] }));
};
export default DemoCharts;

import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
});

export interface Position {
    ticker: string;
    quantity: number;
    average_price: number;
    current_price: number;
    pnl: number;
}

export interface PortfolioSummary {
    cash: number;
    equity: number;
    total_value: number;
    positions: Position[];
}

export const getPortfolio = async (): Promise<PortfolioSummary> => {
    const response = await api.get<PortfolioSummary>('/portfolio');
    return response.data;
};

export default api;

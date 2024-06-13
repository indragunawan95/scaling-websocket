import { ReactNode } from 'react';
import ThemeProvider from './ThemeProvider';
import { WebSocketProvider } from '../WebSocketContext';

interface ProvidersProps {
    children: ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
    return (
        <WebSocketProvider>
            <ThemeProvider>{children}</ThemeProvider>
        </WebSocketProvider>
    );
};

export default Providers;

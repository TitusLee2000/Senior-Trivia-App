import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './App';

test('renders sign in on login route', () => {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <AppRoutes />
      </MemoryRouter>
    </AuthProvider>
  );
  expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
});

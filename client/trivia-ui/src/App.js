import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import QuizPlay from './pages/QuizPlay';
import AdminQuizzes from './pages/AdminQuizzes';
import AdminQuizDetail from './pages/AdminQuizDetail';
import './App.css';

export function AppRoutes() {
  return (
    <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="quiz/:quizId" element={<QuizPlay />} />
            <Route
              path="admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminQuizzes />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/quiz/:quizId"
              element={
                <ProtectedRoute adminOnly>
                  <AdminQuizDetail />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

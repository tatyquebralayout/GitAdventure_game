import './App.css';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import necessary components
import Header from './components/ui/Header/Header';
import Footer from './components/ui/Footer/Footer';
import { GitRepositoryProvider } from './contexts/GitRepositoryProvider';
import { GitRepoProvider } from './contexts/GitRepoContext'; 
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Catalog from '@/pages/Catalog';
import Product from '@/pages/Product';
import Advisor from '@/pages/Advisor';
import Stack from '@/pages/Stack';
import About from '@/pages/About';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/product/:slug" element={<Product />} />
        <Route path="/advisor" element={<Advisor />} />
        <Route path="/stack/:id" element={<Stack />} />
        <Route path="/about" element={<About />} />
      </Route>
    </Routes>
  );
}

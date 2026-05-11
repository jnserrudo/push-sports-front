import { useState, useEffect, useMemo } from 'react';
import publicService from '../services/publicService';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    categoria: '',
    marca: '',
    sortBy: 'relevancia'
  });

  // Cargar productos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await publicService.getCatalog();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error('Error cargando productos:', err);
        setError('Error al cargar los productos. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Obtener categorías únicas
  const categorias = useMemo(() => {
    const cats = [...new Set(products.map(p => p.categoria).filter(Boolean))];
    return cats.sort();
  }, [products]);

  // Obtener marcas únicas
  const marcas = useMemo(() => {
    const marks = [...new Set(products.map(p => p.marca).filter(Boolean))];
    return marks.sort();
  }, [products]);

  // Filtrar y ordenar productos
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filtro de búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.nombre.toLowerCase().includes(searchLower) ||
        p.descripcion?.toLowerCase().includes(searchLower) ||
        p.marca?.toLowerCase().includes(searchLower) ||
        p.categoria?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro de categoría
    if (filters.categoria) {
      filtered = filtered.filter(p => p.categoria === filters.categoria);
    }

    // Filtro de marca
    if (filters.marca) {
      filtered = filtered.filter(p => p.marca === filters.marca);
    }

    // Ordenamiento
    switch (filters.sortBy) {
      case 'precio_asc':
        filtered.sort((a, b) => a.precio_base - b.precio_base);
        break;
      case 'precio_desc':
        filtered.sort((a, b) => b.precio_base - a.precio_base);
        break;
      case 'nombre_asc':
        filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'nombre_desc':
        filtered.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
      default:
        // Relevancia (orden original del backend)
        break;
    }

    return filtered;
  }, [products, filters]);

  // Actualizar filtros
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      search: '',
      categoria: '',
      marca: '',
      sortBy: 'relevancia'
    });
  };

  // Obtener productos por categoría
  const getProductsByCategory = (categoria) => {
    return products.filter(p => p.categoria === categoria);
  };

  // Obtener productos relacionados (misma categoría, excluyendo el actual)
  const getRelatedProducts = (productoId, limit = 4) => {
    const producto = products.find(p => p.id === productoId);
    if (!producto) return [];

    return products
      .filter(p => p.id !== productoId && p.categoria === producto.categoria)
      .slice(0, limit);
  };

  return {
    products,
    filteredProducts,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    categorias,
    marcas,
    getProductsByCategory,
    getRelatedProducts
  };
};

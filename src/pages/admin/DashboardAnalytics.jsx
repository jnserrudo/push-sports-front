import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Box, TrendingUp, Activity, Zap, BarChart3,
  ExternalLink, ArrowRight, Monitor, Store, ShieldCheck,
  Package, Truck, Tag, Ticket, AlertTriangle, CheckCircle2,
  ChevronRight, RefreshCw, CircleDollarSign, MapPin, Clock, CreditCard
} from 'lucide-react';
import { Wallet } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { sucursalesService } from '../../services/sucursalesService';
import { productosService } from '../../services/productosService';
import { usuariosService } from '../../services/genericServices';
import { auditoriaService } from '../../services/auditoriaService';
import { inventarioService } from '../../services/inventarioService';
import { enviosService } from '../../services/enviosService';
import DataTable from '../../components/ui/DataTable';

// --- Recharts ---
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { motion } from 'framer-motion';

// ... (Rest of MetricCard, QuickCard, AlertRow, columnsMovimientos logic remains same)

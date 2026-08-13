import React, { useState, useRef, useEffect } from 'react';
import { Camera, Check, X, AlertTriangle, Loader2 } from 'lucide-react';
import Modal from './Modal';

const BarcodeScanner = ({ 
  value = '', 
  onChange, 
  onValidate,
  placeholder = "Escanear código...",
  disabled = false,
  autoFocus = true 
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [validationState, setValidationState] = useState(null); // null | 'validating' | 'valid' | 'invalid'
  const [validationMessage, setValidationMessage] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const inputRef = useRef(null);
  const scannerRef = useRef(null);
  const validationTimeoutRef = useRef(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const validateCode = async (code) => {
    if (!code || !onValidate) {
      setValidationState(null);
      setValidationMessage('');
      return;
    }

    setValidationState('validating');
    
    try {
      const result = await onValidate(code);
      
      if (result.disponible) {
        setValidationState('valid');
        setValidationMessage('Código válido y disponible');
      } else {
        setValidationState('invalid');
        setValidationMessage(result.error || 'Este código ya está en uso');
      }
    } catch (error) {
      setValidationState('invalid');
      setValidationMessage('Error al validar código');
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
    
    validationTimeoutRef.current = setTimeout(() => {
      validateCode(newValue);
    }, 500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (validationState === 'valid' || !onValidate) {
        onChange(localValue);
      }
    }
  };

  const handleBlur = () => {
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  const handleClear = () => {
    setLocalValue('');
    setValidationState(null);
    setValidationMessage('');
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
    onChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    setCameraError('');
    
    try {
      // Importar dinámicamente html5-qrcode
      const { Html5Qrcode } = await import('html5-qrcode');
      
      const scanner = new Html5Qrcode("barcode-reader");
      scannerRef.current = scanner;
      
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          setLocalValue(decodedText);
          onChange(decodedText);
          validateCode(decodedText);
          stopCamera();
        },
        (errorMessage) => {
          // Ignorar errores de escaneo continuo
        }
      );
    } catch (error) {
      console.error('Error al iniciar cámara:', error);
      setCameraError('No se pudo acceder a la cámara. Verificá los permisos.');
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (error) {
        console.error('Error al detener cámara:', error);
      }
    }
    setShowCamera(false);
  };

  const getValidationIcon = () => {
    switch (validationState) {
      case 'validating':
        return <Loader2 size={16} className="text-neutral-400 animate-spin" />;
      case 'valid':
        return <Check size={16} className="text-green-500" />;
      case 'invalid':
        return <X size={16} className="text-red-500" />;
      default:
        return null;
    }
  };

  const getValidationColor = () => {
    switch (validationState) {
      case 'valid':
        return 'border-green-500 focus:border-green-500 focus:ring-green-500';
      case 'invalid':
        return 'border-red-500 focus:border-red-500 focus:ring-red-500';
      default:
        return 'border-neutral-200 dark:border-gray-600 focus:border-brand-cyan dark:focus:border-cyan-400 focus:ring-brand-cyan dark:focus:ring-cyan-400';
    }
  };

  return (
    <div className="space-y-2">
      {/* Input + Botón Cámara */}
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            className={`w-full px-4 py-3 pr-12 bg-neutral-50 dark:bg-gray-700 border rounded-lg text-sm font-bold text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 transition-all ${getValidationColor()}`}
            placeholder={placeholder}
            value={localValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            disabled={disabled}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {localValue && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="text-neutral-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                title="Limpiar código"
              >
                <X size={16} />
              </button>
            )}
            {getValidationIcon()}
          </div>
        </div>
        
        <button
          type="button"
          onClick={startCamera}
          disabled={disabled}
          className="px-4 py-3 bg-brand-cyan hover:bg-cyan-400 text-black font-bold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera size={18} />
          <span className="hidden sm:inline">Cámara</span>
        </button>
      </div>

      {/* Mensaje de Validación */}
      {validationMessage && (
        <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
          validationState === 'valid' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : validationState === 'invalid'
            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
        }`}>
          {validationState === 'valid' ? (
            <Check size={16} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          ) : validationState === 'invalid' ? (
            <X size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          )}
          <span className={`font-bold ${
            validationState === 'valid' 
              ? 'text-green-600 dark:text-green-400' 
              : validationState === 'invalid'
              ? 'text-red-600 dark:text-red-400'
              : 'text-yellow-600 dark:text-yellow-400'
          }`}>
            {validationMessage}
          </span>
        </div>
      )}

      {/* Guía Visual */}
      <p className="text-[9px] text-neutral-400 dark:text-gray-500 flex items-center gap-1">
        <span>💡</span>
        <span>Escaneá con la pistola o tocá el botón de cámara</span>
      </p>

      {/* Modal de Cámara */}
      <Modal
        isOpen={showCamera}
        onClose={stopCamera}
        title="Escanear Código de Barras"
        size="medium"
      >
        <div className="space-y-4">
          {cameraError ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-600 dark:text-red-400 text-sm font-bold">{cameraError}</p>
              <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                Asegurate de dar permisos de cámara al navegador.
              </p>
            </div>
          ) : (
            <>
              <div 
                id="barcode-reader" 
                className="w-full rounded-xl overflow-hidden bg-black"
                style={{ minHeight: '300px' }}
              />
              <p className="text-center text-sm text-neutral-500 dark:text-gray-400">
                Apuntá la cámara al código de barras
              </p>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default BarcodeScanner;

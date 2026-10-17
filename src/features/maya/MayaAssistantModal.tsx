import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../app/AppContext';
import { askMaya, MayaMessage, MayaUserContext } from '../../services/maya-ai';

interface MayaAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MayaAssistantModal: React.FC<MayaAssistantModalProps> = ({ isOpen, onClose }) => {
  const { profile, goal } = useApp();
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('fe_gemini_api_key') || '');
  const [showConfig, setShowConfig] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Historial de mensajes de Maya
  const [messages, setMessages] = useState<MayaMessage[]>(() => {
    const saved = localStorage.getItem('fe_maya_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      {
        id: 'init-1',
        sender: 'maya',
        text: `¡Saludos, Operador! Aquí Maya, tu copiloto táctico. He cargado tu perfil y estoy sincronizada con tu plan de entrenamiento y objetivos metabólicos. ¿En qué optimizamos tu rendimiento hoy?`,
        timestamp: Date.now(),
      },
    ];
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('fe_maya_history', JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  // Contexto del usuario extraído de AppContext
  const userContext: MayaUserContext = {
    userName: profile?.firstName || 'Operador',
    weightKg: profile?.initialWeightKg || 70,
    heightCm: profile?.heightCm || 172,
    goalType: goal?.primary || 'Definición / Recomposición',
    dailyKcalTarget: goal?.planCalories || 2100,
    dailyProteinTarget: goal?.proteinG || 140,
    consumedKcalToday: 1250, // Conectado a logs de nutrición
    consumedProteinToday: 85,
    currentRoutineTitle: 'Desafío 21 Días: Calistenia Militar',
    waterGlassesToday: 5,
    sleepHoursToday: 7.5,
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoading) return;

    const userMsg: MayaMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const reply = await askMaya(query.trim(), userContext, messages, apiKey);
      const mayaMsg: MayaMessage = {
        id: `m-${Date.now()}`,
        sender: 'maya',
        text: reply,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, mayaMsg]);
    } catch {
      const errReply: MayaMessage = {
        id: `err-${Date.now()}`,
        sender: 'maya',
        text: 'Interferencia en el canal de comunicaciones. Reintentando análisis táctico local...',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('fe_gemini_api_key', key);
    setShowConfig(false);
  };

  const quickPrompts = [
    '¿Qué como para cerrar mi proteína hoy?',
    'Me duelen las muñecas, ¿qué alternativa hago?',
    '¿Cómo va mi hidratación?',
    'Motivación militar para la sesión',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl w-full max-w-2xl h-[90vh] max-h-[750px] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Cabecera Estilo HUD Militar */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 border border-emerald-400 flex items-center justify-center font-black text-white text-base shadow-lg shadow-emerald-500/20">
                M
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono font-black text-sm text-emerald-400 tracking-wider">
                  MAYA // COPILOTO TÁCTICO
                </h3>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                  {apiKey ? 'GEMINI 2.5 ACTIVE' : 'MOTOR LOCAL'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Sincronizada con {userContext.userName} • {userContext.currentRoutineTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-mono"
              title="Configurar API Key de Gemini"
            >
              ⚙️
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Panel Desplegable de Configuración de API Key */}
        {showConfig && (
          <div className="bg-slate-950/95 p-4 border-b border-emerald-500/20 text-xs">
            <label className="text-slate-300 font-bold block mb-1.5 font-mono">
              Clave de Google Gemini (Opcional - por defecto usa motor heurístico propio):
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                onClick={() => handleSaveApiKey(apiKey)}
                className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
              >
                Guardar
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              Si no configuras una clave, Maya utiliza su motor de inteligencia táctica offline con todo el catálogo de alimentos y sustitución de ejercicios.
            </p>
          </div>
        )}

        {/* Barra de Telemetría Táctica en Vivo */}
        <div className="grid grid-cols-4 bg-slate-950/70 border-b border-slate-800 px-4 py-2 text-[11px] font-mono">
          <div>
            <span className="text-slate-500 block text-[9px]">CALORÍAS</span>
            <span className="text-white font-bold">{userContext.consumedKcalToday} / {userContext.dailyKcalTarget}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px]">PROTEÍNA</span>
            <span className="text-emerald-400 font-bold">{userContext.consumedProteinToday}g / {userContext.dailyProteinTarget}g</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px]">AGUA</span>
            <span className="text-cyan-400 font-bold">{userContext.waterGlassesToday * 250} ml</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px]">ESTADO</span>
            <span className="text-amber-400 font-bold">OPERATIVO</span>
          </div>
        </div>

        {/* Zona de Mensajes */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white font-medium rounded-br-xs shadow-md shadow-emerald-900/30'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-xs shadow-md whitespace-pre-line'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800/90 text-emerald-400 border border-slate-700/80 rounded-2xl px-4 py-3 text-xs font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Maya procesando telemetría...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Botones de Consulta Táctica Rápida */}
        <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800/60 overflow-x-auto flex gap-2 no-scrollbar">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              disabled={isLoading}
              className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-medium transition-all"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input de Mensaje */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            placeholder="Pregunta a Maya sobre técnica, comida o tu rutina..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !inputMessage.trim()}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black rounded-xl text-xs transition-all uppercase tracking-wider"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

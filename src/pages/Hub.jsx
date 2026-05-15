import React from 'react';
import { LogIn, Instagram, Facebook, MessageCircle } from 'lucide-react';

// TODO: Completar con las URLs reales de las redes sociales
const INSTAGRAM_URL = 'https://www.instagram.com/push_sportsalta?igsh=MWhwejA1dmIyZ2YzOQ=='; // TODO: https://instagram.com/pushsport_salta
const FACEBOOK_URL = ''; // TODO: https://facebook.com/pushsportsalta
const WHATSAPP_URL = ''; // TODO: https://wa.me/5493871234567

const Hub = () => {
    const links = [
        {
            icon: LogIn,
            title: 'Acceder al Sistema',
            description: 'Ingresá a la plataforma de gestión',
            url: 'https://push-sports-front.onrender.com/',
            color: 'cyan',
            enabled: true
        },
        {
            icon: Instagram,
            title: 'Instagram',
            description: '@pushsport_salta',
            url: INSTAGRAM_URL,
            color: 'pink',
            enabled: !!INSTAGRAM_URL
        },
        {
            icon: Facebook,
            title: 'Facebook',
            description: 'Push Sport Salta',
            url: FACEBOOK_URL,
            color: 'blue',
            enabled: !!FACEBOOK_URL
        },
        {
            icon: MessageCircle,
            title: 'WhatsApp',
            description: 'Contactanos',
            url: WHATSAPP_URL,
            color: 'green',
            enabled: !!WHATSAPP_URL
        }
    ];

    const getColorClasses = (color, enabled) => {
        if (!enabled) {
            return 'bg-neutral-800/50 border-neutral-700 cursor-not-allowed opacity-50';
        }
        
        const colors = {
            cyan: 'bg-brand-cyan/10 border-brand-cyan/30 hover:bg-brand-cyan hover:border-brand-cyan group-hover:text-black',
            pink: 'bg-pink-500/10 border-pink-500/30 hover:bg-pink-500 hover:border-pink-500',
            blue: 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500 hover:border-blue-500',
            green: 'bg-green-500/10 border-green-500/30 hover:bg-green-500 hover:border-green-500'
        };
        return colors[color] || colors.cyan;
    };

    const getIconColor = (color) => {
        const colors = {
            cyan: 'text-brand-cyan',
            pink: 'text-pink-400',
            blue: 'text-blue-400',
            green: 'text-green-400'
        };
        return colors[color] || colors.cyan;
    };

    const handleClick = (link) => {
        if (!link.enabled) {
            return;
        }
        window.open(link.url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="min-h-screen bg-[#07070a] flex flex-col items-center justify-center relative overflow-hidden">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap'); .font-sport { font-family: 'Oswald', sans-serif; }`}</style>

            {/* Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <img src="/fondo.jpeg" className="w-full h-full object-cover opacity-[0.07] scale-110 blur-sm" alt="" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-[#07070a]/80 to-black" />
                {/* Glow orbs */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-brand-cyan/5 blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-md px-4 py-12 flex flex-col items-center gap-8">
                {/* Brand */}
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-2 shadow-[0_0_40px_rgba(0,229,255,0.25)]">
                        <img src="/icono.jpeg" alt="PushSport" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-sport uppercase text-white leading-[0.95] m-0 break-words hyphens-auto">
                        Conectá con <br /><span className="text-brand-cyan italic">Push Sport</span>
                    </h1>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500 mt-1">
                        — Enlaces Oficiales —
                    </span>
                </div>

                {/* Links */}
                <div className="w-full space-y-4">
                    {links.map((link, index) => {
                        const Icon = link.icon;
                        return (
                            <button
                                key={index}
                                onClick={() => handleClick(link)}
                                disabled={!link.enabled}
                                className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 group ${getColorClasses(link.color, link.enabled)} ${
                                    link.enabled ? 'hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(0,229,255,0.2)]' : ''
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl ${link.enabled ? 'bg-white/10' : 'bg-neutral-700/30'} flex items-center justify-center flex-shrink-0 transition-all ${
                                        link.enabled ? 'group-hover:bg-white/20' : ''
                                    }`}>
                                        <Icon 
                                            size={24} 
                                            className={`${link.enabled ? getIconColor(link.color) : 'text-neutral-600'} transition-colors ${
                                                link.enabled ? 'group-hover:text-white' : ''
                                            }`} 
                                        />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className={`font-sport text-lg uppercase leading-none m-0 transition-colors ${
                                            link.enabled ? 'text-white group-hover:text-white' : 'text-neutral-600'
                                        }`}>
                                            {link.title}
                                        </p>
                                        <p className={`text-xs font-bold uppercase tracking-wider mt-1 m-0 transition-colors ${
                                            link.enabled ? 'text-neutral-400 group-hover:text-white/80' : 'text-neutral-700'
                                        }`}>
                                            {link.enabled ? link.description : 'Próximamente'}
                                        </p>
                                    </div>
                                    {link.enabled && (
                                        <div className="flex-shrink-0">
                                            <svg 
                                                width="20" 
                                                height="20" 
                                                viewBox="0 0 24 24" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                strokeWidth="2" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round"
                                                className="text-neutral-500 group-hover:text-white transition-all group-hover:translate-x-1"
                                            >
                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                                <polyline points="12 5 19 12 12 19"></polyline>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 leading-relaxed">
                        © 2026 Push Sport Salta<br />
                        Sistema de Gestión Profesional
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Hub;

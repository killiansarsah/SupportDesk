import { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { Language } from '../types';

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'tw', name: 'Twi', flag: '🇬🇭' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'zh', name: '中文', flag: '🇨🇳' }
];

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  compact?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  currentLanguage, 
  onLanguageChange, 
  compact = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentLang = LANGUAGES.find(lang => lang.code === currentLanguage) || LANGUAGES[0];

  const handleLanguageSelect = (langCode: string) => {
    onLanguageChange(langCode);
    setIsOpen(false);
  };

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
        >
          <Globe className="w-4 h-4" />
          <span className="text-lg">{currentLang.flag}</span>
          <span className="text-sm">{currentLang.code.toUpperCase()}</span>
        </button>

        {isOpen && (
          <div className="absolute top-full mt-2 right-0 w-48 backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl shadow-xl py-2 z-50">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className="w-full flex items-center gap-3 px-4 py-2 text-white hover:bg-white/10 transition-colors"
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="flex-1 text-left text-sm">{lang.name}</span>
                {lang.code === currentLanguage && (
                  <Check className="w-4 h-4 text-green-400" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Language Settings</h3>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            onClick={() => handleLanguageSelect(lang.code)}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              lang.code === currentLanguage
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
            }`}
          >
            <span className="text-2xl">{lang.flag}</span>
            <div className="flex-1 text-left">
              <p className="font-medium">{lang.name}</p>
              <p className="text-xs opacity-70">{lang.code.toUpperCase()}</p>
            </div>
            {lang.code === currentLanguage && (
              <Check className="w-5 h-5 text-green-400" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-blue-300 text-sm">
          <Globe className="w-4 h-4 inline mr-2" />
          Language changes will apply to the interface, templates, and canned responses.
        </p>
      </div>
    </div>
  );
};

export default LanguageSelector;
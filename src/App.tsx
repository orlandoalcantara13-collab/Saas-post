import React, { useState, useRef } from 'react';
import { 
  Menu, 
  Plus, 
  MapPin, 
  Tag, 
  ChevronRight, 
  ArrowLeft, 
  Image as ImageIcon, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Facebook, 
  Sparkles, 
  Zap, 
  Edit2, 
  Share2, 
  Heart, 
  MessageCircle, 
  Rocket, 
  UploadCloud, 
  Layers, 
  Eye, 
  Grid,
  X,
  Loader2
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { Toaster, toast } from 'sonner';

// Initialize Gemini API lazily to prevent crashes if key is missing
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch (e) {
  console.error("Failed to initialize Gemini API:", e);
}

// --- Shared Components ---

const Header = ({ title, leftIcon, onLeftClick, rightAvatar }: any) => (
  <header className="flex items-center justify-between px-6 py-4 bg-[#f8f9fa] sticky top-0 z-10">
    <button onClick={onLeftClick} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
      {leftIcon}
    </button>
    <h1 className="text-xl font-bold text-gray-900">{title}</h1>
    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer" onClick={() => toast.info('Perfil do usuário em breve!')}>
      <img src={rightAvatar || "https://i.pravatar.cc/150?img=11"} alt="Usuário" className="w-full h-full object-cover" />
    </div>
  </header>
);

const BottomNav = ({ activeTab, onTabChange }: any) => {
  const tabs = [
    { id: 'upload', icon: <Plus className="w-6 h-6" />, label: 'Upload' },
    { id: 'platforms', icon: <Layers className="w-6 h-6" />, label: 'Plataformas' },
    { id: 'preview', icon: <Eye className="w-6 h-6" />, label: 'Prévia' },
    { id: 'library', icon: <Grid className="w-6 h-6" />, label: 'Biblioteca' },
  ];

  return (
    <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-20 pb-safe">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              isActive ? 'text-violet-500 bg-violet-50' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {isActive && tab.id === 'upload' ? (
              <div className="bg-violet-500 text-white rounded-full p-1">
                <Plus className="w-5 h-5" />
              </div>
            ) : (
              tab.icon
            )}
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

const Toggle = ({ checked, onChange }: any) => (
  <button
    onClick={onChange}
    className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out flex ${
      checked ? 'bg-violet-500 justify-end' : 'bg-gray-200 justify-start'
    }`}
  >
    <div className="w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200" />
  </button>
);

// --- Screens ---

const UploadScreen = ({ 
  onNext, 
  onLibraryClick,
  caption, 
  setCaption, 
  image, 
  setImage,
  base64Image,
  setBase64Image,
  tone,
  setTone
}: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(URL.createObjectURL(file));
        // Extract base64 data without the data:image/... prefix
        const base64String = (reader.result as string).split(',')[1];
        setBase64Image({
          data: base64String,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] pb-24">
      <Header 
        title="Digital Atelier" 
        leftIcon={<Menu className="w-6 h-6" />} 
        onLeftClick={() => toast.info('Menu em breve!')}
      />
      
      <main className="px-6 pt-4 flex-1">
        <div className="mb-8">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Novo Post</h2>
          <p className="text-gray-500 text-lg">Compartilhe sua mais recente obra-prima com o mundo.</p>
        </div>

        {/* Upload Area */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
          accept="image/*" 
          className="hidden" 
        />
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-violet-200 bg-violet-50/50 rounded-[2rem] p-8 flex flex-col items-center justify-center mb-8 cursor-pointer hover:bg-violet-50 transition-colors relative overflow-hidden"
        >
          {image ? (
            <img src={image} alt="Upload preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />
          ) : null}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-4">
              <div className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center text-white shadow-md shadow-violet-500/30">
                <Plus className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {image ? 'Trocar imagem' : 'Fazer upload de imagens'}
            </h3>
            <p className="text-sm text-gray-500">Arraste e solte ou clique para procurar</p>
          </div>
        </div>

        {/* Tone Selection */}
        <div className="mb-6">
          <label className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-3 block">Tom de Voz da IA</label>
          <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {['Profissional', 'Descontraído', 'Inspirador', 'Focado em Vendas', 'Direto'].map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  tone === t 
                    ? 'bg-violet-500 text-white shadow-sm shadow-violet-500/30' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Caption */}
        <div className="mb-6">
          <label className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-3 block">Legenda</label>
          <textarea 
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full bg-white rounded-2xl p-5 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none shadow-sm border border-gray-100"
            rows={4}
            placeholder="Escreva algo inspirador..."
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-8">
          <button onClick={() => toast.info('Integração com mapas em breve!')} className="w-full bg-gray-100 hover:bg-gray-200 transition-colors rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-violet-600" />
              <span className="font-medium text-gray-900">Adicionar Localização</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button onClick={() => toast.info('Busca de criadores em breve!')} className="w-full bg-gray-100 hover:bg-gray-200 transition-colors rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Tag className="w-5 h-5 text-violet-600" />
              <span className="font-medium text-gray-900">Marcar Criadores</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Recent Uploads */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Uploads Recentes</h3>
            <button onClick={onLibraryClick} className="text-violet-600 font-medium text-sm">Ver Biblioteca</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=400&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=400&auto=format&fit=crop"
            ].map((src, i) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-gray-200">
                <img src={src} alt={`Recente ${i}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Primary Action */}
        <button 
          onClick={onNext}
          disabled={!image}
          className={`w-full font-semibold text-lg py-4 rounded-full shadow-lg transition-all active:scale-[0.98] ${
            image 
              ? 'bg-violet-500 hover:bg-violet-600 text-white shadow-violet-500/30' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
          }`}
        >
          Publicar Obra-prima
        </button>
      </main>
    </div>
  );
};

const PlatformsScreen = ({ 
  onBack, 
  onGenerate, 
  platforms, 
  setPlatforms, 
  formats,
  setFormats,
  image,
  isGenerating
}: any) => {
  const togglePlatform = (key: string) => {
    setPlatforms((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectAll = () => {
    setPlatforms({
      instagram: true,
      linkedin: true,
      twitter: true,
      facebook: true
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] pb-24">
      <Header 
        title="Selecionar Plataformas" 
        leftIcon={<ArrowLeft className="w-6 h-6" />} 
        onLeftClick={onBack}
      />
      
      <main className="px-6 pt-4 flex-1">
        <label className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-3 block">Ativo Carregado</label>
        <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-8 shadow-sm bg-gray-200">
          {image ? (
            <img 
              src={image} 
              alt="Ativo carregado" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Nenhuma imagem
            </div>
          )}
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
            <ImageIcon className="w-3.5 h-3.5 text-violet-600" />
            <span className="text-[10px] font-bold text-violet-600 tracking-wide">IMAGEM</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Escolher Destinos</h2>
          <button onClick={selectAll} className="text-violet-600 font-medium text-sm">Selecionar Todos</button>
        </div>

        <div className="space-y-4 mb-8">
          {/* Instagram */}
          <div className="bg-white rounded-2xl p-5 flex flex-col shadow-sm border border-gray-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white shadow-sm">
                  <Instagram className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Instagram</h3>
                </div>
              </div>
              <Toggle checked={platforms.instagram} onChange={() => togglePlatform('instagram')} />
            </div>
            {platforms.instagram && (
              <div className="flex flex-wrap gap-2 mt-2">
                {['Post no Feed', 'Carrossel', 'Reels'].map(fmt => (
                  <button 
                    key={fmt}
                    onClick={() => setFormats((prev: any) => ({...prev, instagram: fmt}))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${formats.instagram === fmt ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* LinkedIn */}
          <div className="bg-white rounded-2xl p-5 flex flex-col shadow-sm border border-gray-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0077b5] flex items-center justify-center text-white shadow-sm">
                  <Linkedin className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">LinkedIn</h3>
                </div>
              </div>
              <Toggle checked={platforms.linkedin} onChange={() => togglePlatform('linkedin')} />
            </div>
            {platforms.linkedin && (
              <div className="flex flex-wrap gap-2 mt-2">
                {['Atualização Profissional', 'Artigo Curto', 'Carrossel (PDF)'].map(fmt => (
                  <button 
                    key={fmt}
                    onClick={() => setFormats((prev: any) => ({...prev, linkedin: fmt}))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${formats.linkedin === fmt ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* X (Twitter) */}
          <div className="bg-white rounded-2xl p-5 flex flex-col shadow-sm border border-gray-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white shadow-sm">
                  <X className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">X</h3>
                </div>
              </div>
              <Toggle checked={platforms.twitter} onChange={() => togglePlatform('twitter')} />
            </div>
            {platforms.twitter && (
              <div className="flex flex-wrap gap-2 mt-2">
                {['Thread', 'Tweet Único'].map(fmt => (
                  <button 
                    key={fmt}
                    onClick={() => setFormats((prev: any) => ({...prev, twitter: fmt}))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${formats.twitter === fmt ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Facebook */}
          <div className="bg-white rounded-2xl p-5 flex flex-col shadow-sm border border-gray-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#1877F2] flex items-center justify-center text-white shadow-sm">
                  <Facebook className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Facebook</h3>
                </div>
              </div>
              <Toggle checked={platforms.facebook} onChange={() => togglePlatform('facebook')} />
            </div>
            {platforms.facebook && (
              <div className="flex flex-wrap gap-2 mt-2">
                {['Post da Página', 'Story', 'Post em Grupo'].map(fmt => (
                  <button 
                    key={fmt}
                    onClick={() => setFormats((prev: any) => ({...prev, facebook: fmt}))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${formats.facebook === fmt ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Info Box */}
        <div className="bg-violet-50 rounded-2xl p-5 flex items-start gap-4 mb-8 border border-violet-100">
          <Sparkles className="w-6 h-6 text-violet-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Otimização por IA Ativa</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Nosso motor adaptará automaticamente o tom e a formatação do seu conteúdo para o público único de cada plataforma selecionada.
            </p>
          </div>
        </div>

        {/* Primary Action */}
        <button 
          onClick={onGenerate}
          disabled={isGenerating || !Object.values(platforms).some(Boolean)}
          className={`w-full font-semibold text-lg py-4 rounded-full shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
            isGenerating || !Object.values(platforms).some(Boolean)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
              : 'bg-violet-500 hover:bg-violet-600 text-white shadow-violet-500/30'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Gerando...</span>
            </>
          ) : (
            <>
              <span>Gerar Posts</span>
              <Zap className="w-5 h-5 fill-current" />
            </>
          )}
        </button>
      </main>
    </div>
  );
};

const PreviewScreen = ({ generatedPosts, setGeneratedPosts, image, platforms }: any) => {
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<any>(null);

  const handleEditClick = (platform: string, content: any) => {
    if (editingPlatform === platform) {
      setGeneratedPosts((prev: any) => ({ ...prev, [platform]: editContent }));
      setEditingPlatform(null);
      toast.success('Texto atualizado!');
    } else {
      setEditingPlatform(platform);
      setEditContent(content);
    }
  };

  const handleEditClickTwitter = () => {
    if (editingPlatform === 'twitter') {
      setGeneratedPosts((prev: any) => ({ ...prev, twitter: editContent.split('\\n\\n---\\n\\n') }));
      setEditingPlatform(null);
      toast.success('Thread atualizada!');
    } else {
      setEditingPlatform('twitter');
      setEditContent((generatedPosts?.twitter || []).join('\\n\\n---\\n\\n'));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] pb-24 relative">
      <Header 
        title="Digital Atelier" 
        leftIcon={<Menu className="w-6 h-6" />} 
      />
      
      <main className="px-6 pt-4 flex-1">
        <div className="mb-8">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Seus Posts</h2>
          <p className="text-gray-500 text-lg">Conteúdo de alta performance gerado para seu ecossistema digital.</p>
        </div>

        <div className="space-y-6">
          {/* Instagram Card */}
          {platforms.instagram && (
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Instagram</p>
                    <h3 className="font-bold text-gray-900 leading-tight">Vitrine<br/>Visual</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEditClick('instagram', generatedPosts?.instagram)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" /> {editingPlatform === 'instagram' ? 'Salvar' : 'Editar'}
                  </button>
                  <button onClick={() => toast.success('Pronto para compartilhar no Instagram! 📸')} className="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors shadow-sm shadow-violet-500/30">
                    <Share2 className="w-3.5 h-3.5" /> Compartilhar
                  </button>
                </div>
              </div>
              
              <div className="w-full aspect-square rounded-2xl overflow-hidden mb-4 bg-gray-200">
                {image && <img src={image} alt="Instagram post" className="w-full h-full object-cover" />}
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 relative">
                <span className="text-4xl text-violet-200 absolute top-2 left-3 font-serif">"</span>
                {editingPlatform === 'instagram' ? (
                  <textarea 
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full bg-white border border-violet-200 rounded-xl p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 min-h-[120px] relative z-10"
                  />
                ) : (
                  <p className="text-gray-700 italic relative z-10 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
                    {generatedPosts?.instagram || '"Entrando no futuro da criação digital. As ferramentas estão evoluindo, e nós também. 🚀✨\\n\\n#DigitalAtelier #CreativeTech #FutureDesign"'}
                  </p>
                )}
                <div className="flex items-center gap-4 text-gray-500 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 fill-current text-gray-400" /> 2.4k
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 fill-current text-gray-400" /> 142
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LinkedIn Card */}
          {platforms.linkedin && (
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0077b5] flex items-center justify-center text-white">
                    <Linkedin className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">LinkedIn</p>
                    <h3 className="font-bold text-gray-900 leading-tight">Liderança de<br/>Pensamento</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEditClick('linkedin', generatedPosts?.linkedin)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" /> {editingPlatform === 'linkedin' ? 'Salvar' : 'Editar'}
                  </button>
                  <button onClick={() => toast.success('Pronto para compartilhar no LinkedIn! 💼')} className="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors shadow-sm shadow-violet-500/30">
                    <Share2 className="w-3.5 h-3.5" /> Compartilhar
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-5 mb-4">
                {editingPlatform === 'linkedin' ? (
                  <textarea 
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full bg-white border border-violet-200 rounded-xl p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 min-h-[150px] mb-4"
                  />
                ) : (
                  <p className="text-gray-800 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                    {generatedPosts?.linkedin || 'A intersecção da IA e da criatividade humana não é uma ameaça; é um renascimento.\\n\\nPassei a última semana experimentando a nova suíte Digital Atelier, e os resultados são transformadores. Ao automatizar os aspectos mecânicos do gerenciamento social, nos libertamos para focar no "porquê" por trás do design.\\n\\nConfira meu estudo de caso mais recente sobre como a UI generativa está moldando a próxima década da identidade de marca.'}
                  </p>
                )}
                <div className="w-full h-40 rounded-xl overflow-hidden bg-gray-200">
                  {image && <img src={image} alt="LinkedIn post asset" className="w-full h-full object-cover" />}
                </div>
              </div>
            </div>
          )}

          {/* Twitter Card */}
          {platforms.twitter && (
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white">
                    <X className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Twitter / X</p>
                    <h3 className="font-bold text-gray-900 leading-tight">Thread<br/>Rápida</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start">
                  <button onClick={handleEditClickTwitter} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" /> {editingPlatform === 'twitter' ? 'Salvar' : 'Editar'}
                  </button>
                  <button onClick={() => toast.success('Pronto para tuitar! 🐦')} className="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors shadow-sm shadow-violet-500/30">
                    <Share2 className="w-3.5 h-3.5" /> Compartilhar
                  </button>
                </div>
              </div>
              
              <div className="relative">
                {editingPlatform === 'twitter' ? (
                  <div className="mb-6 relative z-10">
                    <p className="text-xs text-gray-500 mb-2">Edite a thread (separe os tweets com ---)</p>
                    <textarea 
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full bg-white border border-violet-200 rounded-xl p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 min-h-[150px]"
                    />
                  </div>
                ) : (
                  <>
                    {/* Thread Line */}
                    <div className="absolute left-5 top-12 bottom-12 w-0.5 bg-gray-200"></div>
                    
                    {/* Tweet 1 */}
                    <div className="flex gap-3 mb-6 relative z-10">
                      <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="w-10 h-10 rounded-full border-2 border-white shrink-0" />
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-bold text-gray-900 text-sm">Creator Studio</span>
                          <span className="text-gray-500 text-sm">@atelier_digital · 2h</span>
                        </div>
                        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                          {generatedPosts?.twitter?.[0] || '1/ Sistemas de design não são mais apenas para desenvolvedores. Em 2024, eles são o motor para o dimensionamento de conteúdo multicanal. 🧵'}
                        </p>
                      </div>
                    </div>

                    {/* Tweet 2 */}
                    <div className="flex gap-3 relative z-10">
                      <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="w-10 h-10 rounded-full border-2 border-white shrink-0" />
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-bold text-gray-900 text-sm">Creator Studio</span>
                          <span className="text-gray-500 text-sm">@atelier_digital · 2h</span>
                        </div>
                        <p className="text-gray-800 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
                          {generatedPosts?.twitter?.[1] || '2/ Acabamos de lançar nossa visualização de "Resultados" para ajudar os criadores a visualizar seu impacto antes de clicar em publicar. O contexto é tudo. 🎨'}
                        </p>
                        <div className="w-full h-32 rounded-xl overflow-hidden bg-gray-200">
                          {image && <img src={image} alt="Tweet asset" className="w-full h-full object-cover" />}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Facebook Card */}
          {platforms.facebook && (
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white">
                    <Facebook className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Facebook</p>
                    <h3 className="font-bold text-gray-900 leading-tight">Post da<br/>Página</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEditClick('facebook', generatedPosts?.facebook)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" /> {editingPlatform === 'facebook' ? 'Salvar' : 'Editar'}
                  </button>
                  <button onClick={() => toast.success('Pronto para compartilhar no Facebook! 👥')} className="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors shadow-sm shadow-violet-500/30">
                    <Share2 className="w-3.5 h-3.5" /> Compartilhar
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-5 mb-4">
                {editingPlatform === 'facebook' ? (
                  <textarea 
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full bg-white border border-violet-200 rounded-xl p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 min-h-[120px] mb-4"
                  />
                ) : (
                  <p className="text-gray-800 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                    {generatedPosts?.facebook || 'Confira nossa mais nova criação! Estamos sempre buscando inovar e trazer o melhor para nossa comunidade. O que vocês acharam? Deixem nos comentários! 👇'}
                  </p>
                )}
                <div className="w-full h-40 rounded-xl overflow-hidden bg-gray-200">
                  {image && <img src={image} alt="Facebook post asset" className="w-full h-full object-cover" />}
                </div>
              </div>
            </div>
          )}

          {Object.values(platforms).every(p => !p) && (
            <div className="text-center text-gray-500 py-10">
              Nenhuma plataforma selecionada para prévia.
            </div>
          )}
        </div>
      </main>

      {/* FAB */}
      <button onClick={() => toast.success('Todos os posts publicados com sucesso! 🚀')} className="fixed bottom-24 right-6 w-14 h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-violet-600/40 transition-transform hover:scale-105 z-30">
        <Rocket className="w-6 h-6" />
      </button>
    </div>
  );
};

const LibraryScreen = ({ history, onSelectHistoryItem }: any) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] pb-24 relative">
      <Header 
        title="Digital Atelier" 
        leftIcon={<Menu className="w-6 h-6" />} 
        onLeftClick={() => toast.info('Menu em breve!')}
      />
      
      <main className="px-6 pt-4 flex-1">
        <div className="mb-8">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Sua Biblioteca</h2>
          <p className="text-gray-500 text-lg">Gerencie seus ativos e posts anteriores.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {history.map((item: any) => (
            <div key={item.id} onClick={() => onSelectHistoryItem(item)} className="aspect-square rounded-2xl overflow-hidden bg-gray-200 relative group cursor-pointer shadow-sm">
              {item.image ? (
                <img src={item.image} alt="Histórico" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-violet-100 text-violet-500 p-4 text-center text-xs font-medium">
                  {item.caption ? item.caption.substring(0, 50) + '...' : 'Post sem imagem'}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-medium text-sm">Ver Post</span>
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <div className="col-span-2 text-center text-gray-500 py-10">
              Nenhum post gerado ainda.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// --- Main App Container ---

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'upload' | 'platforms' | 'preview' | 'library'>('upload');
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<{data: string, mimeType: string} | null>(null);
  const [tone, setTone] = useState('Profissional');
  const [platforms, setPlatforms] = useState({
    instagram: true,
    linkedin: true,
    twitter: false,
    facebook: false
  });
  const [formats, setFormats] = useState({
    instagram: 'Post no Feed',
    linkedin: 'Atualização Profissional',
    twitter: 'Thread',
    facebook: 'Post da Página'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<any>(null);
  const [history, setHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('digital_atelier_history');
    return saved ? JSON.parse(saved) : [];
  });

  const generatePosts = async () => {
    if (!base64Image) return;
    
    if (!ai) {
      toast.error("Chave da API Gemini não configurada. Configure a variável GEMINI_API_KEY no painel da sua hospedagem.");
      return;
    }

    setIsGenerating(true);
    
    try {
      const prompt = `
        Você é um especialista em marketing de mídia social. 
        Analise a imagem fornecida e a legenda base do usuário: "${caption || 'Nenhuma legenda fornecida'}".
        O tom de voz desejado para as postagens é: "${tone}".
        
        Crie postagens otimizadas em PORTUGUÊS DO BRASIL para as seguintes plataformas e formatos:
        ${platforms.instagram ? `- Instagram (Formato: ${formats.instagram}, use emojis, hashtags relevantes)` : ''}
        ${platforms.linkedin ? `- LinkedIn (Formato: ${formats.linkedin}, focado em negócios)` : ''}
        ${platforms.twitter ? `- Twitter/X (Formato: ${formats.twitter}, max 280 caracteres por tweet)` : ''}
        ${platforms.facebook ? `- Facebook (Formato: ${formats.facebook}, focado em comunidade)` : ''}
        
        Retorne APENAS um objeto JSON válido com a seguinte estrutura (inclua apenas as plataformas solicitadas):
        {
          "instagram": "texto do post do instagram",
          "linkedin": "texto do post do linkedin",
          "twitter": ["texto do tweet 1", "texto do tweet 2"],
          "facebook": "texto do post do facebook"
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { text: prompt },
            { inlineData: { data: base64Image.data, mimeType: base64Image.mimeType } }
          ]
        },
        config: {
          responseMimeType: "application/json",
        }
      });

      const resultText = response.text;
      if (resultText) {
        const parsedPosts = JSON.parse(resultText);
        setGeneratedPosts(parsedPosts);
        
        // Save to history
        const newHistoryItem = {
          id: Date.now(),
          date: new Date().toISOString(),
          image: image,
          caption: caption,
          tone: tone,
          formats: formats,
          platforms: platforms,
          posts: parsedPosts
        };
        const updatedHistory = [newHistoryItem, ...history];
        setHistory(updatedHistory);
        localStorage.setItem('digital_atelier_history', JSON.stringify(updatedHistory));

        toast.success('Posts gerados com sucesso!');
        setCurrentScreen('preview');
      }
    } catch (error) {
      console.error("Error generating posts:", error);
      toast.error("Ocorreu um erro ao gerar os posts. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectHistoryItem = (item: any) => {
    setImage(item.image);
    setCaption(item.caption);
    setTone(item.tone);
    setFormats(item.formats || formats);
    setPlatforms(item.platforms || platforms);
    setGeneratedPosts(item.posts);
    setCurrentScreen('preview');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      {/* Mobile Container Simulator */}
      <div className="w-full max-w-md bg-white min-h-screen relative shadow-2xl overflow-x-hidden">
        <Toaster position="top-center" richColors />
        
        {currentScreen === 'upload' && (
          <UploadScreen 
            onNext={() => setCurrentScreen('platforms')} 
            onLibraryClick={() => setCurrentScreen('library')}
            caption={caption}
            setCaption={setCaption}
            image={image}
            setImage={setImage}
            base64Image={base64Image}
            setBase64Image={setBase64Image}
            tone={tone}
            setTone={setTone}
          />
        )}
        
        {currentScreen === 'platforms' && (
          <PlatformsScreen 
            onBack={() => setCurrentScreen('upload')} 
            onGenerate={generatePosts}
            platforms={platforms}
            setPlatforms={setPlatforms}
            formats={formats}
            setFormats={setFormats}
            image={image}
            isGenerating={isGenerating}
          />
        )}
        
        {currentScreen === 'preview' && (
          <PreviewScreen 
            generatedPosts={generatedPosts}
            setGeneratedPosts={setGeneratedPosts}
            image={image}
            platforms={platforms}
          />
        )}

        {currentScreen === 'library' && (
          <LibraryScreen history={history} onSelectHistoryItem={handleSelectHistoryItem} />
        )}

        <BottomNav 
          activeTab={currentScreen} 
          onTabChange={(tab: any) => setCurrentScreen(tab)} 
        />
      </div>
    </div>
  );
}


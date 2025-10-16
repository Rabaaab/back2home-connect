import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'fr' | 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    // Navbar
    'nav.platform': 'Plateforme UEMF',
    'nav.search': 'Rechercher',
    'nav.publish': 'Publier',
    'nav.login': 'Connexion',
    'nav.signup': 'S\'inscrire',
    'nav.profile': 'Mon Profil',
    'nav.logout': 'Déconnexion',
    
    // Home
    'home.hero.badge': 'Plateforme UEMF',
    'home.hero.title': 'Retrouvez vos objets perdus facilement',
    'home.hero.subtitle': 'La communauté étudiante de l\'UEMF s\'entraide pour retrouver les objets perdus. Publiez, recherchez, et redonnez le sourire!',
    'home.hero.publish': 'Publier un objet',
    'home.hero.search': 'Rechercher',
    'home.stats.free': 'Gratuit',
    'home.stats.community': 'Communauté',
    'home.stats.communityDesc': 'Étudiants UEMF',
    'home.stats.easy': 'Facile',
    'home.stats.easyDesc': 'Recherche simple',
    'home.recent.title': 'Publications récentes',
    'home.recent.subtitle': 'Découvrez les derniers objets perdus et trouvés',
    'home.recent.viewAll': 'Voir tout',
    'home.recent.empty': 'Aucune publication pour le moment.',
    
    // Categories
    'category.electronics': 'Électronique',
    'category.documents': 'Documents',
    'category.clothing': 'Vêtements',
    'category.accessories': 'Accessoires',
    'category.books': 'Livres',
    'category.keys': 'Clés',
    'category.other': 'Autre',
    
    // Post types
    'type.lost': 'Perdu',
    'type.found': 'Trouvé',
    
    // Common
    'common.loading': 'Chargement...',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
  },
  en: {
    // Navbar
    'nav.platform': 'UEMF Platform',
    'nav.search': 'Search',
    'nav.publish': 'Publish',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    'nav.profile': 'My Profile',
    'nav.logout': 'Logout',
    
    // Home
    'home.hero.badge': 'UEMF Platform',
    'home.hero.title': 'Find your lost items easily',
    'home.hero.subtitle': 'The UEMF student community helps each other find lost items. Post, search, and bring back smiles!',
    'home.hero.publish': 'Publish an item',
    'home.hero.search': 'Search',
    'home.stats.free': 'Free',
    'home.stats.community': 'Community',
    'home.stats.communityDesc': 'UEMF Students',
    'home.stats.easy': 'Easy',
    'home.stats.easyDesc': 'Simple search',
    'home.recent.title': 'Recent posts',
    'home.recent.subtitle': 'Discover the latest lost and found items',
    'home.recent.viewAll': 'View all',
    'home.recent.empty': 'No posts yet.',
    
    // Categories
    'category.electronics': 'Electronics',
    'category.documents': 'Documents',
    'category.clothing': 'Clothing',
    'category.accessories': 'Accessories',
    'category.books': 'Books',
    'category.keys': 'Keys',
    'category.other': 'Other',
    
    // Post types
    'type.lost': 'Lost',
    'type.found': 'Found',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
  },
  ar: {
    // Navbar
    'nav.platform': 'منصة الجامعة الأوروبية فاس',
    'nav.search': 'بحث',
    'nav.publish': 'نشر',
    'nav.login': 'تسجيل الدخول',
    'nav.signup': 'إنشاء حساب',
    'nav.profile': 'ملفي الشخصي',
    'nav.logout': 'تسجيل الخروج',
    
    // Home
    'home.hero.badge': 'منصة الجامعة الأوروبية فاس',
    'home.hero.title': 'ابحث عن أغراضك المفقودة بسهولة',
    'home.hero.subtitle': 'مجتمع طلاب الجامعة الأوروبية فاس يساعد بعضهم البعض للعثور على الأغراض المفقودة. انشر، ابحث، وأعد الابتسامة!',
    'home.hero.publish': 'نشر غرض',
    'home.hero.search': 'بحث',
    'home.stats.free': 'مجاني',
    'home.stats.community': 'المجتمع',
    'home.stats.communityDesc': 'طلاب الجامعة',
    'home.stats.easy': 'سهل',
    'home.stats.easyDesc': 'بحث بسيط',
    'home.recent.title': 'المنشورات الأخيرة',
    'home.recent.subtitle': 'اكتشف أحدث الأغراض المفقودة والموجودة',
    'home.recent.viewAll': 'عرض الكل',
    'home.recent.empty': 'لا توجد منشورات حتى الآن.',
    
    // Categories
    'category.electronics': 'إلكترونيات',
    'category.documents': 'وثائق',
    'category.clothing': 'ملابس',
    'category.accessories': 'إكسسوارات',
    'category.books': 'كتب',
    'category.keys': 'مفاتيح',
    'category.other': 'أخرى',
    
    // Post types
    'type.lost': 'مفقود',
    'type.found': 'موجود',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'fr';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

import React from 'react';
import { APP_VERSION, UserPersona, USER_ROLES, fixOrphans } from '../types';

interface BiblicalSchoolPanelProps {
  isOpen: boolean;
  onClose: () => void;
  appLanguage: 'pl' | 'en';
  userPersona: UserPersona;
  onUpdateUserPersonaStatus: (status: string) => void;
  onOpenLesson: (title: string) => void;
  onOpenRadioMode: () => void;
  onOpenDashboard: () => void;
}

export const BiblicalSchoolPanel: React.FC<BiblicalSchoolPanelProps> = ({
  isOpen,
  onClose,
  appLanguage,
  userPersona,
  onUpdateUserPersonaStatus,
  onOpenLesson,
  onOpenRadioMode,
  onOpenDashboard,
}) => {
  if (!isOpen) return null;

  const currentRole = userPersona.personalStatus || (appLanguage === 'pl' ? 'Cyfrowy Świadek Chrystusa' : 'Digital Witness of Christ');

  const handleLessonClick = (lessonTitle: string) => {
    onOpenLesson(lessonTitle);
  };

  const LESSON_CATEGORIES = [
    {
      id: 'sanctification',
      title_pl: 'Uświęcenie i Wzrost Duchowy',
      title_en: 'Sanctification and Spiritual Growth',
      lessons: [
        { id: 'prayer', title_pl: 'Moc Modlitwy', title_en: 'The Power of Prayer', icon: '🙏' },
        { id: 'word', title_pl: 'Życie Słowem Bożym', title_en: 'Living by the Word of God', icon: '📖' },
        { id: 'fasting', title_pl: 'Dyscyplina Postu', title_en: 'The Discipline of Fasting', icon: ' fasting' },
        { id: 'holyspirit', title_pl: 'Prowadzenie Ducha Świętego', title_en: 'Guidance of the Holy Spirit', icon: '🕊️' },
      ]
    },
    {
      id: 'theology',
      title_pl: 'Fundamenty Teologiczne',
      title_en: 'Theological Foundations',
      lessons: [
        { id: 'trinity', title_pl: 'Nauka o Trójjedynym Bogu', title_en: 'The Doctrine of the Triune God', icon: '✨' },
        { id: 'christology', title_pl: 'Kim jest Jezus Chrystus?', title_en: 'Who is Jesus Christ?', icon: '👑' },
        { id: 'soteriology', title_pl: 'Zbawienie przez Łaskę', title_en: 'Salvation by Grace', icon: '✝️' },
        { id: 'eschatology', title_pl: 'Czasy Ostateczne', title: 'The End Times', icon: '⏳' },
      ]
    },
    {
      id: 'evangelism',
      title_pl: 'Ewangelizacja i Misja',
      title_en: 'Evangelism and Mission',
      lessons: [
        { id: 'greatcommission', title_pl: 'Wielkie Posłannictwo', title_en: 'The Great Commission', icon: '🌎' },
        { id: 'witnessing', title_pl: 'Skuteczne Świadectwo', title_en: 'Effective Witnessing', icon: '🗣️' },
      ]
    }
  ];

  return (
    <>
      <div
        className={`fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div className={`fixed inset-y-0 right-0 w-full sm:w-[450px] z-[2001] bg-zinc-950 border-l border-white/10 shadow-4xl transform transition-transform duration-500 ease-in-out overflow-hidden flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex justify-between items-center px-8 sm:px-10 pt-8 pb-6 flex-shrink-0 relative z-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter">
              {appLanguage === 'pl' ? 'Szkoła' : 'Biblical'} <span className="text-[#C5A059]">{appLanguage === 'pl' ? 'Biblijna' : 'School'}</span>
            </h2>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">
              Christian Culture v{APP_VERSION}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-zinc-900 rounded-full text-zinc-500 shadow-lg hover:bg-zinc-800 transition-all hover:text-[#C5A059] active:scale-90 border border-zinc-800"
            title={appLanguage === 'pl' ? "Zamknij" : "Close"}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 sm:px-10 pb-10 space-y-8 relative z-10 scrollbar-thin">
          <div className="bg-[#C5A059]/5 rounded-2xl p-5 border border-[#C5A059]/10">
            <p className="text-zinc-400 text-xs italic leading-relaxed">
              {appLanguage === 'pl' ? 'Zanurz się głęboko w Słowo Boże. Każda lekcja jest drogą do większego poznania Chrystusa i wzrostu w wierze.' : 'Dive deep into the Word of God. Each lesson is a path to a greater knowledge of Christ and growth in faith.'}
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{appLanguage === 'pl' ? 'Twój status:' : 'Your status:'} <span className="text-[#C5A059]">{userPersona.personalStatus || (appLanguage === 'pl' ? USER_ROLES[0].pl : USER_ROLES[0].en)}</span></h3>
            <button
              onClick={() => onUpdateUserPersonaStatus((appLanguage === 'pl' ? USER_ROLES[1].pl : USER_ROLES[1].en) as string)}
              className="w-full py-4 bg-[#C5A059] text-black font-black text-xs uppercase tracking-widest rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-all"
            >
              {appLanguage === 'pl' ? 'ZOSTAŃ UCZNIEM JEZUSA CHRYSTUSA' : 'BECOME A DISCIPLE OF JESUS CHRIST'}
            </button>
          </div>

          {LESSON_CATEGORIES.map(category => (
            <div key={category.id} className="space-y-4">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2">
                {appLanguage === 'pl' ? category.title_pl : category.title_en}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {category.lessons.map(lesson => (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonClick(appLanguage === 'pl' ? lesson.title_pl : lesson.title_en)}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-[#C5A059]/50 transition-all group shadow-md"
                  >
                    <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                      {lesson.icon}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-black text-white uppercase tracking-tight group-hover:text-[#C5A059] transition-colors">
                        {appLanguage === 'pl' ? lesson.title_pl : lesson.title_en}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 border-t border-white/5 bg-zinc-900/50 flex-shrink-0">
          <button
            onClick={() => { onClose(); onOpenRadioMode(); }}
            className="w-full py-5 bg-[#C5A059] text-black font-black uppercase tracking-widest rounded-[1.5rem] shadow-2xl text-xs"
          >
            {appLanguage === 'pl' ? 'POWRÓT DO RADIA' : 'BACK TO RADIO'}
          </button>
        </div>
      </div>
    </>
  );
};
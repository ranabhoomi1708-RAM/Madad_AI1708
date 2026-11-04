import React from 'react';
import { 
  Globe, 
  Heart, 
  Handshake, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Utensils, 
  Stethoscope, 
  Home as HomeIcon, 
  Users,
  ShieldCheck,
  CheckCircle2,
  Lock,
  MessageCircle,
  HelpCircle
} from 'lucide-react';

export default function Home({ setActivePage, onCategorySelect }) {
  const categories = [
    {
      id: "education",
      icon: BookOpen,
      title: "School & College",
      badge: "Books, kits & fees",
      desc: "NCERT textbooks, notebooks, school stationery, and tuition guidance for kids who want to keep learning.",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      id: "food_and_essentials",
      icon: Utensils,
      title: "Food & Groceries",
      badge: "Meals & ration kits",
      desc: "Hot cooked meals, monthly flour/rice kits, and daily essentials during job loss or illness.",
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      id: "medical_assistance",
      icon: Stethoscope,
      title: "Medical Guidance",
      badge: "Hospital help & donors",
      desc: "Navigating big government hospitals, finding verified blood donors, and generic pharmacy guidance.",
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      id: "shelter_and_support",
      icon: HomeIcon,
      title: "Safe Shelter",
      badge: "Emergency night stay",
      desc: "Clean overnight bedding, emergency shelter info, blankets in winter, and temporary safety.",
      iconColor: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      id: "community_support",
      icon: Users,
      title: "Elder & Community Care",
      badge: "Companionship & aids",
      desc: "Senior citizens living alone who need hospital escorts, pension paperwork help, or mobility aids.",
      iconColor: "text-rose-600",
      bgColor: "bg-rose-50"
    }
  ];

  const recentStories = [
    {
      initials: "RS",
      name: "Ramesh S.",
      city: "Janakpuri, Delhi",
      need: "9th class NCERT books",
      outcome: "Received textbook kit from Shiksha Sahyog Foundation in 24 hours.",
      tag: "Education",
      tagColor: "bg-blue-50 text-blue-700"
    },
    {
      initials: "FB",
      name: "Fatima B.",
      city: "Aminabad, Lucknow",
      need: "2-week grocery ration kit",
      outcome: "Community kitchen dropped off flour, pulses & oil during family medical crisis.",
      tag: "Food Relief",
      tagColor: "bg-amber-50 text-amber-700"
    },
    {
      initials: "KP",
      name: "Kailash P. (68 yrs)",
      city: "Bapu Nagar, Jaipur",
      need: "Hospital OPD escort & paperwork",
      outcome: "Volunteer Amit accompanied him to SMS Hospital for his monthly eye checkup.",
      tag: "Elder Care",
      tagColor: "bg-rose-50 text-rose-700"
    }
  ];

  return (
    <div className="space-y-20 pb-24">
      
      {/* 1. HERO SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 text-center space-y-6">
        
        {/* Friendly human badge */}
        <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200/80 px-4 py-1.5 rounded-full text-xs font-semibold text-[#ea580c] shadow-xs">
          <span>👋</span>
          <span>Community-run help network · 100% free · Zero ads · No spam</span>
        </div>

        {/* Brand Icon + Heading */}
        <div className="flex items-center justify-center gap-3 select-none pt-2">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-orange-100/70 border border-orange-300 flex items-center justify-center text-[#ea580c] shadow-xs text-2xl font-black">
            🌐
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900">
            <span className="text-[#ea580c]">MADAD</span>{' '}
            <span className="text-[#1e3a8a]">Connect</span>
          </h1>
        </div>

        {/* Conversational Tagline */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight max-w-2xl mx-auto leading-snug">
          Real help from real people near you.
        </h2>

        {/* Warm, human description */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          Stuck with a tough situation? Tell us what you need in plain words. We connect you directly with verified local groups, community volunteers, and neighbours who actually pick up the phone.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setActivePage('request-help')}
            className="flex items-center gap-2 bg-[#ea580c] hover:bg-[#d44a05] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <Handshake className="w-4 h-4" />
            <span>Ask for Help</span>
          </button>

          <button
            onClick={() => setActivePage('give-help')}
            className="flex items-center gap-2 bg-white hover:bg-green-50 border-2 border-[#16a34a] text-[#16a34a] px-8 py-3.5 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <Heart className="w-4 h-4" />
            <span>I Want to Help</span>
          </button>
        </div>

        {/* Friendly micro-reassurances */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            Your phone number stays strictly private
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            No login or complicated paperwork required
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            Backup providers automatically ready if someone's full
          </span>
        </div>

      </section>

      {/* 2. HOW IT WORKS (EXPLAINED LIKE A FRIEND) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="text-center space-y-2">
          <div className="text-xs font-bold text-[#ea580c] uppercase tracking-wider">How it works</div>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            No dead-ends. No unreturned calls.
          </h3>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Traditional directories give you phone numbers and walk away. MADAD stays with you until the problem is actually solved.
          </p>
        </div>

        {/* 3 Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100/70 text-[#ea580c] flex items-center justify-center font-black text-xl">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-base">Speak or type your problem</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Just write what happened in normal everyday language, or record a 30-second voice note. No formal letters or complex proofs needed.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-[#16a34a] flex items-center justify-center font-black text-xl">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-base">We pair you with someone near you</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              We look at your city, PIN code, and what you specifically need, then give you the best verified local contact plus 2 backup options.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100/70 text-[#4f46e5] flex items-center justify-center font-black text-xl">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-base">Closed only when you say so</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Finding a contact isn't success. If someone can't help, our smart backup kicks in. Only your confirmation marks a case resolved.
            </p>
          </div>

        </div>

      </section>

      {/* 3. ASSISTANCE CATEGORIES WITH RELATABLE TOUCHES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/60 pb-4">
          <div>
            <div className="text-xs font-bold text-[#ea580c] uppercase tracking-wider">What we help with</div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Five core areas of support
            </h3>
          </div>
          <p className="text-xs text-slate-500 max-w-xs sm:text-right">
            Pick a category to search verified local organizations or post a quick request.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {categories.map((cat) => {
            const IconComp = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => {
                  if (onCategorySelect) onCategorySelect(cat.id);
                  setActivePage('find-help');
                }}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs hover:shadow-lg hover:border-[#ea580c] transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-2xl ${cat.bgColor} ${cat.iconColor} flex items-center justify-center shadow-xs`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 group-hover:text-[#ea580c]">
                      Explore →
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{cat.title}</h4>
                  <div className="inline-block text-[10px] font-bold text-[#ea580c] bg-orange-50 px-2 py-0.5 rounded-md mb-2">
                    {cat.badge}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{cat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* 4. REAL RECENT RESOLUTIONS (GROUNDED, AUTHENTIC EXAMPLES) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="text-center space-y-1">
          <div className="text-xs font-bold text-[#16a34a] uppercase tracking-wider">Accountability in action</div>
          <h3 className="text-2xl font-extrabold text-slate-900">
            Real outcomes from this week
          </h3>
          <p className="text-xs text-slate-500">
            Every case below was verified resolved directly by the beneficiary.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {recentStories.map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 font-bold text-xs text-slate-700 flex items-center justify-center">
                    {item.initials}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">{item.name}</div>
                    <div className="text-[10px] text-slate-400">{item.city}</div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.tagColor}`}>
                  {item.tag}
                </span>
              </div>

              <div className="text-xs text-slate-700 font-medium">
                Needed: <span className="text-slate-900 font-bold">{item.need}</span>
              </div>

              <div className="text-xs text-emerald-800 bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100 leading-relaxed">
                ✓ {item.outcome}
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* 5. FOUNDER'S / COMMUNITY NOTE (HEARTFELT & HUMAN) */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-orange-100 shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <div className="flex items-center gap-2 text-xs font-bold text-[#ea580c] uppercase tracking-wider">
            <span>💬</span>
            <span>Why we started MADAD</span>
          </div>

          <p className="text-sm sm:text-base text-slate-700 leading-relaxed italic">
            "A while ago, a close friend’s family in Lucknow needed urgent blood donor assistance. We dialed 14 directory numbers found online—9 were dead lines, 4 didn't answer, and 1 was out of capacity. We realized the problem isn't that people don't care; it's that static directories leave vulnerable people in the dark when a call fails. MADAD was created to make sure someone is accountable for the next step until help actually reaches."
          </p>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
            <div className="font-semibold text-slate-800">
              — Built by the student volunteer team at MADAD
            </div>
            <button
              onClick={() => setActivePage('about')}
              className="text-[#ea580c] font-bold hover:underline"
            >
              Read our full story →
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}

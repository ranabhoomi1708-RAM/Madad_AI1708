import React from 'react';
import { ShieldCheck, HeartHandshake, Target, CheckCircle2, Award } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#e47c68]">
          Our Social Purpose
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#173b39] tracking-tight">
          More than finding help.<br />
          <span className="text-[#087c70]">Making help happen.</span>
        </h1>
        <p className="text-base text-[#697875] max-w-2xl mx-auto leading-relaxed">
          MADAD was conceived to solve a critical, real-world failure in social impact: traditional directories show you names, but nobody checks if you ever received assistance.
        </p>
      </div>

      {/* The Core Problem */}
      <div className="bg-white p-8 rounded-3xl border border-[#eeeae1] shadow-xs space-y-4">
        <h2 className="text-xl font-bold text-[#173b39] flex items-center gap-2">
          <Target className="w-5 h-5 text-[#e47c68]" />
          The Problem We Are Solving
        </h2>
        <p className="text-sm text-[#526461] leading-relaxed">
          Across India, individuals and families facing sudden adversity—whether seeking school books for children, emergency dry rations during wage disruption, non-emergency hospital navigation, or emergency shelter—routinely encounter dead ends. Phone numbers listed in static directories go unanswered, organizations have limited intake capacity, and people in distress are left without a clear way forward.
        </p>
        <p className="text-sm text-[#526461] leading-relaxed">
          MADAD replaces static directories with an <strong>active case lifecycle</strong>. If the first provider is full or cannot assist, our smart fallback immediately promotes alternative verified partners, community helpers step in, and the case remains open until the beneficiary explicitly confirms resolution.
        </p>
      </div>

      {/* Four Guiding Principles */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-[#173b39] text-center">
          Our Four Guiding Principles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-[#fbfaf6] border border-[#eeeae1] space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#087c70]/10 text-[#087c70] flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="text-base font-bold text-[#173b39]">
              Finding is not success. Resolving is success.
            </h3>
            <p className="text-xs text-[#697875] leading-relaxed">
              We never count a click, a phone call, or a provider promise as a resolved case. Only the beneficiary's explicit statement that help was received marks a case resolved.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#fbfaf6] border border-[#eeeae1] space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#087c70]/10 text-[#087c70] flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="text-base font-bold text-[#173b39]">
              Every request deserves an answer.
            </h3>
            <p className="text-xs text-[#697875] leading-relaxed">
              When a provider cannot help, the system does not give up. It activates smart fallback, suggesting verified backup options and alerting the community helper pool.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#fbfaf6] border border-[#eeeae1] space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#087c70]/10 text-[#087c70] flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="text-base font-bold text-[#173b39]">
              Dignity & Privacy Guard
            </h3>
            <p className="text-xs text-[#697875] leading-relaxed">
              Vulnerable people should not have their phone numbers or home addresses broadcast on public message boards. We enforce strict privacy masking on all public helper feeds.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#fbfaf6] border border-[#eeeae1] space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#087c70]/10 text-[#087c70] flex items-center justify-center font-bold text-sm">
              04
            </div>
            <h3 className="text-base font-bold text-[#173b39]">
              Explainable, Zero-Paid-Cost Tech
            </h3>
            <p className="text-xs text-[#697875] leading-relaxed">
              Social platforms must be resilient and free of costly API tokens. Our matching engine is 100% deterministic, explainable, and accessible on any device.
            </p>
          </div>
        </div>
      </div>

      {/* Honest Commitment */}
      <div className="bg-[#153b38] text-white p-8 rounded-3xl space-y-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#e47c68]" />
          Transparency & Integrity Commitment
        </h3>
        <p className="text-xs text-[#c2d3ce] leading-relaxed">
          MADAD does not publish fabricated success numbers, fake partner logos, or automated bot interactions. Every metric shown on our dashboard reflects actual records saved in the database.
        </p>
      </div>

    </div>
  );
}

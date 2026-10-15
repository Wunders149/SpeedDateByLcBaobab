import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Mail, Phone } from 'lucide-react';

const faqs = [
  { q: 'How does SpeedDate work?', a: 'SpeedDate is an in-person speed dating event platform. You register for an event, complete a personality questionnaire, and meet people through structured rounds. After the event, our algorithm matches compatible participants.' },
  { q: 'How is matching done?', a: 'Matching is based on a 60-question personality questionnaire across 7 categories. Our weighted compatibility scoring engine calculates mutual scores. Deal-breakers can exclude incompatible pairs. Results are only revealed after the organizer publishes them.' },
  { q: "Is my data private?", a: 'Yes. Your individual questionnaire answers are never shared with other participants. Only compatibility scores and mutual matches are revealed after publication. Contact information is only exchanged with explicit mutual consent.' },
  { q: 'Who can participate?', a: 'Anyone 18 years or older who registers for an event and completes the required questionnaire. Eligibility is confirmed by event organizers.' },
  { q: 'What is the minimum completion requirement?', a: 'You must answer at least 80% of required questions to submit your questionnaire. Missing answers are not counted as disagreement — they simply reduce the data available for scoring.' },
  { q: 'Can I update my answers?', a: 'You can save and edit your draft until you submit. After submission, an organizer must reopen the questionnaire for changes.' },
  { q: 'What happens if a match is not mutual?', a: "A mutual match requires both participants to express interest. Your matches remain private until both parties express interest in each other." },
  { q: 'How do I contact my match?', a: 'Contact exchange happens after mutual matching, with configurable methods: in-app introduction, mutual opt-in, or organizer-mediated.' },
  { q: 'What if I need to withdraw?', a: 'You can withdraw your registration from the dashboard at any time before the event. Contact the organizer if you need to withdraw after the event starts.' },
  { q: 'Is there an age requirement?', a: 'Yes, all participants must be at least 18 years old. Age is verified during registration.' },
  { q: 'How is the compatibility score calculated?', a: 'Scores use weighted category averages (Values 25%, Personality 20%, Communication 15%, Lifestyle 15%, Future Aspirations 10%, Interests 10%, Fun & Spontaneity 5%). Each question contributes a similarity or complementarity score.' },
  { q: 'Can I be matched with someone from a different group?', a: 'Yes, matching preferences and groups are configurable per event by the organizers.' },
];

export function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="text-center">
        <HelpCircle className="mx-auto h-16 w-16 text-rose-500" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
        <p className="mt-2 text-gray-600">Everything you need to know about SpeedDate</p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="rounded-xl border border-rose-100 bg-white shadow-sm"
          >
            <button
              className="flex w-full items-center justify-between p-4 text-left"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <span className="font-medium text-gray-900">{faq.q}</span>
              {openIndex === index ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
            {openIndex === index && (
              <div className="border-t border-gray-100 p-4">
                <p className="text-sm text-gray-600">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-rose-50 p-6 text-center">
        <h3 className="font-semibold text-gray-900">Still have questions?</h3>
        <p className="mt-2 text-sm text-gray-600">
          Can't find the answer you're looking for? Reach out to our support team.
        </p>
        <div className="mt-4 flex justify-center gap-4">
          <a href="mailto:support@speeddate.dev" className="flex items-center gap-2 text-sm font-medium text-rose-600 hover:text-rose-700">
            <Mail className="h-4 w-4" /> support@speeddate.dev
          </a>
          <span className="flex items-center gap-2 text-sm text-gray-500">
            <Phone className="h-4 w-4" /> (555) 123-4567
          </span>
        </div>
      </div>
    </div>
  );
}

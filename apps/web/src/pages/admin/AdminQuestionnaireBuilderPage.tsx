import { useState } from 'react';
import { FileText, Layers, Eye, Check, Clock } from 'lucide-react';

interface Section {
  name: string;
  questionCount: number;
  weight: number;
}

const mockSections: Section[] = [
  { name: 'Values', questionCount: 8, weight: 25 },
  { name: 'Communication', questionCount: 8, weight: 15 },
  { name: 'Personality', questionCount: 10, weight: 20 },
  { name: 'Lifestyle', questionCount: 8, weight: 15 },
  { name: 'Future Aspirations', questionCount: 6, weight: 10 },
  { name: 'Interests', questionCount: 5, weight: 10 },
  { name: 'Fun & Spontaneity', questionCount: 7, weight: 5 },
];

export function AdminQuestionnaireBuilderPage() {
  const [versionName, setVersionName] = useState('v2-draft');
  const [isPublished, setIsPublished] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Questionnaire Builder</h1>
        <div className="flex gap-2">
          <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2">
            <Eye className="h-4 w-4" /> Preview
          </button>
          <button className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 flex items-center gap-2">
            <Check className="h-4 w-4" /> Save Version
          </button>
        </div>
      </div>

      {/* Version Bar */}
      <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <FileText className="h-5 w-5 text-rose-500" />
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-500">Version Name</label>
            <input
              type="text"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {isPublished ? 'Published' : 'Draft'}
            </span>
            <button
              onClick={() => setIsPublished(!isPublished)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              {isPublished ? 'Unpublish' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {mockSections.map((section) => (
          <div key={section.name} className="rounded-xl border border-rose-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Layers className="h-5 w-5 text-rose-400" />
                <div>
                  <p className="font-medium text-gray-900">{section.name}</p>
                  <p className="text-xs text-gray-500">{section.questionCount} questions · {section.weight}% weight</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-500">Drag to reorder</span>
                <button className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

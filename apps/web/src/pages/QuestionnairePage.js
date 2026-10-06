import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
export function QuestionnairePage() {
    const { user } = useAuth();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [eventId, setEventId] = useState(null);
    const { data: eventsData } = useQuery({
        queryKey: ['events'],
        queryFn: () => api('/api/v1/events'),
        enabled: !!user,
    });
    const events = eventsData?.data.events ?? [];
    const selectedEvent = eventId ?? events[0]?.id;
    const { data: questionnaireData, isLoading } = useQuery({
        queryKey: ['questionnaire', selectedEvent],
        queryFn: () => api(`/api/v1/events/${selectedEvent}/questionnaire`),
        enabled: !!selectedEvent,
    });
    const saveDraftMutation = useMutation({
        mutationFn: (answers) => api(`/api/v1/events/${selectedEvent}/questionnaire/draft`, {
            method: 'PUT',
            body: JSON.stringify({ answers }),
        }),
    });
    const submitMutation = useMutation({
        mutationFn: (answers) => api(`/api/v1/events/${selectedEvent}/questionnaire/submit`, {
            method: 'POST',
            body: JSON.stringify({ answers }),
        }),
        onSuccess: () => {
            alert('Questionnaire submitted successfully!');
        },
    });
    if (!user) {
        return (_jsx("div", { className: "rounded-xl bg-yellow-50 p-4 text-yellow-700", children: "Please sign in to access the questionnaire." }));
    }
    if (events.length === 0) {
        return (_jsx("div", { className: "rounded-xl bg-yellow-50 p-4 text-yellow-700", children: "No events available. Please register for an event first." }));
    }
    const questionnaire = questionnaireData?.data.questionnaire;
    const questions = questionnaire?.questions ?? [];
    const question = questions[currentQuestion];
    const handleAnswer = (value) => {
        setAnswers((prev) => ({ ...prev, [question.questionId]: value }));
    };
    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion((prev) => prev + 1);
        }
    };
    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion((prev) => prev - 1);
        }
    };
    const handleSaveDraft = () => {
        const answerList = Object.entries(answers).map(([questionId, value]) => ({
            questionId,
            value,
        }));
        saveDraftMutation.mutate(answerList);
    };
    const handleSubmit = () => {
        const answerList = Object.entries(answers).map(([questionId, value]) => ({
            questionId,
            value,
        }));
        submitMutation.mutate(answerList);
    };
    const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;
    return (_jsxs("div", { className: "mx-auto max-w-2xl space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Questionnaire" }), _jsx("p", { className: "mt-2 text-gray-600", children: "Help us find your perfect match" })] }), events.length > 1 && (_jsx("div", { className: "flex gap-2", children: events.map((event) => (_jsx("button", { onClick: () => setEventId(event.id), className: `rounded-lg px-4 py-2 text-sm font-medium ${selectedEvent === event.id
                        ? 'bg-rose-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`, children: event.name }, event.id))) })), isLoading ? (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-600" }) })) : questions.length === 0 ? (_jsx("div", { className: "rounded-xl bg-yellow-50 p-4 text-yellow-700", children: "No questionnaire available for this event yet." })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "rounded-xl border border-rose-100 bg-white p-4", children: [_jsxs("div", { className: "flex items-center justify-between text-sm text-gray-600", children: [_jsxs("span", { children: ["Question ", currentQuestion + 1, " of ", questions.length] }), _jsxs("span", { children: [Math.round(progress), "%"] })] }), _jsx("div", { className: "mt-2 h-2 rounded-full bg-gray-200", children: _jsx("div", { className: "h-2 rounded-full bg-rose-500 transition-all", style: { width: `${progress}%` } }) })] }), _jsxs("div", { className: "rounded-2xl border border-rose-100 bg-white p-6 shadow-sm", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: question.text }), _jsx("div", { className: "mt-6 space-y-3", children: question.options.map((option) => (_jsx("button", { onClick: () => handleAnswer(option.value ?? option.id), className: `w-full rounded-lg border p-4 text-left transition ${answers[question.questionId] === (option.value ?? option.id)
                                        ? 'border-rose-500 bg-rose-50 text-rose-700'
                                        : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50/50'}`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: option.text }), answers[question.questionId] === (option.value ?? option.id) && (_jsx(Check, { className: "h-5 w-5 text-rose-500" }))] }) }, option.id))) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("button", { onClick: handlePrevious, disabled: currentQuestion === 0, className: "flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50", children: [_jsx(ChevronLeft, { className: "h-4 w-4" }), "Previous"] }), _jsx("button", { onClick: handleSaveDraft, className: "rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50", children: "Save Draft" }), currentQuestion < questions.length - 1 ? (_jsxs("button", { onClick: handleNext, className: "flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600", children: ["Next", _jsx(ChevronRight, { className: "h-4 w-4" })] })) : (_jsxs("button", { onClick: handleSubmit, className: "flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600", children: [_jsx(Check, { className: "h-4 w-4" }), "Submit"] }))] })] }))] }));
}

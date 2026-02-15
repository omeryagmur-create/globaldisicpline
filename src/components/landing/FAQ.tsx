import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
    {
        question: "Is Global Discipline really free?",
        answer: "Yes! Our Free tier includes basic focus timer, weekly stats, and community access. You can upgrade to Pro or Elite for advanced features anytime."
    },
    {
        question: "How does the XP system work?",
        answer: "You earn XP for every minute of focused study. The more you study, the more XP you gain. Higher levels unlock exclusive rewards and features."
    },
    {
        question: "Can I compete with my friends?",
        answer: "Absolutely! You can create or join challenges, compare stats on the leaderboard, and motivate each other to stay consistent."
    },
    {
        question: "What exam systems do you support?",
        answer: "We support 50+ exam systems worldwide including SAT, ACT, AP, IB, A-Levels, IELTS, TOEFL, and many country-specific entrance exams."
    },
    {
        question: "Is my data secure?",
        answer: "Yes, we use enterprise-grade encryption and never share your personal data. Your privacy is our top priority."
    },
    {
        question: "Can I cancel my subscription anytime?",
        answer: "Yes, you can cancel anytime. Your Pro or Elite features will remain active until the end of your billing period."
    }
];

export function FAQ() {
    return (
        <section id="faq" className="container mx-auto px-4 py-24 scroll-mt-16">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                    Frequently Asked Questions
                </h2>
                <p className="text-muted-foreground text-lg">Everything you need to know about Global Discipline</p>
            </div>
            <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-left">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}

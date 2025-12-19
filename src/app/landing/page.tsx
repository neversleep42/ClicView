import {
    Header,
    HeroSection,
    StatsSection,
    FeaturesSection,
    ChannelsSection,
    PricingSection,
    FooterSection,
} from '@/components/landing';

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)]">
            <Header />
            <main className="flex-1">
                <HeroSection />
                <StatsSection />
                <FeaturesSection />
                <ChannelsSection />
                <PricingSection />
            </main>
            <FooterSection />
        </div>
    );
}
